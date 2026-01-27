import { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import { FiSearch, FiArrowLeft } from 'react-icons/fi';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { Assignment, SortOption, FilterStatus } from '../../../../domain/types/canvas/assignment';
import { AssignmentCard } from './components/AssignmentCard';
import { UploadModal } from './components/UploadModal';
import { useUserAssignments } from './hooks/useUserAssignments';

const AssignmentsSection = () => {
  const { styles } = usePreferences();
  const {
    assignments,
    total,
    selectedFile,
    handleFileSelect,
    handleSubmit,
    searchTerm,
    setSearchTerm,
    filterStatus,
    setFilterStatus,
    sortBy,
    setSortBy,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    isSubmitting
  } = useUserAssignments();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(debouncedSearchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearchTerm, setSearchTerm]);

  useEffect(() => {
    setDebouncedSearchTerm(searchTerm);
  }, [searchTerm]);

  const currentAssignments = assignments;

  const renderAssignmentList = () => (
    <div className={`min-h-screen ${styles.background}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl sm:text-4xl font-bold ${styles.textPrimary} tracking-tight`}>
                Assignments
              </h1>
              <p className={`${styles.textSecondary} text-sm sm:text-base mt-2 opacity-80`}>
                Track your academic progress and stay organized
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 mb-8">
            <div className="flex-1">
              <div className="relative">
                <FiSearch className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 ${styles.icon.secondary} opacity-50`} />
                <input
                  type="text"
                  placeholder="Search assignments..."
                  value={debouncedSearchTerm}
                  onChange={(e) => {
                    setDebouncedSearchTerm(e.target.value);
                  }}
                  className={`w-full pl-12 pr-4 py-3 rounded-2xl ${styles.input.background} border ${styles.input.border} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base shadow-sm transition-all`}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value as FilterStatus);
                }}
                className={`flex-1 sm:w-48 px-4 py-3 rounded-2xl ${styles.card.background} border ${styles.border} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm shadow-sm cursor-pointer appearance-none bg-no-repeat bg-right pr-10`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0/0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
                <option value="submitted">Submitted</option>
                <option value="graded">Graded</option>
                <option value="needs_correction">Needs Correction</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                }}
                className={`flex-1 sm:w-48 px-4 py-3 rounded-2xl ${styles.card.background} border ${styles.border} ${styles.textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm shadow-sm cursor-pointer appearance-none bg-no-repeat bg-right pr-10`}
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0/0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundSize: '1.5rem', backgroundPosition: 'right 0.75rem center' }}
              >
                <option value="dueDate">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="course">Course</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {currentAssignments.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <p className={`${styles.textSecondary}`}>No assignments found. Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4 sm:space-y-6">
                {currentAssignments.map((assignment: Assignment) => (
                  <AssignmentCard
                    key={assignment.id}
                    assignment={assignment}
                    styles={styles}
                    onUpload={(assignment) => {
                      setCurrentAssignment(assignment);
                      setShowUploadModal(true);
                    }}
                    onViewGrade={() => {
                    }}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderPagination = () => {
    const totalPages = Math.ceil(total / itemsPerPage);
    const hasNextPage = currentPage < totalPages;
    const hasPrevPage = currentPage > 1;

    if (total <= itemsPerPage) return null;

    return (
      <div className={`flex items-center justify-between border-t ${styles.border} pt-6 mt-8`}>
        <div className="flex flex-1 justify-between sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={!hasPrevPage}
            className={`px-4 py-2 ${styles.button.outline} rounded-xl text-sm font-medium transition-all ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => prev + 1)}
            disabled={!hasNextPage}
            className={`px-4 py-2 ${styles.button.outline} rounded-xl text-sm font-medium transition-all ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className={`${styles.textSecondary} text-sm`}>
              Showing page <span className={`font-bold ${styles.textPrimary}`}>{currentPage}</span> of <span className={`font-bold ${styles.textPrimary}`}>{totalPages}</span>
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={!hasPrevPage}
              className={`p-2.5 ${styles.button.outline} rounded-xl transition-all ${!hasPrevPage ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Previous page"
            >
              <FiArrowLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentPage(prev => prev + 1)}
              disabled={!hasNextPage}
              className={`px-6 py-2.5 ${styles.button.outline} rounded-xl text-sm font-bold transition-all ${!hasNextPage ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Next Page
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderAssignmentList()}
      {showUploadModal && currentAssignment && (
        <UploadModal
          assignment={currentAssignment}
          styles={styles}
          selectedFile={selectedFile[currentAssignment.id]}
          isSubmitting={isSubmitting}
          onClose={() => {
            setShowUploadModal(false);
            setCurrentAssignment(null);
          }}
          onFileSelect={(file) => handleFileSelect(currentAssignment.id, file)}
          onSubmit={async () => {
            try {
              await handleSubmit(currentAssignment.id);
              toast.success('Assignment submitted successfully!', {
                position: 'top-center'
              });
              setShowUploadModal(false);
              setCurrentAssignment(null);
            } catch (err) {
              toast.error('Failed to submit assignment. Please try again.', {
                position: 'top-center'
              });
            }
          }}
        />
      )}
      <Toaster />
    </>
  );
};

export default AssignmentsSection;