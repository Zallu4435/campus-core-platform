import { useState, useMemo } from 'react';
import {
  FiArrowLeft, FiBookOpen, FiAward,
  FiUsers, FiStar, FiBookmark, FiCheckCircle
} from 'react-icons/fi';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { DiplomaCard } from './components/DiplomaCard';
import { ChapterItem } from './components/ChapterItem';
import { useDiplomaManagement } from '../../../../application/hooks/useDiplomaManagement';
import { BackendChapter, BackendCourse, ViewMode } from '../../../../domain/types/canvas/diploma';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { Chapter, DiplomaCourse } from '../../../../domain/types/canvas/diploma';

export const DiplomaCoursesSection = () => {
  const { styles } = usePreferences();
  const [currentView, setCurrentView] = useState<ViewMode>('courses');
  const [userAdmitted] = useState(true);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [modalVideo, setModalVideo] = useState<Chapter | null>(null);

  usePreventBodyScroll(videoModalOpen);

  const {
    courses,
    isLoading,
    selectedCourse,
    completedChapters,
    bookmarkedChapters,
    markChapterComplete,
    toggleBookmark,
    handleViewCourse,
  } = useDiplomaManagement();

  const chaptersOriginal = useMemo<Chapter[]>(() => {
    if (!selectedCourse) return [];
    const course = selectedCourse as BackendCourse;
    const items = course.chapters || course.videos || [];

    return items.map((item: BackendChapter): Chapter => ({
      id: item.id || item._id || '',
      _id: item._id,
      title: item.title,
      description: item.description || '',
      type: item.type || 'video',
      duration: item.duration || '0',
      videoUrl: item.videoUrl || '',
      notes: item.notes || item.description || '',
      order: item.order,
      isCompleted: item.isCompleted,
      isBookmarked: item.isBookmarked,
    }));
  }, [selectedCourse]);

  const chapters = chaptersOriginal;

  const mapBackendCourseToUICourse = (course: BackendCourse): DiplomaCourse => {
    const chapters = (course.chapters || course.videos || []).map((item: BackendChapter): Chapter => ({
      id: item.id || item._id || '',
      _id: item._id,
      title: item.title,
      description: item.description || '',
      type: item.type || 'video',
      duration: item.duration || '0',
      videoUrl: item.videoUrl || '',
      notes: item.notes || item.description || '',
      order: item.order,
      isCompleted: item.isCompleted,
      isBookmarked: item.isBookmarked,
    }));

    return {
      id: course.id || course._id || '',
      _id: course._id,
      title: course.title,
      description: course.description,
      category: course.category || course.department || 'General',
      department: course.department || course.category || 'General',
      instructor: course.instructor || 'Faculty Instructor',
      status: course.status || 'published',
      videoCount: course.videoCount || chapters.length,
      completedVideoCount: course.completedVideoCount || 0,
      totalVideos: course.videoCount || chapters.length,
      chapters,
      duration: course.duration || '',
      createdAt: course.createdAt,
      updatedAt: course.updatedAt,
      isEnrolled: course.isEnrolled,
      thumbnail: course.thumbnail,
    };
  };

  const handleStartCourse = (courseId: string) => {
    handleViewCourse(courseId);
    setCurrentView('details');
  };

  const handleViewDetails = (course: DiplomaCourse) => {
    const courseId = (course as { _id?: string; id?: string })._id || course.id;
    handleViewCourse(courseId);
    setCurrentView('details');
  };

  const EmptyState = ({ title, message, icon: Icon }: { title: string; message: string; icon: React.ElementType }) => (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in relative z-10">
      <div className={`w-24 h-24 rounded-3xl ${styles.accent} bg-opacity-10 flex items-center justify-center mb-6`}>
        <Icon className={`w-12 h-12 ${styles.textPrimary} opacity-30`} />
      </div>
      <h3 className={`text-2xl font-bold ${styles.textPrimary} mb-2`}>{title}</h3>
      <p className={`${styles.textSecondary} max-w-sm`}>{message}</p>
    </div>
  );

  const renderCoursesList = () => (
    <div className={`min-h-screen bg-transparent transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 ${styles.accent} rounded-2xl mb-4`}>
            <FiAward className={`w-5 h-5 sm:w-7 sm:h-7 ${styles.textPrimary}`} />
          </div>
          <h1 className={`text-2xl sm:text-4xl font-bold ${styles.textPrimary} mb-2`}>Diploma Courses</h1>
          <p className={`text-sm sm:text-lg ${styles.textSecondary} max-w-2xl mx-auto opacity-70`}>
            Advance your career with our comprehensive diploma programs designed by industry experts
          </p>
        </div>

        {courses.length === 0 ? (
          <EmptyState
            title="No Courses Available"
            message="We're currently preparing new diploma programs for you. Please check back soon!"
            icon={FiBookOpen}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course, index) => {
              const mappedCourse = mapBackendCourseToUICourse(course);
              return (
                <DiplomaCard
                  key={mappedCourse.id}
                  course={mappedCourse}
                  index={index}
                  styles={styles}
                  userAdmitted={userAdmitted}
                  completedChapters={completedChapters}
                  onViewDetails={handleViewDetails}
                  onStartCourse={handleStartCourse}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const [imgErrorDetails, setImgErrorDetails] = useState(false);

  const renderCourseDetails = () => {
    return (
      <div className={`min-h-screen bg-transparent`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <button
            onClick={() => setCurrentView('courses')}
            className={`flex items-center ${styles.textPrimary} hover:${styles.accent} mb-6 sm:mb-8 transition-colors group`}
            aria-label="Back to courses"
          >
            <FiArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Courses
          </button>

          <div className={`${styles.card.background} rounded-2xl sm:rounded-3xl p-6 sm:p-10 border ${styles.border} mb-6 sm:mb-8 shadow-xl overflow-hidden relative`}>
            {/* Decorative background element */}
            <div className={`absolute -top-10 -right-10 w-40 h-40 rounded-full ${styles.accent} opacity-5 blur-3xl`} />

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-10 relative z-10">
              <div className={`flex-shrink-0 w-24 h-24 sm:w-32 sm:h-32 rounded-3xl ${styles.accent} flex items-center justify-center ${styles.textPrimary} shadow-2xl overflow-hidden border-4 border-white/10`}>
                {selectedCourse?.thumbnail && !imgErrorDetails ? (
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-full object-cover"
                    onError={() => setImgErrorDetails(true)}
                  />
                ) : (
                  <FiAward className="w-12 h-12 sm:w-16 sm:h-16 opacity-50" />
                )}
              </div>

              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                    {selectedCourse?.status || 'Published'}
                  </span>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <FiStar className="w-4 h-4 text-amber-500" />
                    <span className={`${styles.textSecondary} text-xs font-bold`}>{selectedCourse?.category || 'General'}</span>
                  </div>
                </div>

                <h1 className={`text-2xl sm:text-3xl font-black ${styles.textPrimary} tracking-tight leading-tight mb-3`}>{selectedCourse?.title}</h1>
                <p className={`${styles.textSecondary} text-sm sm:text-base leading-relaxed max-w-3xl opacity-80 mb-6 font-medium`}>{selectedCourse?.description}</p>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                  {(selectedCourse?.instructor) && (
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded-xl ${styles.accent} bg-opacity-10`}>
                        <FiUsers className={`w-5 h-5 ${styles.textPrimary} opacity-70`} />
                      </div>
                      <span className={`${styles.textPrimary} font-bold text-sm`}>{selectedCourse.instructor}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-blue-500 bg-opacity-10`}>
                      <FiBookOpen className={`w-5 h-5 text-blue-500 opacity-70`} />
                    </div>
                    <span className={`${styles.textPrimary} font-bold text-sm`}>{chapters.length} Modules</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={`${styles.card.background} rounded-2xl sm:rounded-3xl p-5 sm:p-8 border ${styles.border} shadow-xl relative overflow-hidden backdrop-blur-xl`}>
            {/* Decorative background element */}
            <div className={`absolute -bottom-10 -left-10 w-40 h-40 rounded-full ${styles.accent} opacity-5 blur-3xl`} />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0 relative z-10">
              <div>
                <h2 className={`text-xl sm:text-2xl font-black ${styles.textPrimary} flex items-center tracking-tight`}>
                  <div className={`p-2 rounded-2xl ${styles.accent} bg-opacity-10 mr-4 shadow-inner`}>
                    <FiBookOpen className={`w-5 h-5 sm:w-6 sm:h-6 ${styles.textPrimary} opacity-70`} />
                  </div>
                  Course Modules
                </h2>
                <p className={`${styles.textSecondary} text-[11px] sm:text-xs font-medium opacity-60 mt-1`}>Follow the structured path to master the subject</p>
              </div>
              <div className={`px-4 py-2 rounded-2xl bg-opacity-5 ${styles.accent} border border-white/10 backdrop-blur-md`}>
                <span className={`text-xs font-black ${styles.textPrimary}`}>
                  {completedChapters.size} <span className="opacity-40 font-medium whitespace-nowrap">/ {chapters.length} Completed</span>
                </span>
              </div>
            </div>

            {chapters.length === 0 ? (
              <EmptyState
                title="No Modules Yet"
                message="We're putting the finishing touches on this course's content. Modules will appear here shortly!"
                icon={FiBookOpen}
              />
            ) : (
              <div className="space-y-3 relative z-10">
                {selectedCourse && chapters.map((chapter: Chapter, idx: number) => {
                  const isFirst = idx === 0;
                  const prevId = chapters[idx - 1]?.id;
                  const prevCompleted = isFirst
                    ? true
                    : completedChapters.has(String(prevId));
                  const chapterId = chapter._id || chapter.id;
                  return (
                    <ChapterItem
                      key={chapterId}
                      chapter={chapter}
                      courseId={selectedCourse._id || selectedCourse.id}
                      styles={styles}
                      isFirst={isFirst}
                      isPrevCompleted={prevCompleted}
                      isCompleted={completedChapters.has(String(chapterId))}
                      isBookmarked={bookmarkedChapters.has(String(chapterId))}
                      onViewChapter={() => {
                        setModalVideo(chapter);
                        setVideoModalOpen(true);
                      }}
                      onBookmark={(cId, chId) => {
                        toggleBookmark({ courseId: cId, chapterId: chId });
                      }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {videoModalOpen && modalVideo && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 transition-all duration-500 animate-fade-in">
              <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                onClick={() => setVideoModalOpen(false)}
              />
              <div className={`relative w-full max-w-6xl max-h-[90vh] overflow-hidden ${styles.card.background} ${styles.border} backdrop-blur-2xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-[0_0_100px_rgba(0,0,0,0.5)] border-white/10 flex flex-col transform transition-all duration-500 animate-scale-in`}>
                <button
                  className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 sm:p-3 rounded-full hover:bg-white/10 ${styles.textSecondary} hover:${styles.textPrimary} transition-all z-20 group`}
                  onClick={() => setVideoModalOpen(false)}
                  aria-label="Close modal"
                >
                  <div className="text-2xl sm:text-3xl font-light transform group-hover:rotate-90 transition-transform">×</div>
                </button>

                <div className="flex flex-col lg:flex-row h-full overflow-hidden">
                  {/* Cinematic Video Section */}
                  <div className="flex-grow bg-black flex items-center justify-center relative aspect-video lg:aspect-auto">
                    <video
                      src={typeof modalVideo?.videoUrl === 'string' ? modalVideo.videoUrl : ''}
                      controls
                      autoPlay
                      className="w-full h-full max-h-[70vh] lg:max-h-full object-contain"
                    />
                  </div>

                  {/* Info Sidebar Section */}
                  <div className={`w-full lg:w-[320px] xl:w-[400px] p-5 sm:p-8 overflow-y-auto border-t lg:border-t-0 lg:border-l ${styles.border} flex flex-col`}>
                    <div className="mb-6">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">
                          {modalVideo.type || 'Video'} Lesson
                        </span>
                        {completedChapters.has(String(modalVideo._id || modalVideo.id)) && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">
                            Mastered
                          </span>
                        )}
                      </div>
                      <h2 className={`text-base sm:text-lg font-black ${styles.textPrimary} tracking-tight leading-tight`}>{modalVideo.title}</h2>
                    </div>

                    <div className="flex-grow space-y-4 mb-8">
                      <div>
                        <h3 className={`text-[10px] sm:text-[11px] font-black ${styles.textPrimary} uppercase tracking-wider opacity-60 mb-2`}>Lesson Overview</h3>
                        <p className={`${styles.textSecondary} text-[11px] sm:text-xs leading-relaxed font-medium opacity-80 bg-white/5 p-4 rounded-xl border border-white/5`}>
                          {String(modalVideo?.notes || modalVideo?.description || 'Learn core concepts in this focused module.')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2.5 mt-auto">
                      <button
                        className={`flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 transform active:scale-95 ${bookmarkedChapters.has(String(modalVideo._id || modalVideo.id))
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10'
                          }`}
                        onClick={() => {
                          if (selectedCourse && modalVideo) {
                            toggleBookmark({ courseId: selectedCourse._id || selectedCourse.id, chapterId: String(modalVideo._id || modalVideo.id) });
                          }
                        }}
                      >
                        <FiBookmark className={`w-3.5 h-3.5 ${bookmarkedChapters.has(String(modalVideo._id || modalVideo.id)) ? 'fill-current' : ''}`} />
                        {bookmarkedChapters.has(String(modalVideo._id || modalVideo.id)) ? 'Bookmarked' : 'Save for Later'}
                      </button>

                      {!completedChapters.has(String(modalVideo._id || modalVideo.id)) && (
                        <button
                          className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all duration-300 transform hover:-translate-y-0.5 active:scale-95"
                          onClick={() => {
                            if (selectedCourse && modalVideo) {
                              markChapterComplete({ courseId: selectedCourse._id || selectedCourse.id, chapterId: modalVideo._id || modalVideo.id });
                              setVideoModalOpen(false);
                            }
                          }}
                        >
                          <FiCheckCircle className="w-3.5 h-3.5" />
                          Mark as Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${styles.background} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  switch (currentView) {
    case 'courses':
      return renderCoursesList();
    case 'details':
      return renderCourseDetails();
    default:
      return renderCoursesList();
  }
};

export default DiplomaCoursesSection;
