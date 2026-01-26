import { useState, useEffect } from 'react';
import { FaTimes, FaCheck, FaArrowRight } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import type { CourseDetailsModalProps } from '../../../../domain/types/user/academics';

export default function CourseDetailsModal({ isOpen, onClose, onConfirm, course, isEnrolling }: CourseDetailsModalProps) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState({ reason: '' });
  const { styles, theme } = usePreferences();

  const isReadOnly = !onConfirm || isEnrolling === undefined || (typeof onConfirm === 'function' && onConfirm.toString() === (() => { }).toString() && isEnrolling === false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      setShowConfirmation(false);
      setEnrollmentData({ reason: '' });
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
      setShowConfirmation(false);
    }, 300);
  };

  const handleEnrollClick = () => {
    setShowConfirmation(true);
  };

  const handleConfirmEnrollment = () => {
    onConfirm(enrollmentData);
  };

  const handleBackToDetails = () => {
    setShowConfirmation(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEnrollmentData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  const availableSpots = course.maxEnrollment - course.currentEnrollment;
  const isFullyBooked = availableSpots <= 0;
  const isAlreadyJoined = course.joined;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div
        className={`fixed inset-0 bg-gradient-to-br from-black/20 via-black/40 to-black/60 backdrop-blur-sm transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
          }`}
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div
          className={`relative w-full max-w-lg transform transition-all duration-300 ${isAnimating ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-4'
            }`}
        >
          <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-2xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl sm:rounded-3xl blur transition-all duration-300`}></div>
            <div className={`absolute -top-16 -left-16 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
            <div className={`absolute -bottom-16 -right-16 w-32 sm:w-48 h-32 sm:h-48 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-700`}></div>

            <div className={`relative bg-gradient-to-r ${styles.accent} px-4 sm:px-8 py-4 sm:py-6 ${theme === 'dark' ? 'text-white' : 'text-amber-950'} overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent"></div>
              <div className="relative z-10 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 sm:space-x-4 mb-2">
                    <div className="relative">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                        <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                        <span className="text-white text-xl sm:text-2xl relative z-10">📚</span>
                      </div>
                      <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
                    </div>
                    <div>
                      <h2 className={`text-lg sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-amber-950'} leading-tight`}>
                        {course.title}
                      </h2>
                      <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
                    </div>
                  </div>
                  <div className={`flex items-center space-x-2 sm:space-x-4 ${theme === 'dark' ? 'text-amber-100' : 'text-amber-900/80'} text-xs sm:text-sm`}>
                    <span className={`bg-white/20 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-medium`}>{course.credits} Credits</span>
                    <span className={isFullyBooked ? styles.status.error : theme === 'dark' ? 'text-amber-100' : 'text-amber-900/80'}>
                      {availableSpots > 0 ? `${availableSpots} spots left` : 'Fully booked'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="ml-2 sm:ml-4 p-1.5 sm:p-2 hover:bg-white/20 rounded-full transition-colors duration-200"
                >
                  <FaTimes size={16} className={`sm:w-5 sm:h-5 ${theme === 'dark' ? 'text-white' : 'text-amber-950'}`} />
                </button>
              </div>
            </div>

            <div className="relative z-10 p-4 sm:p-8">
              {!isReadOnly && !showConfirmation ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Specialization</p>
                      <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.specialization}</p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Faculty</p>
                      <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.faculty}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Schedule</p>
                    <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.schedule}</p>
                  </div>

                  <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accentSecondary} p-3 sm:p-4 border ${styles.border} hover:${styles.card.hover} transition-all duration-300 group/item`}>
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${theme == 'dark' ? 'text-white' : styles.textTertiary} uppercase tracking-wider`}>Enrollment Status</span>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${isFullyBooked
                            ? styles.status.error.replace('text-', 'bg-') + '/10 text-red-800'
                            : availableSpots <= 5
                              ? styles.status.warning.replace('text-', 'bg-') + '/10 text-yellow-800'
                              : styles.status.success.replace('text-', 'bg-') + '/10 text-green-800'
                            }`}
                        >
                          {isFullyBooked ? 'Full' : availableSpots <= 5 ? 'Almost Full' : 'Available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`flex-1 bg-amber-200/50 rounded-full h-2 sm:h-3 overflow-hidden`}>
                          <div
                            className={`h-full bg-gradient-to-r ${styles.accent} transition-all duration-1000`}
                            style={{ width: `${(course.currentEnrollment / course.maxEnrollment) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${styles.textSecondary}`}>
                          {course.currentEnrollment} / {course.maxEnrollment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.description && (
                    <div className="space-y-1 sm:space-y-2">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Description</p>
                      <p className={`text-xs sm:text-sm leading-relaxed ${styles.textSecondary}`}>{course.description}</p>
                    </div>
                  )}

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="space-y-1 sm:space-y-2">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Prerequisites</p>
                      <div className="space-y-1.5 sm:space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r ${styles.accent} rounded-full`}></div>
                            <span className={`text-xs sm:text-sm ${styles.textSecondary}`}>{prereq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-3 sm:space-x-4 pt-4 sm:pt-6 border-t border-amber-100/50">
                    <button
                      onClick={handleClose}
                      className={`group/btn flex-1 px-4 sm:px-6 py-2.5 sm:py-3 ${styles.textSecondary} ${styles.card.background} border ${styles.border} hover:${styles.card.hover} rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span className="text-sm sm:text-base">Cancel</span>
                        <FaTimes size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                      </span>
                    </button>
                    <button
                      onClick={handleEnrollClick}
                      disabled={isFullyBooked || isEnrolling || isAlreadyJoined}
                      className={`group/btn flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 ${isFullyBooked || isAlreadyJoined
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : `bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white`
                        }`}
                    >
                      <span className="flex items-center justify-center space-x-2">
                        <span className="text-sm sm:text-base">
                          {isAlreadyJoined
                            ? 'Already Enrolled'
                            : isFullyBooked
                              ? 'Course Full'
                              : 'Enroll Now'}
                        </span>
                        <FaArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" size={12} />
                      </span>
                    </button>
                  </div>
                </div>
              ) : isReadOnly ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Specialization</p>
                      <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.specialization}</p>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Faculty</p>
                      <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.faculty}</p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Schedule</p>
                    <p className={`text-base sm:text-lg font-semibold ${styles.textPrimary}`}>{course.schedule}</p>
                  </div>

                  <div className={`relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accentSecondary} p-3 sm:p-4 border ${styles.border} hover:${styles.card.hover} transition-all duration-300 group/item`}>
                    <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs font-medium ${theme == 'dark' ? 'text-white' : styles.textTertiary} uppercase tracking-wider`}>Enrollment Status</span>
                        <span
                          className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium ${isFullyBooked
                            ? styles.status.error.replace('text-', 'bg-') + '/10 text-red-800'
                            : availableSpots <= 5
                              ? styles.status.warning.replace('text-', 'bg-') + '/10 text-yellow-800'
                              : styles.status.success.replace('text-', 'bg-') + '/10 text-green-800'
                            }`}
                        >
                          {isFullyBooked ? 'Full' : availableSpots <= 5 ? 'Almost Full' : 'Available'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 sm:space-x-4">
                        <div className={`flex-1 bg-amber-200/50 rounded-full h-2 sm:h-3 overflow-hidden`}>
                          <div
                            className={`h-full bg-gradient-to-r ${styles.accent} transition-all duration-1000`}
                            style={{ width: `${(course.currentEnrollment / course.maxEnrollment) * 100}%` }}
                          />
                        </div>
                        <span className={`text-xs sm:text-sm font-semibold ${styles.textSecondary}`}>
                          {course.currentEnrollment} / {course.maxEnrollment}
                        </span>
                      </div>
                    </div>
                  </div>

                  {course.description && (
                    <div className="space-y-1 sm:space-y-2">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Description</p>
                      <p className={`text-xs sm:text-sm leading-relaxed ${styles.textSecondary}`}>{course.description}</p>
                    </div>
                  )}

                  {course.prerequisites && course.prerequisites.length > 0 && (
                    <div className="space-y-1 sm:space-y-2">
                      <p className={`text-xs font-medium ${styles.textTertiary} uppercase tracking-wider`}>Prerequisites</p>
                      <div className="space-y-1.5 sm:space-y-2">
                        {course.prerequisites.map((prereq, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 bg-gradient-to-r ${styles.accent} rounded-full`}></div>
                            <span className={`text-xs sm:text-sm ${styles.textSecondary}`}>{prereq}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end pt-4 sm:pt-6 border-t border-amber-100/50">
                    <button
                      onClick={handleClose}
                      className={`group/btn px-6 py-2.5 sm:px-8 sm:py-3 bg-gradient-to-r ${styles.accent} text-white rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md`}
                    >
                      Close
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${styles.accent} rounded-full flex items-center justify-center mx-auto shadow-lg`}>
                      <FaCheck size={20} className="sm:w-6 sm:h-6 text-white" />
                    </div>
                    <h3 className={`text-xl sm:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text text-transparent mt-3 sm:mt-4 mb-1 sm:mb-2`}>
                      Confirm Enrollment
                    </h3>
                    <p className={`${styles.textSecondary} text-xs sm:text-sm`}>
                      Please review and confirm your enrollment details for <strong>{course.title}</strong>
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="reason" className={`block text-xs sm:text-sm font-medium ${styles.textSecondary} mb-1`}>
                        Reason for Enrollment
                      </label>
                      <textarea
                        id="reason"
                        name="reason"
                        rows={4}
                        value={enrollmentData.reason}
                        onChange={handleInputChange}
                        placeholder="Please provide a brief reason for enrolling in this course..."
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl sm:rounded-2xl ${styles.input.background} border ${styles.input.border} focus:${styles.input.focus} transition-all duration-300 text-xs sm:text-sm`}
                      />
                    </div>

                    <div className="flex space-x-3 sm:space-x-4">
                      <button
                        onClick={handleBackToDetails}
                        className={`group/btn flex-1 px-4 sm:px-6 py-2.5 sm:py-3 ${styles.textSecondary} ${styles.card.background} border ${styles.border} hover:${styles.card.hover} rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105`}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span className="text-sm sm:text-base">Back</span>
                          <FaTimes size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                        </span>
                      </button>
                      <button
                        onClick={handleConfirmEnrollment}
                        disabled={isEnrolling}
                        className={`group/btn flex-1 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white`}
                      >
                        <span className="flex items-center justify-center space-x-2">
                          <span className="text-sm sm:text-base">{isEnrolling ? 'Enrolling...' : 'Confirm'}</span>
                          <FaCheck className="group-hover/btn:translate-x-1 transition-transform duration-300" size={12} />
                        </span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}