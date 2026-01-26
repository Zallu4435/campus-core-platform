import React, { useState } from 'react';
import { FaTimes, FaStar, FaCheck, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { ReviewModalProps } from '../../../../domain/types/faculty/assignment';

export default function ReviewModal({ submission, saveReview, onClose, isLoading = false }: ReviewModalProps) {
  const [marks, setMarks] = useState(submission.marks?.toString() || '');
  const [feedback, setFeedback] = useState(submission.feedback);
  const [status, setStatus] = useState(submission.status);
  const [isLate, setIsLate] = useState(submission.isLate);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const marksNum = parseFloat(marks);

    if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
      setError('Please enter a valid mark between 0 and 100');
      return;
    }

    saveReview(submission.id, {
      marks: marksNum,
      feedback,
      status,
      isLate
    });
  };

  const handleClose = () => {
    onClose();
  };

  const getStatusConfig = (status: 'reviewed' | 'pending' | 'needs_correction') => {
    switch (status) {
      case 'reviewed':
        return {
          color: 'from-green-500 to-emerald-600',
          text: 'text-green-700',
          icon: <FaCheck size={14} />
        };
      case 'pending':
        return {
          color: 'from-yellow-500 to-orange-600',
          text: 'text-yellow-700',
          icon: <FaClock size={14} />
        };
      case 'needs_correction':
        return {
          color: 'from-orange-500 to-red-600',
          text: 'text-orange-700',
          icon: <FaExclamationTriangle size={14} />
        };
      default:
        return {
          color: 'from-gray-500 to-slate-600',
          text: 'text-gray-700',
          icon: null
        };
    }
  };

  const statusConfig = getStatusConfig(submission.status);

  return (
    <div className="fixed inset-0 z-[99999] animate-fadeIn">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-[99999]" onClick={handleClose}></div>
      <div className="fixed inset-0 flex items-center justify-center p-4 z-[99999]">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] flex flex-col transform animate-scaleIn">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Review Submission</h2>
              <button
                onClick={handleClose}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              >
                <FaTimes size={20} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-12 w-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                    {submission.studentName?.split(' ').map(n => n[0]).join('') || '??'}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{submission.studentName}</h3>
                    <p className="text-sm text-pink-600 font-medium">{submission.studentId || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${statusConfig.color}`}>
                    {statusConfig.icon}
                    <span className="ml-1 capitalize">{submission.status.replace('_', ' ')}</span>
                  </span>
                  <span className="text-sm text-gray-600">
                    {new Date(submission.submittedDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
              {submission.isLate && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                    <FaClock size={10} className="mr-1" />
                    Late
                  </span>
                </div>
              )}
            </div>

            <div className="bg-gray-50/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-100/50 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white">
                  <FaStar size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{submission.fileName}</p>
                  <p className="text-sm text-gray-500">{submission.fileSize}</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="marks" className="block text-sm font-medium text-gray-700 mb-2">
                  Marks
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <input
                    type="number"
                    id="marks"
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white/80"
                    placeholder="Enter marks (0-100)"
                    min="0"
                    max="100"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 animate-fadeInUp">{error}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'reviewed', label: 'Reviewed', color: 'from-green-500 to-emerald-600' },
                    { value: 'pending', label: 'Pending', color: 'from-yellow-500 to-orange-600' },
                    { value: 'needs_correction', label: 'Needs Correction', color: 'from-orange-500 to-red-600' }
                  ].map((option, index) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setStatus(option.value as 'reviewed' | 'pending' | 'needs_correction')}
                      className={`relative px-4 py-3 rounded-2xl text-white font-medium transition-all transform hover:scale-105 animate-fadeInUp ${status === option.value
                          ? `bg-gradient-to-r ${option.color} shadow-lg`
                          : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Late Submission
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isLate"
                    checked={isLate}
                    onChange={(e) => setIsLate(e.target.checked)}
                    className="w-5 h-5 rounded border-2 border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <label htmlFor="isLate" className="text-sm text-gray-600 flex items-center">
                    <FaClock size={14} className="mr-1 text-red-500" />
                    Mark as Late
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback
                </label>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all bg-white/80 resize-none"
                    placeholder="Enter your feedback..."
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="bg-gray-50/80 backdrop-blur-sm p-6 rounded-b-3xl border-t border-gray-100/50">
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl font-medium hover:bg-gray-300 transition-all transform hover:scale-105"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Saving...' : 'Save Review'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
