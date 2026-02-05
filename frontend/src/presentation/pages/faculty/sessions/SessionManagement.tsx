import { useState } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaClock, FaCheck, FaPlay } from 'react-icons/fa';
import { FaCheckCircle, FaSpinner, FaPlayCircle } from 'react-icons/fa';
import CreateSessionModal from './CreateSessionModal';
import { useSessionManagement } from '../../../../application/hooks/useSessionManagement';
import SessionDetailsModal from './SessionDetailsModal';
import WarningModal from '../../../components/common/WarningModal';
import { sessionService } from '../../../../application/services/session.service';
import { VideoSession } from '../../../../application/services/session.service';

export default function SessionManagement() {
  const {
    sessions,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    markSessionAsOver,
    startSession,
    isMarkingAsOver,
    isStartingSession,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    filterCourse,
    setFilterCourse,
  } = useSessionManagement();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<VideoSession | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  const onCreateSession = async (newSession: any) => {
    await handleCreateSession(newSession);
    setShowCreateModal(false);
  };

  const onEditSession = async (updatedSession: any) => {
    await handleUpdateSession(updatedSession._id || updatedSession.id, updatedSession);
    setShowEditModal(false);
    setSelectedSession(null);
  };

  const onDeleteSession = async (id: string) => {
    await handleDeleteSession(id);
    setShowDeleteModal(false);
    setSessionToDelete(null);
  };

  const handleStartSession = async (sessionId: string) => {
    await startSession(sessionId);
  };

  const handleViewSession = async (session: any) => {
    try {
      const sessionId = session._id || session.id;
      if (!sessionId) {
        console.error('Session ID is undefined');
        return;
      }
      const fullSession = await sessionService.getSessionById(sessionId);
      setSelectedSession(fullSession as any);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Error fetching session details:', error);
    }
  };

  const handleEditSession = (session: any) => {
    const sessionId = session._id || session.id;
    if (sessionId) {
      onEditIconClick(sessionId);
    }
  };

  const handleDeleteSessionClick = (session: any) => {
    setSessionToDelete(session);
    setShowDeleteModal(true);
  };

  const handleStartSessionClick = (session: any) => {
    const sessionId = session._id || session.id;
    if (sessionId) {
      handleStartSession(sessionId);
    }
  };

  const handleEndSession = (session: any) => {
    const sessionId = session._id || session.id;
    if (sessionId) {
      markSessionAsOver(sessionId);
    }
  };

  const mapBackendStatusToFrontend = (backendStatus: string): string => {
    switch (backendStatus) {
      case 'Scheduled':
        return 'upcoming';
      case 'Ongoing':
        return 'live';
      case 'Ended':
        return 'completed';
      default:
        return backendStatus.toLowerCase();
    }
  };

  const getStatusConfig = (status: string) => {
    const frontendStatus = mapBackendStatusToFrontend(status);
    switch (frontendStatus) {
      case 'upcoming':
        return { color: 'from-yellow-500 to-orange-600', text: 'text-yellow-700', icon: <FaClock size={14} /> };
      case 'live':
        return { color: 'from-green-500 to-emerald-600', text: 'text-green-700', icon: <FaPlay size={14} /> };
      case 'completed':
        return { color: 'from-blue-500 to-indigo-600', text: 'text-blue-700', icon: <FaCheck size={14} /> };
      default:
        return { color: 'from-gray-500 to-slate-600', text: 'text-gray-700', icon: null };
    }
  };

  const onEditIconClick = async (sessionId: string) => {
    setEditLoading(true);
    try {
      const session = await sessionService.getSessionById(sessionId);
      setSelectedSession(session as any);
      setShowEditModal(true);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8 px-2 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Header Section */}
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent mb-1">
              Session Management
            </h2>
            <p className="text-gray-500">Manage live and recorded sessions for your courses</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <FaPlus size={16} />
            <span>Create Session</span>
          </button>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
            <div className="flex-1 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
              <div className="relative bg-white rounded-2xl border-2 border-gray-100 focus-within:border-pink-300 transition-all">
                <FaSearch size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by title or instructor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-lg rounded-2xl"
                />
              </div>
            </div>
            {/* Status Filter */}
            <div className="relative group w-full md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="relative w-full md:w-auto px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 text-gray-700 font-medium cursor-pointer hover:border-pink-200 transition-all"
              >
                <option value="all">All Status</option>
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className="relative group w-full md:w-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity pointer-events-none"></div>
              <select
                value={filterCourse}
                onChange={(e) => setFilterCourse(e.target.value)}
                className="relative w-full md:w-auto px-6 py-4 bg-white border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-pink-300 text-gray-700 font-medium cursor-pointer hover:border-pink-200 transition-all"
              >
                <option value="all">All Courses</option>
                <option>Database Systems</option>
                <option>Web Development</option>
                <option>Data Structures</option>
                <option>Algorithms</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Title</th>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Instructor</th>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Course</th>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Status</th>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Attendees</th>
                <th className="px-6 py-4 text-left text-purple-900 font-bold uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-pink-50">
              {Array.isArray(sessions) && sessions.map((session: VideoSession, index: number) => {
                const statusConfig = getStatusConfig(session.status as 'live' | 'upcoming' | 'completed');
                return (
                  <tr key={session._id || session.id} className={`hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all ${index % 2 === 0 ? 'bg-white' : 'bg-pink-50'} animate-fadeInUp`} style={{ animationDelay: `${index * 0.05}s` }}>
                    <td className="px-6 py-4 whitespace-nowrap font-bold text-purple-900">{session.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{session.instructor}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{session.course}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${statusConfig.color} shadow-lg`}>
                        {statusConfig.icon}
                        <span className="ml-2 capitalize">{mapBackendStatusToFrontend(session.status || '')}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">{session.attendees}/{session.maxAttendees}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleViewSession(session)}
                          className="p-3 bg-purple-50 text-purple-600 hover:bg-pink-100 rounded-xl transition-all border border-pink-100 hover:border-pink-200 hover:scale-110 transform min-w-[40px]"
                          title="View"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleEditSession(session)}
                          className="p-3 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-xl transition-all border border-pink-200 hover:border-pink-300 hover:scale-110 transform min-w-[40px]"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteSessionClick(session)}
                          className="p-3 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-all border border-red-200 hover:border-red-300 hover:scale-110 transform min-w-[40px]"
                          title="Delete"
                        >
                          <FaTrash size={16} />
                        </button>
                        {mapBackendStatusToFrontend(session.status || '') === 'upcoming' && (
                          <button
                            onClick={() => handleStartSessionClick(session)}
                            className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all border border-green-200 hover:border-green-300 hover:scale-110 transform min-w-[40px] flex items-center justify-center"
                            title="Start Session"
                            aria-label="Start Session"
                            disabled={isStartingSession}
                          >
                            {isStartingSession ? (
                              <FaSpinner className="animate-spin" size={18} />
                            ) : (
                              <FaPlayCircle size={18} />
                            )}
                          </button>
                        )}
                        {mapBackendStatusToFrontend(session.status || '') === 'live' && (
                          <button
                            onClick={() => handleEndSession(session)}
                            className="p-3 bg-yellow-50 text-yellow-600 hover:bg-yellow-100 rounded-xl transition-all border border-yellow-200 hover:border-yellow-300 hover:scale-110 transform min-w-[40px] flex items-center justify-center"
                            title="Mark as Over"
                            aria-label="Mark as Over"
                            disabled={isMarkingAsOver}
                          >
                            {isMarkingAsOver ? (
                              <FaSpinner className="animate-spin" size={18} />
                            ) : (
                              <FaCheckCircle size={18} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {Array.isArray(sessions) && sessions.length === 0 && (
          <div className="text-center py-16 animate-fadeIn">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full mb-4">
              <FaSearch size={32} className="text-pink-400" />
            </div>
            <h3 className="text-2xl font-semibold text-purple-800 mb-2">No Sessions Found</h3>
            <p className="text-pink-500 max-w-md mx-auto">
              Try adjusting your search or filter criteria to find the sessions you're looking for.
            </p>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateSessionModal
          setShowCreateModal={setShowCreateModal}
          createSession={onCreateSession}
        />
      )}
      {editLoading && <div className="flex justify-center items-center p-8"><FaSpinner className="animate-spin text-pink-500" size={32} /></div>}
      {selectedSession && showEditModal && !editLoading && (
        <CreateSessionModal
          setShowCreateModal={(show) => { setShowEditModal(show); if (!show) setSelectedSession(null); }}
          editSession={onEditSession}
          sessionToEdit={selectedSession}
        />
      )}
      {showDetailsModal && selectedSession && (
        <SessionDetailsModal session={selectedSession} onClose={() => setShowDetailsModal(false)} />
      )}
      <WarningModal
        isOpen={showDeleteModal}
        onClose={() => { setShowDeleteModal(false); setSessionToDelete(null); }}
        onConfirm={() => sessionToDelete && onDeleteSession(sessionToDelete._id || sessionToDelete.id)}
        title="Delete Session"
        message={`Are you sure you want to delete the session "${sessionToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
}
