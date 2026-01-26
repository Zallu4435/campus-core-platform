import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { FaSearch, FaDownload, FaEye, FaCheck, FaClock, FaExclamationTriangle, FaUsers, FaFileAlt, FaCode, FaCalculator, FaFlask, FaLanguage, FaHistory, FaGlobe, FaBook } from 'react-icons/fa';
import ReviewModal from './ReviewModal';
import { assignmentService } from './services/assignmentService';
import { Submission, SubmissionsProps } from '../../../../domain/types/faculty/assignment';
import LoadingSpinner from '../../../../shared/components/LoadingSpinner';
import ErrorMessage from '../../../../shared/components/ErrorMessage';

const extractFileInfo = (file: string | { fileName: string; fileUrl: string; fileSize: number }) => {
  if (typeof file === 'string') {
    const urlParts = file.split('/');
    const fileName = urlParts[urlParts.length - 1].split('?')[0];
    return { fileName, fileUrl: file, fileSize: 0 };
  } else {
    return { fileName: file.fileName, fileUrl: file.fileUrl, fileSize: file.fileSize };
  }
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const getSubjectIcon = (subject: string) => {
  const subjectIcons: { [key: string]: React.ReactElement } = {
    'Computer Science': <FaCode />,
    'Mathematics': <FaCalculator />,
    'Physics': <FaFlask />,
    'Chemistry': <FaFlask />,
    'Biology': <FaFlask />,
    'English': <FaLanguage />,
    'History': <FaHistory />,
    'Geography': <FaGlobe />,
    'Web Development': <FaGlobe />,
    'default': <FaBook />
  };
  return subjectIcons[subject] || subjectIcons.default;
};

export default function Submissions({
  assignment,
  onReview,
  setShowReviewModal,
  isReviewing,
  submissions,
  isLoading,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  error
}: SubmissionsProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const handleReview = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (submissionId: string, reviewData: {
    marks: number;
    feedback: string;
    status: 'pending' | 'reviewed' | 'needs_correction';
    isLate: boolean;
  }) => {
    await onReview(submissionId, reviewData);
    setSelectedSubmission(null);
    setShowReviewModal(false);
  };

  const handleCloseReview = () => {
    setSelectedSubmission(null);
    setShowReviewModal(false);
  };


  const getStatusConfig = (status: 'pending' | 'reviewed' | 'late' | 'needs_correction') => {
    switch (status) {
      case 'reviewed':
        return {
          color: 'from-green-500 to-emerald-600',
          bg: 'bg-green-50',
          text: 'text-green-700',
          border: 'border-green-200',
          icon: <FaCheck size={14} />
        };
      case 'pending':
        return {
          color: 'from-yellow-500 to-orange-600',
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200',
          icon: <FaClock size={14} />
        };
      case 'late':
        return {
          color: 'from-red-500 to-pink-600',
          bg: 'bg-red-50',
          text: 'text-red-700',
          border: 'border-red-200',
          icon: <FaExclamationTriangle size={14} />
        };
      case 'needs_correction':
        return {
          color: 'from-orange-500 to-red-600',
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200',
          icon: <FaExclamationTriangle size={14} />
        };
      default:
        return {
          color: 'from-gray-500 to-slate-600',
          bg: 'bg-gray-50',
          text: 'text-gray-700',
          border: 'border-gray-200',
          icon: null
        };
    }
  };

  const handleDownloadSubmission = async (fileUrl: string, fileName: string) => {
    try {
      let actualFileName = fileName;
      if (fileUrl.includes('.png') || fileUrl.includes('.jpg') || fileUrl.includes('.jpeg')) {
        const urlParts = fileUrl.split('.');
        const actualExtension = urlParts[urlParts.length - 1].split('?')[0];
        if (fileName.toLowerCase().endsWith('.pdf')) {
          actualFileName = fileName.replace('.pdf', `.${actualExtension}`);
        }
      }

      await assignmentService.downloadSubmissionFile(fileUrl, actualFileName);

    } catch (error) {
      console.error('❌ Error downloading faculty submission:', error);
      alert('Failed to download the submission. Please try again or contact support.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="relative">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-pink-500/10"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  {getSubjectIcon(assignment.subject)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                    {assignment.title}
                  </h2>
                  <p className="text-pink-600 font-medium text-lg">{assignment.subject}</p>
                  <p className="text-gray-500 text-sm">Max Marks: {assignment.maxMarks}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Total Submissions', value: submissions.length, icon: FaUsers, color: 'from-blue-500 to-indigo-600' },
                { label: 'Submitted', value: submissions.filter(s => s.status === 'pending').length, icon: FaFileAlt, color: 'from-green-500 to-emerald-600' },
                { label: 'Reviewed', value: submissions.filter(s => s.status === 'reviewed').length, icon: FaCheck, color: 'from-purple-500 to-indigo-600' },
                { label: 'Late', value: submissions.filter(s => s.isLate).length, icon: FaClock, color: 'from-red-500 to-pink-600' }
              ].map((stat, index) => (
                <div key={stat.label} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 group animate-fadeInUp" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                      <stat.icon size={20} />
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-1000`}
                      style={{ width: `${submissions.length > 0 ? (stat.value / submissions.length) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 p-6">
        <div className="flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6">
          <div className="flex-1 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl border-2 border-gray-100 focus-within:border-pink-300 transition-all">
              <FaSearch size={20} className="absolute left-6 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-pink-500 transition-colors" />
              <input
                type="text"
                placeholder="Search students by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-transparent border-none focus:outline-none text-gray-700 placeholder-gray-400 text-lg rounded-2xl"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="relative px-4 py-3 bg-white rounded-2xl border-2 border-gray-100 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent text-gray-700 font-medium shadow-lg hover:shadow-xl transition-all"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="late">Late</option>
              <option value="needs_correction">Needs Correction</option>
            </select>
          </div>

          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${viewMode === 'grid'
                ? 'bg-white shadow-md text-pink-600'
                : 'text-gray-600 hover:text-pink-600'
                }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-xl transition-all font-medium ${viewMode === 'table'
                ? 'bg-white shadow-md text-pink-600'
                : 'text-gray-600 hover:text-pink-600'
                }`}
            >
              Table
            </button>
          </div>
        </div>

        {searchTerm && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center px-4 py-2 bg-pink-50 text-pink-700 rounded-full text-sm font-medium border border-pink-200">
              {submissions.length} result{submissions.length !== 1 ? 's' : ''} found
            </span>
          </div>
        )}
      </div>

      {isLoading && <LoadingSpinner />}
      {error && !isLoading && <ErrorMessage message={error} />}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {submissions.map((submission, index) => {
            const statusConfig = getStatusConfig(submission.status);
            return (
              <div
                key={submission.id}
                className="group relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-xl border border-pink-100 p-8 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fadeInUp"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl"></div>

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      {/* No selection checkbox */}
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-12 w-12 rounded-2xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {submission.studentName?.split(' ').map(n => n[0]).join('') || '??'}
                      </div>
                    </div>

                    <div className={`px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${statusConfig.color} shadow-lg flex items-center space-x-2`}>
                      {statusConfig.icon}
                      <span className="capitalize">{submission.status.replace('_', ' ')}</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className="font-bold text-pink-800 text-xl mb-1 group-hover:text-pink-600 transition-colors">
                      {submission.studentName}
                    </h3>
                    <p className="text-pink-600 font-medium text-sm mb-2">{submission.studentId?.slice(0, 7) || 'N/A'}</p>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {new Date(submission.submittedDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {submission.isLate && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                          <FaClock size={10} className="mr-1" />
                          Late
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 border border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-gray-400 to-gray-600 rounded-xl flex items-center justify-center text-white">
                        <FaFileAlt size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        {submission.files && submission.files.length > 0 ? (
                          <a
                            href={extractFileInfo(submission.files[0]).fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-pink-600 hover:text-pink-800 font-medium truncate block"
                          >
                            View Submission
                          </a>
                        ) : (
                          <p className="text-gray-500">No file submitted</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          if (!submission.files || submission.files.length === 0) {
                            console.error('❌ No files found in submission');
                            alert('No files found in this submission');
                            return;
                          }
                          const fileInfo = extractFileInfo(submission.files[0]);
                          handleDownloadSubmission(fileInfo.fileUrl, fileInfo.fileName);
                        }}
                        className="p-2 text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        <FaDownload size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReview(submission)}
                      className="flex-1 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:from-purple-600 hover:to-pink-600 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center space-x-2"
                    >
                      <FaEye size={16} />
                      <span>Review</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-50 to-pink-50">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Student</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Submitted</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission, index) => {
                  const statusConfig = getStatusConfig(submission.status);
                  return (
                    <tr key={submission.id} className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all animate-fadeInUp" style={{ animationDelay: `${index * 0.05}s` }}>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-4">
                          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-12 w-12 rounded-2xl flex items-center justify-center text-white text-sm font-bold shadow-lg">
                            {submission.studentName?.split(' ').map(n => n[0]).join('') || '??'}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-lg">{submission.studentName}</p>
                            <p className="text-sm text-pink-600 font-medium">{submission.studentId || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {new Date(submission.submittedDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(submission.submittedDate).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {submission.isLate && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200 mt-1">
                              <FaClock size={10} className="mr-1" />
                              Late
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold text-white bg-gradient-to-r ${statusConfig.color} shadow-lg`}>
                          {statusConfig.icon}
                          <span className="ml-2 capitalize">{submission.status.replace('_', ' ')}</span>
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleReview(submission)}
                            className="p-3 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl transition-all border border-indigo-200 hover:border-indigo-300 hover:scale-110 transform shadow-lg"
                            title="Review"
                          >
                            <FaEye size={16} />
                          </button>
                          <button
                            onClick={() => {
                              if (!submission.files || submission.files.length === 0) {
                                console.error('❌ No files found in submission');
                                alert('No files found in this submission');
                                return;
                              }
                              const fileInfo = extractFileInfo(submission.files[0]);
                              handleDownloadSubmission(fileInfo.fileUrl, fileInfo.fileName);
                            }}
                            className="p-3 bg-green-50 text-green-600 hover:bg-green-100 rounded-xl transition-all border border-green-200 hover:border-green-300 hover:scale-110 transform shadow-lg"
                            title="Download"
                          >
                            <FaDownload size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedSubmission && ReactDOM.createPortal(
        <ReviewModal
          submission={{
            id: selectedSubmission.id,
            studentName: selectedSubmission.studentName,
            studentId: selectedSubmission.studentId,
            submittedDate: selectedSubmission.submittedDate,
            status: selectedSubmission.status === 'late' ? 'pending' : selectedSubmission.status,
            marks: selectedSubmission.marks ?? 0,
            feedback: selectedSubmission.feedback ?? '',
            isLate: selectedSubmission.isLate,
            fileName: selectedSubmission.files && selectedSubmission.files.length > 0
              ? extractFileInfo(selectedSubmission.files[0]).fileName
              : 'No file',
            fileSize: selectedSubmission.files && selectedSubmission.files.length > 0
              ? formatFileSize(extractFileInfo(selectedSubmission.files[0]).fileSize || 0)
              : 'N/A',
          }}
          saveReview={handleReviewSubmit}
          onClose={handleCloseReview}
          isLoading={isReviewing}
        />,
        document.body
      )}
    </div>
  );
}