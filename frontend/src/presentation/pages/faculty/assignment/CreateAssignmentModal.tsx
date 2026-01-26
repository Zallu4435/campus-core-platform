import React, { useState, useEffect } from 'react';
import { FaUpload, FaTimes, FaFile } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import httpClient from '../../../../frameworks/api/httpClient';
import { CreateAssignmentModalProps } from '../../../../domain/types/faculty/assignment';

export default function CreateAssignmentModal({
  newAssignment,
  setNewAssignment,
  setShowCreateModal,
  onSubmit,
  isLoading,
  selectedAssignment,
  onUpdate,
  setActiveTab,
  setSelectedAssignment
}: CreateAssignmentModalProps) {

  const [error, setError] = useState('');
  const [existingFiles, setExistingFiles] = useState<Array<{ fileName: string; fileUrl: string; fileSize: number; _id: string }>>([]);

  useEffect(() => {
    if (selectedAssignment) {
      const formattedDate = new Date(selectedAssignment.dueDate).toISOString().split('T')[0];

      setNewAssignment({
        title: selectedAssignment.title,
        subject: selectedAssignment.subject,
        dueDate: formattedDate,
        maxMarks: selectedAssignment.maxMarks.toString(),
        description: selectedAssignment.description,
        files: []
      });

      if (selectedAssignment.files && Array.isArray(selectedAssignment.files)) {
        setExistingFiles(selectedAssignment.files.map((file, idx) => {
          if (typeof file === 'string') {
            return {
              fileName: file,
              fileUrl: file,
              fileSize: 0,
              _id: `existing-${idx}`
            };
          } else {
            return {
              fileName: file.fileName,
              fileUrl: file.fileUrl,
              fileSize: file.fileSize,
              _id: (file as any)._id || (file as any).id || `existing-${idx}`
            };
          }
        }));
      }
    }
  }, [selectedAssignment, setNewAssignment]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setNewAssignment({ ...newAssignment, files: Array.from(e.target.files) });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-indigo-500', 'bg-indigo-50/50');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-indigo-500', 'bg-indigo-50/50');
    if (e.dataTransfer.files) {
      setNewAssignment({ ...newAssignment, files: Array.from(e.dataTransfer.files) });
    }
  };

  const handleSubmit = async () => {
    if (!newAssignment.title.trim()) {
      setError('Assignment title is required');
      return;
    }
    if (!newAssignment.subject) {
      setError('Subject is required');
      return;
    }
    if (!newAssignment.dueDate) {
      setError('Due date is required');
      return;
    }
    const maxMarksNum = parseFloat(newAssignment.maxMarks);
    if (isNaN(maxMarksNum) || maxMarksNum <= 0) {
      setError('Please enter a valid maximum marks greater than 0');
      return;
    }

    if (selectedAssignment && onUpdate) {
      const updatePayload = {
        title: newAssignment.title,
        subject: newAssignment.subject,
        dueDate: newAssignment.dueDate,
        maxMarks: maxMarksNum,
        description: newAssignment.description,
        ...(newAssignment.files && newAssignment.files.length > 0 && { files: newAssignment.files })
      };
      const result = await onUpdate(selectedAssignment._id, updatePayload);
      if (result.success) {
        setShowCreateModal(false);
        setNewAssignment({ title: '', subject: '', dueDate: '', maxMarks: '', description: '', files: [] });
        setError('');
        setActiveTab('all-assignments');
        setSelectedAssignment(null);
      } else {
        setError(result.error || 'Failed to update assignment');
      }
    } else {
      const result = await onSubmit(newAssignment);
      if (result.success) {
        setShowCreateModal(false);
        setNewAssignment({ title: '', subject: '', dueDate: '', maxMarks: '', description: '', files: [] });
        setError('');
        setActiveTab('all-assignments');
        setSelectedAssignment(null);
      } else {
        setError(result.error || 'Failed to create assignment');
      }
    }
  };

  const handleClose = () => {
    setShowCreateModal(false);
    setNewAssignment({ title: '', subject: '', dueDate: '', maxMarks: '', description: '', files: [] });
    setError('');
  };

  const handleViewAssignmentFile = async (fileUrl: string, fileName: string) => {
    if (!fileName || !selectedAssignment?._id) return;
    try {
      const response = await httpClient.get(`/faculty/assignments/${selectedAssignment._id}/files/view`, {
        params: { fileName },
      });
      const { pdfData, contentType } = response.data.data;
      if (pdfData) {
        const byteCharacters = atob(pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType || 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      } else {
        window.open(fileUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/30 w-full max-w-2xl max-h-[90vh] flex flex-col mx-4">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white">
                {selectedAssignment ? 'Edit Assignment' : 'Create New Assignment'}
              </h3>
              <p className="text-white/80 text-sm mt-1">
                {selectedAssignment ? 'Update the assignment details' : 'Set up a new assignment for your students'}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
              disabled={isLoading}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm animate-fadeInUp">
              {error}
            </div>
          )}
          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
              className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-white/80"
              placeholder="Enter assignment title"
              disabled={isLoading}
            />
          </div>
          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={newAssignment.subject}
              onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
              className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-white/80"
              disabled={isLoading}
            >
              <option value="">Select Subject</option>
              <option>Database Systems</option>
              <option>Web Development</option>
              <option>Data Structures</option>
              <option>Algorithms</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-white/80"
                disabled={isLoading}
              />
            </div>
            <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Marks</label>
              <input
                type="number"
                value={newAssignment.maxMarks}
                onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-white/80"
                placeholder="100"
                min="1"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={6}
              value={newAssignment.description}
              onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
              className="relative w-full px-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all bg-white/80 resize-none"
              placeholder="Provide detailed assignment instructions..."
              disabled={isLoading}
            />
          </div>
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Reference Materials</label>

            {existingFiles.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Current Files:</h4>
                <div className="space-y-2">
                  {existingFiles.map((file) => (
                    <div key={file._id} className="flex items-center justify-between bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center space-x-3">
                        <FaFile className="text-indigo-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-700">{file.fileName}</p>
                          <p className="text-xs text-gray-500">{Math.round(file.fileSize / 1024)} KB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewAssignmentFile(file.fileUrl, file.fileName)}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                        title="View PDF"
                      >
                        <FiEye className="inline-block" /> View
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div
              className="relative border-2 border-dashed border-pink-300 rounded-2xl p-6 text-center transition-all bg-pink-50/80 hover:bg-pink-100/80"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity"></div>
              <FaUpload size={32} className="mx-auto text-pink-500 mb-2" />
              <p className="text-gray-600 font-medium">Drag and drop files or click to browse</p>
              <p className="text-gray-500 text-sm mt-1">Add new files to the existing ones</p>
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isLoading}
              />
              {newAssignment.files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {newAssignment.files.map((file, index) => (
                    <div key={index} className="text-sm text-gray-500 flex items-center justify-center space-x-2">
                      <span>{file.name}</span>
                      <span>({Math.round(file.size / 1024)} KB)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100">
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
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl font-semibold hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (selectedAssignment ? 'Updating...' : 'Creating...') : (selectedAssignment ? 'Update Assignment' : 'Create Assignment')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
