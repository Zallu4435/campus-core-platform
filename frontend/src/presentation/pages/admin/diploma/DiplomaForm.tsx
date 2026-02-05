import React, { useEffect, useState } from 'react';
import { FiXCircle, FiPlus, FiX, FiBook } from 'react-icons/fi';
import { DiplomaFormProps } from '../../../../domain/types/management/diplomamanagement';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { diplomaSchema, DiplomaFormData } from '../../../../domain/validation/management/diplomaSchema';
import { ghostParticles } from '../../../../shared/constants/diplomaManagementConstants';

const DiplomaForm: React.FC<DiplomaFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  categories,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(diplomaSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      thumbnail: '',
      duration: '',
      prerequisites: [],
      status: true,
      ...(initialData || {}),
    },
  });

  useEffect(() => {
    if (isOpen && initialData) {
      reset({ ...initialData });
    }
  }, [isOpen, initialData, reset]);

  usePreventBodyScroll(isOpen);

  const prerequisites = watch('prerequisites') || [];
  const [newPrerequisite, setNewPrerequisite] = useState('');

  const handleAddPrerequisite = () => {
    if (newPrerequisite.trim() && !prerequisites.includes(newPrerequisite.trim())) {
      setValue('prerequisites', [...prerequisites, newPrerequisite.trim()], {
        shouldValidate: true,
        shouldDirty: true
      });
      setNewPrerequisite('');
    }
  };

  const handlePrerequisiteKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddPrerequisite();
    }
  };

  const handleRemovePrerequisite = (prerequisite: string) => {
    setValue('prerequisites', prerequisites.filter((p: string) => p !== prerequisite), {
      shouldValidate: true,
      shouldDirty: true
    });
  };

  const onFormSubmit = async (data: DiplomaFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Diploma submission error:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {ghostParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-500/20 blur-sm"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animation: `floatParticle ${particle.animDuration}s infinite ease-in-out`,
            animationDelay: `${particle.animDelay}s`,
          }}
        />
      ))}

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-purple-600/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />
        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border border-purple-600/30"
                style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}
              >
                <FiBook size={24} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">
                  {isEditing ? 'Edit Diploma' : 'Add New Diploma'}
                </h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
            >
              <FiXCircle size={24} className="text-purple-300" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          <div className="space-y-4">
            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Title</label>
              <input
                type="text"
                {...register('title')}
                placeholder="e.g., Diploma in Computer Science"
                className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
              <textarea
                {...register('description')}
                placeholder="e.g., A comprehensive program designed to prepare students for careers in computer science and technology..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Category</label>
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-400 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Price ($)</label>
                <input
                  type="number"
                  {...register('price', { valueAsNumber: true })}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  min="0"
                  step="0.01"
                />
                {errors.price && <p className="text-red-400 text-sm mt-1">{errors.price.message}</p>}
              </div>
            </div>

            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Thumbnail URL</label>
              <input
                type="text"
                {...register('thumbnail')}
                className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="https://example.com/thumbnail.jpg"
              />
            </div>

            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Duration</label>
              <input
                type="text"
                {...register('duration')}
                className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="e.g., 6 weeks"
              />
              {errors.duration && <p className="text-red-400 text-sm mt-1">{errors.duration.message}</p>}
            </div>

            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Prerequisites</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPrerequisite}
                    onChange={(e) => setNewPrerequisite(e.target.value)}
                    onKeyPress={handlePrerequisiteKeyPress}
                    placeholder="Enter prerequisite course"
                    className="flex-1 px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddPrerequisite}
                    className="px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-500 hover:to-blue-500 transition-colors"
                  >
                    <FiPlus size={20} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {prerequisites.map((prerequisite: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-900/60 border border-purple-600/30 rounded-lg text-purple-300"
                    >
                      <span>{prerequisite}</span>
                      <button
                        type="button"
                        onClick={() => handleRemovePrerequisite(prerequisite)}
                        className="text-purple-300 hover:text-white"
                      >
                        <FiX size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
              <label className="block text-sm font-medium text-purple-300 mb-2">Status</label>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('status')}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 bg-gray-900/60 rounded"
                />
                <span className="ml-2 text-sm text-purple-300">{watch('status') ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-600/30 bg-gray-900/80 p-6">
            <div className="flex justify-end space-x-4">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-gray-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]"
                disabled={isSubmitting || Object.keys(errors).length > 0}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    {isEditing ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  isEditing ? 'Update Diploma' : 'Add Diploma'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style>{`
        .no-scroll {
          overflow: hidden;
        }

        @keyframes floatParticle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
          75% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(128, 90, 213, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default DiplomaForm;