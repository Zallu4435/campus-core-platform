import React from 'react';
import { IoCloseOutline as X } from 'react-icons/io5';
import { FiFileText, FiVideo, FiEye, FiDownload, FiStar } from 'react-icons/fi';
import { MaterialDetailsProps } from '../../../../domain/types/management/materialmanagement';

const MaterialDetails: React.FC<MaterialDetailsProps> = ({ isOpen, onClose, material, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-4xl rounded-2xl border border-purple-500/30 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-purple-500/20 rounded-full transition-colors"
        >
          <X size={24} className="text-purple-300" />
        </button>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl shadow-lg border border-purple-500/30">
                {material.type === 'pdf' ? <FiFileText /> : <FiVideo />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">{material.title}</h2>
                <p className="text-purple-300 text-sm">
                  {material.subject} - {material.course} (Semester {material.semester})
                </p>
              </div>
            </div>

            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Material Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Type:</strong> {material.type.toUpperCase()}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Difficulty:</strong> {material.difficulty}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Estimated Time:</strong> {material.estimatedTime}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Status:</strong> {material.isRestricted ? 'Restricted' : 'Public'}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>New:</strong> {material.isNewMaterial ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Uploaded By:</strong> {material.uploadedBy}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Uploaded At:</strong> {new Date(material.uploadedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Tags:</strong> {material.tags.join(', ')}
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>File:</strong> <a href={material.fileUrl} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{material.fileUrl.split('/').pop()}</a>
                  </p>
                  <p className="text-sm text-purple-300 mb-2">
                    <strong>Thumbnail:</strong> <a href={material.thumbnailUrl} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">{material.thumbnailUrl.split('/').pop()}</a>
                  </p>
                </div>
              </div>
              <p className="text-sm text-purple-300 mt-4">
                <strong>Description:</strong> {material.description}
              </p>
            </div>

            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Statistics
              </h3>
              <div className="flex space-x-6">
                <div className="flex items-center text-gray-300">
                  <FiEye size={16} className="text-purple-400 mr-2" />
                  <span className="text-sm">Views: {material.views}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FiDownload size={16} className="text-purple-400 mr-2" />
                  <span className="text-sm">Downloads: {material.downloads}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FiStar size={16} className="text-purple-400 mr-2" />
                  <span className="text-sm">Rating: {material.rating?.toFixed(1) || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialDetails;