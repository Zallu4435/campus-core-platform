import React, { useEffect, useState } from 'react';
import { FiXCircle, FiPlus, FiX, FiBook } from 'react-icons/fi';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { CourseFormProps } from '../../../../domain/types/management/coursemanagement';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { courseSchema, CourseFormData } from '../../../../domain/validation/management/courseSchema';
import { ghostParticles } from '../../../../shared/constants/courseManagementConstants';
import toast from 'react-hot-toast';

const CourseForm: React.FC<CourseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing,
  specializations,
  faculties,
  terms,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      title: '',
      description: '',
      specialization: '',
      credits: 0,
      faculty: '',
      schedule: '',
      maxEnrollment: 0,
      prerequisites: [],
      term: '',
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

  const onFormSubmit = async (data: CourseFormData) => {
    try {
      await onSubmit(data);
    } catch (error: unknown) {
      console.error('Course submission error:', error);
      // Display backend error to user
      const errorMessage = (error as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (error as Error)?.message
        || 'Failed to save course. Please try again.';
      toast.error(errorMessage);
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
                  {isEditing ? 'Edit Course' : 'Add New Course'}
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

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          <form onSubmit={handleSubmit(onFormSubmit)}>
            <div className="space-y-4">
              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Course Title</label>
                <input
                  type="text"
                  {...register('title')}
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Description</label>
                <textarea
                  {...register('description')}
                  placeholder="e.g., A comprehensive introduction to programming fundamentals, algorithms, and data structures..."
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Specialization</label>
                  <select
                    {...register('specialization')}
                    className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations
                      .filter((spec: string) => spec !== 'All Specializations')
                      .map((spec: string) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                  </select>
                  {errors.specialization && <p className="text-red-400 text-xs mt-1">{errors.specialization.message}</p>}
                </div>

                <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Credits</label>
                  <input
                    type="number"
                    {...register('credits', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    min="0"
                  />
                  {errors.credits && <p className="text-red-400 text-xs mt-1">{errors.credits.message}</p>}
                </div>
              </div>

              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Faculty</label>
                <select
                  {...register('faculty')}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculties
                    .filter((faculty: string) => faculty !== 'All Faculties')
                    .map((faculty: string) => (
                      <option key={faculty} value={faculty}>
                        {faculty}
                      </option>
                    ))}
                </select>
                {errors.faculty && <p className="text-red-400 text-xs mt-1">{errors.faculty.message}</p>}
              </div>

              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                <label className="block text-sm font-medium text-purple-300 mb-2">Term</label>
                <select
                  {...register('term')}
                  className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  required
                >
                  <option value="">Select Term</option>
                  {terms
                    .filter((term: string) => term !== 'All Terms')
                    .map((term: string) => (
                      <option key={term} value={term}>
                        {term}
                      </option>
                    ))}
                </select>
                {errors.term && <p className="text-red-400 text-xs mt-1">{errors.term.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Schedule</label>
                  <input
                    type="text"
                    {...register('schedule')}
                    placeholder="e.g., MWF 10:00-11:45"
                    className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  {errors.schedule && <p className="text-red-400 text-xs mt-1">{errors.schedule.message}</p>}
                </div>

                <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Max Enrollment</label>
                  <input
                    type="number"
                    {...register('maxEnrollment', { valueAsNumber: true })}
                    className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    min="0"
                  />
                  {errors.maxEnrollment && <p className="text-red-400 text-xs mt-1">{errors.maxEnrollment.message}</p>}
                </div>
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
                  {errors.prerequisites && <p className="text-red-400 text-xs mt-1">{errors.prerequisites.message as string}</p>}
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
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[140px]"
                  disabled={isSubmitting || Object.keys(errors).length > 0}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      {isEditing ? 'Updating...' : 'Adding...'}
                    </>
                  ) : (
                    isEditing ? 'Update Course' : 'Add Course'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
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

export default CourseForm;