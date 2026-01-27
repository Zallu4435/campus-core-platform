import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiCalendar, FiClock, FiUpload, FiDownload, FiEye, FiFile, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { getDaysLeft, formatDueDate, getStatusColor } from '../utils/assignmentUtils';
import { GradeModal } from './GradeModal';
import { userAssignmentService } from '../services/userAssignmentService';
import { AssignmentCardProps } from '../../../../../domain/types/canvas/assignment';

export const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  styles,
  onUpload,
}) => {
  const [showGradeModal, setShowGradeModal] = useState(false);
  const daysLeft = getDaysLeft(assignment.dueDate);
  const isOverdue = daysLeft < 0 && !assignment.submission;

  const getActualStatus = () => {
    if (assignment.submission) {
      if (assignment.submission.status === 'reviewed') {
        return 'graded';
      } else if (assignment.submission.status === 'pending') {
        return 'submitted';
      } else if (assignment.submission.status === 'late') {
        return 'submitted';
      } else if (assignment.submission.status === 'needs_correction') {
        return 'needs_correction';
      }
    }
    return assignment.status;
  };

  const actualStatus = getActualStatus();

  const handleFileDownload = async (fileUrl: string, fileName: string) => {
    try {

      let actualFileName = fileName;
      if (fileUrl.includes('.png') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg')) {
        const urlParts = fileUrl.split('.');
        const actualExtension = urlParts[urlParts.length - 1].split('?')[0];
        if (fileName.toLowerCase().endsWith('.pdf')) {
          actualFileName = fileName.replace('.pdf', `.${actualExtension}`);
        }
      }

      const blob = await userAssignmentService.downloadReferenceFile(fileUrl, actualFileName);
      toast.success('Download started', { position: 'top-center' });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = actualFileName;
      link.style.display = 'none';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => window.URL.revokeObjectURL(url), 1000);

    } catch (error) {
      console.error('Error downloading assignment file:', error);
      toast.error('Direct download failed, trying fallback...', { position: 'top-center' });
      try {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (fallbackError) {
        console.error('Fallback download also failed:', fallbackError);
        toast.error('Download failed. Opening in new tab.', { position: 'top-center' });
        window.open(fileUrl, '_blank');
      }
    }
  };

  return (
    <>
      <div
        className={`${styles.card.background} p-4 sm:p-5 rounded-xl shadow-sm border ${styles.border} ${isOverdue ? 'border-l-4 ' + styles.status.error : ''} hover:shadow-md transition-all duration-200 cursor-pointer`}
      >
        <div className="flex flex-col gap-3 sm:gap-4">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <h3 className={`text-base sm:text-xl font-bold ${styles.textPrimary}`}>
                  {assignment.title}
                </h3>
                {assignment.submission && (
                  <div className="flex items-center gap-1">
                    {assignment.submission.status === 'reviewed' ? (
                      <FiCheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${styles.status.success}`} />
                    ) : (
                      <FiAlertCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${styles.status.warning}`} />
                    )}
                  </div>
                )}
              </div>
              <p className={`font-medium mb-1 sm:mb-2 ${styles.accent} text-sm sm:text-base`}>{assignment.subject}</p>
              <p className={`${styles.textSecondary} text-xs sm:text-sm line-clamp-2`}>{assignment.description}</p>
            </div>
          </div>

          {assignment.files && assignment.files.length > 0 && (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <p className={`text-xs sm:text-sm font-medium ${styles.textSecondary}`}>Reference Files:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {assignment.files.map((file) => (
                  <button
                    key={file._id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFileDownload(file.fileUrl, file.fileName);
                    }}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg ${styles.button.secondary} hover:bg-opacity-80 transition-all duration-200 text-xs sm:text-sm`}
                  >
                    <FiDownload className="h-4 w-4" />
                    <span>{file.fileName}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {assignment.submission && assignment.submission.files && assignment.submission.files.length > 0 && (
            <div className="flex flex-col gap-1.5 sm:gap-2">
              <p className={`text-xs sm:text-sm font-medium ${styles.status.success}`}>Submitted Files:</p>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {assignment.submission.files.map((file, index) => (
                  <div
                    key={index}
                    className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-md sm:rounded-lg ${styles.status.success} bg-opacity-20 text-xs sm:text-sm`}
                  >
                    <FiFile className="h-4 w-4" />
                    <span>{file.fileName}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiCalendar className={`h-4 w-4 ${styles.icon.secondary}`} />
              <span className={`${styles.textSecondary}`}>Due: {formatDueDate(assignment.dueDate)}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <FiClock className={`h-4 w-4 ${styles.icon.secondary}`} />
              <span className={`${styles.textSecondary}`}>
                {daysLeft <= 0 ? 'Overdue' : `${daysLeft} days left`}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-3 sm:pt-4 border-t border-gray-100 gap-2 sm:gap-0">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(actualStatus, styles)}`}>
                {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
              </span>
              {assignment.submission && (
                <span className={`text-xs px-2 py-1 rounded ${assignment.submission.isLate ? styles.status.error : styles.status.success}`}>
                  {assignment.submission.isLate ? 'Late' : 'On Time'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {!assignment.submission && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload(assignment);
                  }}
                  className={`px-4 py-2 ${styles.button.primary} rounded-lg flex items-center gap-2 text-sm font-medium transition-all`}
                >
                  <FiUpload className="h-4 w-4" />
                  Submit
                </button>
              )}
              {assignment.submission && assignment.submission.status === 'pending' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`p-2.5 sm:p-3 ${styles.button.secondary} rounded-lg sm:rounded-xl transition-all duration-200`}
                  disabled
                >
                  <FiClock className={`h-4 w-4 ${styles.icon.secondary}`} />
                </button>
              )}
              {assignment.submission && assignment.submission.status === 'needs_correction' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpload(assignment);
                  }}
                  className={`px-4 py-2 ${styles.button.primary} rounded-lg flex items-center gap-2 text-sm font-medium transition-all`}
                >
                  <FiUpload className="h-4 w-4" />
                  Resubmit
                </button>
              )}
              {assignment.submission && assignment.submission.status === 'reviewed' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowGradeModal(true);
                  }}
                  className={`px-4 py-2 ${styles.button.primary} rounded-lg flex items-center gap-2 text-sm font-medium transition-all`}
                >
                  <FiEye className="h-4 w-4" />
                  View Grade
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showGradeModal && (
        <GradeModal
          assignment={assignment}
          onClose={() => setShowGradeModal(false)}
        />
      )}
    </>
  );
}; 