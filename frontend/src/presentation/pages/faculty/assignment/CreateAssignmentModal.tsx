import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FaUpload, FaTimes, FaFile, FaExclamationCircle } from 'react-icons/fa';
import { FiEye } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import httpClient from '../../../../frameworks/api/httpClient';
import { CreateAssignmentModalProps } from '../../../../domain/types/faculty/assignment';
import { assignmentSchema } from '../../../../domain/validation/management/assignmentSchema';


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
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [existingFiles, setExistingFiles] = useState<Array<{ fileName: string; fileUrl: string; fileSize: number; _id: string }>>([]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

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
              _id: (file as { _id?: string; id?: string })._id || (file as { _id?: string; id?: string }).id || `existing-${idx}`
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
    setFieldErrors({});
    setError('');

    const validation = assignmentSchema.safeParse(newAssignment);
    if (!validation.success) {
      const formattedErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        formattedErrors[issue.path[0]] = issue.message;
      });
      setFieldErrors(formattedErrors);
      return;
    }

    const maxMarksNum = parseFloat(newAssignment.maxMarks);

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
        toast.success('Assignment updated successfully');
        setShowCreateModal(false);
        setNewAssignment({ title: '', subject: '', dueDate: '', maxMarks: '', description: '', files: [] });
        setFieldErrors({});
        setError('');
        setActiveTab('all-assignments');
        setSelectedAssignment(null);
      } else {
        const errorMsg = result.error || 'Failed to update assignment';
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } else {
      const result = await onSubmit(newAssignment);
      if (result.success) {
        toast.success('Assignment created successfully');
        setShowCreateModal(false);
        setNewAssignment({ title: '', subject: '', dueDate: '', maxMarks: '', description: '', files: [] });
        setFieldErrors({});
        setError('');
        setActiveTab('all-assignments');
        setSelectedAssignment(null);
      } else {
        const errorMsg = result.error || 'Failed to create assignment';
        setError(errorMsg);
        toast.error(errorMsg);
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
    } catch {
      window.open(fileUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[9999] animate-fadeIn p-4 overflow-y-auto">
      <div
        className="absolute inset-0 cursor-pointer"
        onClick={isLoading ? undefined : handleClose}
      ></div>
      <div className="relative bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-white/40 w-full max-w-2xl flex flex-col my-auto transform transition-all duration-300 animate-scaleIn">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 rounded-t-[2rem] relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -mb-4 -ml-4 w-24 h-24 bg-black/10 rounded-full blur-2xl"></div>

          <div className="relative flex items-center justify-between">
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

        <div className="flex-1 p-8 space-y-6 overflow-y-auto max-h-[70vh] custom-scrollbar">
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-2xl p-4 flex items-start space-x-3 animate-shake shadow-sm">
              <FaExclamationCircle className="text-red-500 mt-1 flex-shrink-0" size={18} />
              <div className="flex-1">
                <p className="text-red-800 font-bold text-sm tracking-wide">REQUEST FAILED</p>
                <p className="text-red-600 text-sm mt-1 leading-relaxed font-medium">{error}</p>
              </div>
            </div>
          )}
          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.1s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Title</label>
            <input
              type="text"
              value={newAssignment.title}
              onChange={(e) => {
                setNewAssignment({ ...newAssignment, title: e.target.value });
                if (fieldErrors.title) setFieldErrors({ ...fieldErrors, title: '' });
              }}
              className={`relative w-full px-5 py-3.5 rounded-2xl border-2 transition-all bg-white/80 focus:shadow-lg outline-none ${fieldErrors.title ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              placeholder="Enter assignment title"
              disabled={isLoading}
            />
            {fieldErrors.title && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium animate-fadeInUp">
                <FaExclamationCircle size={12} />
                {fieldErrors.title}
              </p>
            )}
          </div>
          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
            <select
              value={newAssignment.subject}
              onChange={(e) => {
                setNewAssignment({ ...newAssignment, subject: e.target.value });
                if (fieldErrors.subject) setFieldErrors({ ...fieldErrors, subject: '' });
              }}
              className={`relative w-full px-5 py-3.5 rounded-2xl border-2 transition-all bg-white/80 focus:shadow-lg outline-none ${fieldErrors.subject ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              disabled={isLoading}
            >
              <option value="">Select Subject</option>
              <option>Database Systems</option>
              <option>Web Development</option>
              <option>Data Structures</option>
              <option>Algorithms</option>
            </select>
            {fieldErrors.subject && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium animate-fadeInUp">
                <FaExclamationCircle size={12} />
                {fieldErrors.subject}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={newAssignment.dueDate}
                onChange={(e) => {
                  setNewAssignment({ ...newAssignment, dueDate: e.target.value });
                  if (fieldErrors.dueDate) setFieldErrors({ ...fieldErrors, dueDate: '' });
                }}
                className={`relative w-full px-5 py-3.5 rounded-2xl border-2 transition-all bg-white/80 focus:shadow-lg outline-none ${fieldErrors.dueDate ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                disabled={isLoading}
              />
              {fieldErrors.dueDate && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium animate-fadeInUp">
                  <FaExclamationCircle size={12} />
                  {fieldErrors.dueDate}
                </p>
              )}
            </div>
            <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Maximum Marks</label>
              <input
                type="number"
                value={newAssignment.maxMarks}
                onChange={(e) => {
                  setNewAssignment({ ...newAssignment, maxMarks: e.target.value });
                  if (fieldErrors.maxMarks) setFieldErrors({ ...fieldErrors, maxMarks: '' });
                }}
                className={`relative w-full px-5 py-3.5 rounded-2xl border-2 transition-all bg-white/80 focus:shadow-lg outline-none ${fieldErrors.maxMarks ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                  }`}
                placeholder="100"
                min="1"
                disabled={isLoading}
              />
              {fieldErrors.maxMarks && (
                <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium animate-fadeInUp">
                  <FaExclamationCircle size={12} />
                  {fieldErrors.maxMarks}
                </p>
              )}
            </div>
          </div>

          <div className="relative group animate-fadeInUp" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              rows={6}
              value={newAssignment.description}
              onChange={(e) => {
                setNewAssignment({ ...newAssignment, description: e.target.value });
                if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
              }}
              className={`relative w-full px-5 py-3.5 rounded-2xl border-2 transition-all bg-white/80 resize-none focus:shadow-lg outline-none ${fieldErrors.description ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-gray-100 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100'
                }`}
              placeholder="Provide detailed assignment instructions..."
              disabled={isLoading}
            />
            {fieldErrors.description && (
              <p className="text-red-500 text-xs mt-1.5 ml-1 flex items-center gap-1.5 font-medium animate-fadeInUp">
                <FaExclamationCircle size={12} />
                {fieldErrors.description}
              </p>
            )}
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

        <div className="p-8 border-t border-gray-100 bg-gray-50/50 rounded-b-[2rem] flex-shrink-0">
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleClose}
              className="px-8 py-3.5 bg-white text-gray-700 rounded-2xl font-bold hover:bg-gray-100 transition-all transform active:scale-95 border border-gray-200 shadow-sm"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-10 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white rounded-2xl font-bold hover:shadow-xl hover:shadow-indigo-200 transition-all transform hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 border-[2.5px] border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="tracking-wide">{selectedAssignment ? 'UPDATING...' : 'CREATING...'}</span>
                </>
              ) : (
                <span className="tracking-wide">{selectedAssignment ? 'UPDATE ASSIGNMENT' : 'CREATE ASSIGNMENT'}</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
