import { useState, useEffect, useMemo } from 'react';
import { FiPlay, FiEdit, FiTrash2, FiUpload, FiEye, FiGrid, FiList, FiCalendar, FiClock, FiBookOpen, FiVideo, FiBriefcase } from 'react-icons/fi';
import Header from '../../../components/admin/management/Header';
import Pagination from '../../../components/admin/management/Pagination';
import AddVideoModal from './AddVideoModal';
import VideoPreviewModal from './VideoPreviewModal';
import { useVideoManagement } from '../../../../application/hooks/useVideoManagement';
import WarningModal from '../../../components/common/WarningModal';
import { ITEMS_PER_PAGE, STATUS_OPTIONS, getTabs } from '../../../../shared/constants/videoManagementConstants';
import { Video, VideoForEdit, Filters } from '../../../../domain/types/management/videomanagement';
import LoadingSpinner from '../../../components/common/LoadingSpinner';

const VideoManagementPage = () => {
  const [viewMode, setViewMode] = useState('table');
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<VideoForEdit | null>(null);
  const [filters, setFilters] = useState<Filters>({ status: 'all', category: '', dateRange: 'all' });
  const [debouncedFilters, setDebouncedFilters] = useState<Filters>({ status: 'all', category: '', dateRange: 'all' });
  const [page, setPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<Video | null>(null);

  useEffect(() => {
    if (searchQuery === debouncedSearchQuery) return;
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, debouncedSearchQuery]);

  useEffect(() => {
    if (JSON.stringify(filters) === JSON.stringify(debouncedFilters)) return;
    const timer = setTimeout(() => {
      setDebouncedFilters(filters);
      setPage(1);
    }, 300);

    return () => clearTimeout(timer);
  }, [filters, debouncedFilters]);

  function slugToDisplayName(slug: string) {
    return slug
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  const normalizedFilters = useMemo(() => {
    return {
      ...debouncedFilters,
      category:
        debouncedFilters.category && debouncedFilters.category !== 'all'
          ? slugToDisplayName(debouncedFilters.category)
          : '',
      status:
        debouncedFilters.status && debouncedFilters.status !== 'all'
          ? slugToDisplayName(debouncedFilters.status)
          : '',
    };
  }, [debouncedFilters]);

  const {
    diplomasData,
    videosData,
    isLoadingDiplomas,
    isLoadingVideos,
    handleSaveVideo,
    handleDeleteVideo,
    fetchVideoById,
  } = useVideoManagement(page, ITEMS_PER_PAGE, normalizedFilters, debouncedSearchQuery);

  const filterOptions = useMemo(() => ({
    status: STATUS_OPTIONS,
    category: (diplomasData?.diplomas || []).map(d => d.category),
  }), [diplomasData?.diplomas]);

  const debouncedFilterChange = (field: string, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetFilters = () => {
    setFilters({ status: 'all', category: '', dateRange: 'all' });
    setSearchQuery('');
  };

  const paginatedVideos = videosData?.videos || [];
  const totalPages = videosData?.totalPages || 1;

  const tabs = getTabs(
    activeTab,
    videosData?.statusCounts
  );

  const handleTabClick = (index: number) => {
    const tabKeys = ['all', 'published', 'drafts'];
    const newActiveTab = tabKeys[index];
    setActiveTab(newActiveTab);

    const statusMap: { [key: string]: string } = {
      'all': 'all',
      'published': 'Published',
      'drafts': 'Draft'
    };

    setFilters(prev => ({
      ...prev,
      status: statusMap[newActiveTab] || 'all'
    }));
  };

  const onSaveVideo = (videoData: FormData | Partial<VideoForEdit>) => {
    handleSaveVideo(videoData);
    setShowAddModal(false);
    setSelectedVideo(null);
  };

  const onDeleteVideo = (video: Video) => {
    setVideoToDelete(video);
    setShowDeleteModal(true);
  };

  const convertVideoForEdit = (video: Video): VideoForEdit => {
    return {
      _id: video.id,
      title: video.title,
      duration: video.duration,
      uploadedAt: video.uploadedAt,
      module: video.module,
      status: video.status,
      diplomaId: video.diplomaId,
      description: video.description,
      videoUrl: video.videoUrl,
    };
  };

  const handleEditVideo = async (video: Video) => {
    try {
      const fetchedVideo = await fetchVideoById(video.id);

      const videoForEdit: VideoForEdit = {
        _id: fetchedVideo.id,
        title: fetchedVideo.title,
        duration: fetchedVideo.duration,
        uploadedAt: fetchedVideo.uploadedAt,
        module: fetchedVideo.module,
        status: fetchedVideo.status,
        diplomaId: fetchedVideo.diploma?.category || fetchedVideo.diplomaId,
        description: fetchedVideo.description,
        videoUrl: fetchedVideo.videoUrl,
      };

      setSelectedVideo(videoForEdit);
      setShowAddModal(true);
    } catch (error) {
      console.error('Error fetching video for edit:', error);
      const fallbackVideo = convertVideoForEdit(video);
      setSelectedVideo(fallbackVideo);
      setShowAddModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl"></div>
        <div className="absolute top-3/4 right-0 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-purple-500/10 blur-md"
            style={{
              width: `${Math.random() * 12 + 4}px`,
              height: `${Math.random() * 12 + 4}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `floatingMist ${Math.random() * 15 + 20}s ease-in-out infinite ${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Header
          title="Video Management"
          subtitle="Manage diploma video tutorials and content"
          tabs={tabs}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search by title..."
          filters={filters}
          filterOptions={filterOptions}
          debouncedFilterChange={debouncedFilterChange}
          handleResetFilters={handleResetFilters}
          onTabClick={handleTabClick}
        />

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => { setSelectedVideo(null); setShowAddModal(true); }}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center space-x-2"
          >
            <FiUpload className="h-4 w-4" />
            <span>Add New Video</span>
          </button>
          <div className="flex items-center bg-gray-800/60 backdrop-blur-sm rounded-lg p-1 border border-purple-500/30">
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded text-sm ${viewMode === 'table'
                ? 'bg-purple-600/30 text-white shadow-sm border border-purple-500/50'
                : 'text-purple-300 hover:text-white'
                }`}
            >
              <FiList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded text-sm ${viewMode === 'grid'
                ? 'bg-purple-600/30 text-white shadow-sm border border-purple-500/50'
                : 'text-purple-300 hover:text-white'
                }`}
            >
              <FiGrid className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-2xl border border-purple-500/30 min-h-[300px] relative">
          {isLoadingDiplomas || isLoadingVideos ? (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900/60 z-20 rounded-xl">
              <LoadingSpinner />
            </div>
          ) : null}
          <div className={`p-6 ${isLoadingDiplomas || isLoadingVideos ? 'opacity-50 pointer-events-none select-none' : ''}`}>
            {paginatedVideos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-purple-900/30 rounded-full flex items-center justify-center mb-4 border border-purple-500/30">
                  <FiVideo className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-white mb-1">No Videos Found</h3>
                <p className="text-purple-300 text-center max-w-sm">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding your first video.'}
                </p>
              </div>
            ) : viewMode === 'table' ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Video
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Module
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Category
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Uploaded
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {paginatedVideos.map((video) => (
                      <tr key={video.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-blue-600 rounded flex items-center justify-center shadow-lg">
                                <FiPlay className="h-4 w-4 text-white" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {video.title}
                              </div>
                              <div className="text-sm text-purple-300">
                                ID: {video.id.substring(0, 8)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center">
                            <FiBookOpen className="h-4 w-4 mr-1 text-purple-400" />
                            Module {video.module}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          <div className="flex items-center">
                            <FiBookOpen className="h-4 w-4 mr-1 text-purple-400" />
                            {video.diploma?.category}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full border ${video.status === 'Published'
                            ? 'bg-green-900/30 text-green-400 border-green-500/30'
                            : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                            }`}>
                            <span
                              className="h-1.5 w-1.5 rounded-full mr-1.5"
                              style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
                            ></span>
                            {video.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-purple-300">
                          <div className="flex items-center">
                            <FiCalendar className="h-4 w-4 mr-1 text-purple-400" />
                            {new Date(video.uploadedAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => { setSelectedVideo(convertVideoForEdit(video)); setShowPreviewModal(true); }}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <FiEye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleEditVideo(video)}
                              className="text-purple-400 hover:text-purple-300"
                            >
                              <FiEdit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => onDeleteVideo(video)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <FiTrash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedVideos.map((video) => (
                  <div key={video.id} className="bg-gray-800/50 backdrop-blur-sm border border-purple-500/30 rounded-xl shadow-lg hover:shadow-2xl transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-purple-500 to-blue-600 rounded-t-lg flex items-center justify-center">
                      <FiPlay className="h-8 w-8 text-white opacity-75" />
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-white line-clamp-2">
                          {video.title}
                        </h3>
                        <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full border inline-flex items-center ${video.status === 'Published'
                          ? 'bg-green-900/30 text-green-400 border-green-500/30'
                          : 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
                          }`}>
                          <span
                            className="h-1.5 w-1.5 rounded-full mr-1.5"
                            style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
                          ></span>
                          {video.status}
                        </span>
                      </div>
                      <div className="space-y-1 text-xs text-purple-300 mb-3">
                        <div className="flex items-center">
                          <FiClock className="h-3 w-3 mr-1 text-purple-400" />
                          {video.duration}
                        </div>
                        <div className="flex items-center">
                          <FiBookOpen className='h-3 w-3 mr-1 text-purple-400' />
                          Module {video.module}
                        </div>
                        <div className="flex items-center">
                          <FiBriefcase className='h-3 w-3 mr-1 text-purple-400' />
                          {video.diploma?.category || 'Unknown'}
                        </div>
                        <div className="flex items-center">
                          <FiCalendar className="h-3 w-3 mr-1 text-purple-400" />
                          {new Date(video.uploadedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => { setSelectedVideo(convertVideoForEdit(video)); setShowPreviewModal(true); }}
                          className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Preview
                        </button>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditVideo(video)}
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <FiEdit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => onDeleteVideo(video)}
                            className="p-1 text-purple-300 hover:text-red-400"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {paginatedVideos.length > 0 && (
              <div className="px-6 pb-6 mt-auto">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  itemsCount={paginatedVideos.length}
                  itemName="videos"
                  onPageChange={setPage}
                  onFirstPage={() => setPage(1)}
                  onLastPage={() => setPage(totalPages)}
                />
              </div>
            )}
          </div>
        </div>

        <AddVideoModal
          isOpen={showAddModal}
          onClose={() => { setShowAddModal(false); setSelectedVideo(null); }}
          selectedVideo={selectedVideo ? {
            id: selectedVideo._id,
            title: selectedVideo.title,
            duration: selectedVideo.duration,
            uploadedAt: selectedVideo.uploadedAt,
            module: selectedVideo.module,
            status: selectedVideo.status,
            diplomaId: selectedVideo.diplomaId,
            description: selectedVideo.description,
            videoUrl: selectedVideo.videoUrl,
          } : null}
          onSave={onSaveVideo}
          diplomas={(diplomasData?.diplomas || []).map(d => ({ id: d.id, title: d.title, category: d.category }))}
        />
        <VideoPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          video={selectedVideo}
        />


        <WarningModal
          isOpen={showDeleteModal && !!videoToDelete}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            if (videoToDelete) handleDeleteVideo(videoToDelete);
            setShowDeleteModal(false);
            setVideoToDelete(null);
          }}
          title="Delete Video"
          message={`Are you sure you want to delete "${videoToDelete?.title}"? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        <style>
          {`
          @keyframes floatingMist {
            0% {
              transform: translateY(0) translateX(0);
              opacity: 0.2;
            }
            50% {
              transform: translateY(-20px) translateX(10px);
              opacity: 0.7;
            }
            100% {
              transform: translateY(0) translateX(0);
              opacity: 0.2;
            }
          }
        `}
        </style>
      </div>
    </div>
  );
};

export default VideoManagementPage;