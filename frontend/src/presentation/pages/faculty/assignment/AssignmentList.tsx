import { useState } from 'react';
import { FaSearch, FaCalendar, FaUsers, FaCheckCircle, FaTrash, FaEdit } from 'react-icons/fa';
import WarningModal from '../../../components/common/WarningModal';
import { assignmentService } from './services/assignmentService';
import { Assignment, AssignmentListProps } from '../../../../domain/types/faculty/assignment';

export default function AssignmentList({
  assignments,
  isLoading,
  error,
  setSelectedAssignment,
  setActiveTab,
  setShowCreateModal,
  onDelete,
  isDeleting,
  isUpdating,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterSubject,
  setFilterSubject,
}: AssignmentListProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<Assignment | null>(null);
  const [isFetchingAssignment, setIsFetchingAssignment] = useState(false);

  const handleDeleteClick = (assignment: Assignment) => {
    setAssignmentToDelete(assignment);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (assignmentToDelete) {
      const result = await onDelete(assignmentToDelete._id);
      if (result.success) {
        setShowDeleteModal(false);
        setAssignmentToDelete(null);
      }
    }
  };

  const handleEditClick = async (assignment: Assignment) => {
    try {
      setIsFetchingAssignment(true);
      const response = await assignmentService.getAssignmentById(assignment._id);
      const updatedAssignment = response?.assignment || response;
      if (!updatedAssignment || !updatedAssignment._id) {
        throw new Error('Invalid assignment data received');
      }

      setSelectedAssignment(updatedAssignment);
      setShowCreateModal(true);
    } catch (error) {
      console.error('Error fetching assignment details:', error);
    } finally {
      setIsFetchingAssignment(false);
    }
  };

  const getSubjectIcon = (subject: string) => {
    if (!subject) return '📘';
    if (subject.toLowerCase().includes('database')) return '🗄️';
    if (subject.toLowerCase().includes('web')) return '🌐';
    if (subject.toLowerCase().includes('mobile')) return '📱';
    if (subject.toLowerCase().includes('ai') || subject.toLowerCase().includes('machine')) return '🤖';
    return '📘';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'from-green-500 to-emerald-600';
      case 'draft': return 'from-yellow-500 to-orange-600';
      case 'closed': return 'from-gray-500 to-slate-600';
      default: return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-6 md:p-8 mb-6">
        <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search assignments by title or subject..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-lg shadow-sm bg-white"
            />
            <FaSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-pink-400" />
          </div>
          <div className="w-full md:w-56">
            <label className="block text-sm font-semibold text-pink-700 mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-base bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          {/* Subject Filter */}
          <div className="w-full md:w-56">
            <label className="block text-sm font-semibold text-pink-700 mb-1">Subject</label>
            <select
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-pink-100 focus:border-pink-300 focus:outline-none text-base bg-white"
            >
              <option value="all">All Subjects</option>
              <option value="Database Systems">Database Systems</option>
              <option value="Web Development">Web Development</option>
              <option value="Data Structures">Data Structures</option>
              <option value="Algorithms">Algorithms</option>
              <option value="AI">AI</option>
              <option value="Mobile Development">Mobile Development</option>
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 text-red-700 border border-red-200">
          {typeof error === 'string' ? error : (error instanceof Error ? error.message : 'Please try again later')}
        </div>
      ) : null}

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
          </div>
        )}

        <div className={isLoading ? 'pointer-events-none opacity-50' : ''}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {assignments.map((assignment, index) => (
              <div
                key={assignment._id}
                className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-pink-400 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">{getSubjectIcon(assignment.subject || '')}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${getStatusColor(assignment.status || 'draft')}`}>
                          {(assignment.status || 'draft').toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-bold text-purple-900 text-xl mb-2 group-hover:text-pink-600 transition-colors">
                        {assignment.title || 'Untitled Assignment'}
                      </h3>
                      <div className="flex items-center space-x-3 mb-3">
                        <p className="text-pink-600 font-medium text-sm">{assignment.subject || 'No Subject'}</p>
                        <span className="w-1 h-1 bg-pink-200 rounded-full"></span>
                        <p className="text-purple-600 font-bold text-sm">Max Marks: {assignment.maxMarks}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        className="p-3 text-gray-400 hover:text-pink-600 rounded-xl hover:bg-pink-50 transition-all"
                        onClick={() => handleEditClick(assignment)}
                        disabled={isUpdating || isFetchingAssignment}
                      >
                        <FaEdit size={16} />
                      </button>
                      <button
                        className="p-3 text-gray-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all"
                        onClick={() => handleDeleteClick(assignment)}
                        disabled={isDeleting}
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-700 text-sm mb-6 line-clamp-3 leading-relaxed">
                    {assignment.description || 'No description available'}
                  </p>

                  {/* Stats Row */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 text-center border border-pink-100">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <FaUsers className="text-pink-600" size={16} />
                        <p className="text-2xl font-bold text-pink-600">{assignment.totalSubmissions ?? 0}</p>
                      </div>
                      <p className="text-xs text-pink-600 font-medium">Submissions</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200">
                      <div className="flex items-center justify-center space-x-2 mb-1">
                        <FaCheckCircle className="text-green-600" size={16} />
                        <p className="text-2xl font-bold text-green-600">{assignment.averageMarks ?? 0}</p>
                      </div>
                      <p className="text-xs text-green-600 font-medium">Average Mark</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <FaCalendar size={14} className="text-pink-500" />
                      <span className="font-medium">
                        Due: {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString() : 'No due date'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedAssignment(assignment);
                      setActiveTab('submissions');
                    }}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
                  >
                    <span>View Submissions</span>
                    <div className="w-0 group-hover:w-5 transition-all duration-300 overflow-hidden">
                      <span>→</span>
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {assignments.length === 0 && (
            <div className="text-center py-16">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-50 to-pink-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-6xl">📝</span>
              </div>
              <h3 className="text-2xl font-bold text-pink-700 mb-2">No assignments found</h3>
              <p className="text-pink-500 mb-6">Try adjusting your search terms or create a new assignment</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-8 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                Create Your First Assignment
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-[9999]">
        <WarningModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setAssignmentToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          title="Delete Assignment"
          message={assignmentToDelete ? `Are you sure you want to delete "${assignmentToDelete.title}"? This action cannot be undone.` : ''}
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />
      </div>

      <style>{`        
      @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
