import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiFileText, FiUpload } from 'react-icons/fi';
import { formatDueDate } from '../utils/assignmentUtils';
import { UploadModalProps } from '../../../../../domain/types/canvas/assignment';

export const UploadModal: React.FC<UploadModalProps> = ({
  assignment,
  styles,
  selectedFile,
  onClose,
  onFileSelect,
  onSubmit,
  isSubmitting
}) => {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={isSubmitting ? undefined : onClose}
      ></div>
      <div className="relative z-[10000] w-full max-w-md">
        <div className={`${styles.card.background} p-6 sm:p-8 rounded-2xl shadow-xl border ${styles.border} w-full`}>
          <div className="flex justify-between items-center mb-6">
            <h3 className={`text-xl font-bold ${styles.textPrimary}`}>Submit Assignment</h3>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`p-2 ${styles.textSecondary} hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-30`}
              aria-label="Close modal"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className={`block text-sm font-semibold ${styles.textPrimary} mb-3`}>
                Select File to Upload
              </label>
              <div className="relative">
                <input
                  type="file"
                  disabled={isSubmitting}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      onFileSelect(e.target.files[0]);
                    }
                  }}
                  className={`w-full p-4 border-2 border-dashed ${styles.input.border} rounded-xl ${styles.input.background} transition-all focus:border-blue-500/50 text-sm disabled:opacity-50`}
                  aria-label="Upload file"
                />
                {selectedFile && (
                  <div className={`mt-3 p-3 ${styles.backgroundSecondary} rounded-xl border ${styles.border}`}>
                    <div className="flex items-center gap-2">
                      <FiFileText className={`h-4 w-4 text-blue-500`} />
                      <span className={`text-sm ${styles.textPrimary} font-medium line-clamp-1 flex-1`}>
                        {selectedFile.name}
                      </span>
                      <span className={`text-xs ${styles.textSecondary} opacity-60`}>
                        ({Math.round(selectedFile.size / 1024)} KB)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className={`p-4 ${styles.backgroundSecondary} rounded-xl border ${styles.border}`}>
              <h4 className={`text-sm font-bold ${styles.textPrimary} mb-2`}>Assignment Details</h4>
              <div className="space-y-1">
                <p className={`text-xs ${styles.textSecondary}`}>
                  <span className="opacity-60">Title:</span> {assignment.title}
                </p>
                <p className={`text-xs ${styles.textSecondary}`}>
                  <span className="opacity-60">Subject:</span> {assignment.subject}
                </p>
                <p className={`text-xs ${styles.textSecondary}`}>
                  <span className="opacity-60">Due:</span> {formatDueDate(assignment.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className={`flex-1 sm:flex-none px-6 py-2.5 ${styles.button.secondary} rounded-xl font-medium transition-all text-sm disabled:opacity-50`}
                aria-label="Cancel upload"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!selectedFile || isSubmitting}
                className={`flex-1 sm:flex-none px-8 py-2.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 text-sm ${selectedFile && !isSubmitting
                  ? `${styles.button.primary}`
                  : `${styles.button.secondary} opacity-50 cursor-not-allowed`
                  }`}
                aria-label="Submit assignment"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    <FiUpload className="h-4 w-4" />
                    Submit
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}; 