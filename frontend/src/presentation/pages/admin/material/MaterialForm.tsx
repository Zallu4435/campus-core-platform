import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialSchema, MaterialFormData } from '../../../../domain/validation/management/materialSchema';
import { IoCloseOutline as X } from 'react-icons/io5';
import { FiFileText, FiCheck } from 'react-icons/fi';
import { Material, MaterialFormProps } from '../../../../domain/types/management/materialmanagement';

const SUBJECTS = ['Mathematics', 'Computer Science', 'Physics', 'Chemistry'];
const COURSES = ['B.Sc. Mathematics', 'B.Tech. CS', 'B.Sc. Physics'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

const MaterialForm: React.FC<MaterialFormProps> = ({ isOpen, onClose, onSubmit, initialData, isEditing }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm<MaterialFormData>({
    resolver: zodResolver(materialSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      subject: initialData?.subject || '',
      course: initialData?.course || '',
      semester: initialData?.semester || '1',
      type: initialData?.type || 'pdf',
      tags: initialData?.tags || [],
      difficulty: initialData?.difficulty || 'Beginner',
      estimatedTime: initialData?.estimatedTime || '',
      isNewMaterial: initialData?.isNewMaterial || false,
      isRestricted: initialData?.isRestricted || false,
    },
  });

  const [fileName, setFileName] = React.useState<string | null>(null);
  const [thumbnailName, setThumbnailName] = React.useState<string | null>(null);

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        title: initialData.title,
        description: initialData.description,
        subject: initialData.subject,
        course: initialData.course,
        semester: initialData.semester,
        type: initialData.type,
        tags: initialData.tags,
        difficulty: initialData.difficulty,
        estimatedTime: initialData.estimatedTime,
        isNewMaterial: initialData.isNewMaterial,
        isRestricted: initialData.isRestricted,
      });
      setFileName(initialData.fileUrl.split('/').pop() || null);
      setThumbnailName(initialData.thumbnailUrl.split('/').pop() || null);
    } else if (isOpen && !initialData) {
      reset({
        title: '',
        description: '',
        subject: '',
        course: '',
        semester: '1',
        type: 'pdf',
        tags: [],
        difficulty: 'Beginner',
        estimatedTime: '',
        isNewMaterial: false,
        isRestricted: false,
      });
      setFileName(null);
      setThumbnailName(null);
    }
  }, [isOpen, initialData, reset]);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('no-scroll');
    } else {
      document.body.classList.remove('no-scroll');
    }
    return () => {
      document.body.classList.remove('no-scroll');
    };
  }, [isOpen]);

  const handleFormSubmit = async (data: MaterialFormData) => {
    const { file, thumbnail, ...restData } = data;
    const formData: Partial<Material> & { file?: File; thumbnail?: File } = {
      ...restData,
      file: file as File | undefined,
      thumbnail: thumbnail as File | undefined,
    };

    if (!file || !(file instanceof File)) {
      formData.fileUrl = initialData?.fileUrl;
    }

    if (!thumbnail || !(thumbnail instanceof File)) {
      formData.thumbnailUrl = initialData?.thumbnailUrl;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Material submission error:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFileName(e.target.files[0].name);
      setValue('file', e.target.files[0]);
    }
  };

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setThumbnailName(e.target.files[0].name);
      setValue('thumbnail', e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-purple-600/30 flex items-center justify-center text-2xl shadow-lg border border-purple-500/30">
                <FiFileText />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">
                  {isEditing ? 'Edit Material' : 'Add New Material'}
                </h2>
                <p className="text-purple-300 text-sm">
                  {isEditing ? 'Update material details' : 'Fill in the material information'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
            >
              <X size={24} className="text-purple-300" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Title *</label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="Enter material title"
                      />
                    )}
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Subject *</label>
                  <Controller
                    name="subject"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.subject ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                      >
                        <option value="">Select a subject</option>
                        {SUBJECTS.map((subject) => (
                          <option key={subject} value={subject}>{subject}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.subject && <p className="mt-1 text-sm text-red-400">{errors.subject.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Course *</label>
                  <Controller
                    name="course"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.course ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                      >
                        <option value="">Select a course</option>
                        {COURSES.map((course) => (
                          <option key={course} value={course}>{course}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.course && <p className="mt-1 text-sm text-red-400">{errors.course.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Semester *</label>
                  <Controller
                    name="semester"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.semester ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="1"
                      />
                    )}
                  />
                  {errors.semester && <p className="mt-1 text-sm text-red-400">{errors.semester.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Type *</label>
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.type ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                      >
                        <option value="pdf">PDF</option>
                      </select>
                    )}
                  />
                  {errors.type && <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">File Upload {isEditing ? '' : '*'}</label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.file ? 'border-red-500' : 'border-purple-500/30'
                      }`}
                  />
                  {fileName && <p className="mt-1 text-sm text-gray-400">Selected: {fileName}</p>}
                  {errors.file && <p className="mt-1 text-sm text-red-400">{errors.file.message as string}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Thumbnail Upload</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.thumbnail ? 'border-red-500' : 'border-purple-500/30'
                      }`}
                  />
                  {thumbnailName && <p className="mt-1 text-sm text-gray-400">Selected: {thumbnailName}</p>}
                  {errors.thumbnail && <p className="mt-1 text-sm text-red-400">{errors.thumbnail.message as string}</p>}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                Additional Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Tags *</label>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="text"
                        value={field.value.join(', ')}
                        onChange={(e) => field.onChange(e.target.value.split(',').map((tag) => tag.trim()))}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.tags ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="Enter tags, separated by commas"
                      />
                    )}
                  />
                  {errors.tags && <p className="mt-1 text-sm text-red-400">{errors.tags.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Difficulty *</label>
                  <Controller
                    name="difficulty"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.difficulty ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                      >
                        {DIFFICULTIES.map((difficulty) => (
                          <option key={difficulty} value={difficulty}>{difficulty}</option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.difficulty && <p className="mt-1 text-sm text-red-400">{errors.difficulty.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-purple-300 mb-2">Estimated Time *</label>
                  <Controller
                    name="estimatedTime"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        type="text"
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.estimatedTime ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="e.g., 2 hours"
                      />
                    )}
                  />
                  {errors.estimatedTime && <p className="mt-1 text-sm text-red-400">{errors.estimatedTime.message}</p>}
                </div>
                <div className="flex items-center gap-4">
                  <Controller
                    name="isNewMaterial"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center text-sm text-purple-300">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mr-2 bg-gray-900/60 border-purple-500/30 rounded focus:ring-purple-500"
                        />
                        Mark as New
                      </label>
                    )}
                  />
                  <Controller
                    name="isRestricted"
                    control={control}
                    render={({ field }) => (
                      <label className="flex items-center text-sm text-purple-300">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="mr-2 bg-gray-900/60 border-purple-500/30 rounded focus:ring-purple-500"
                        />
                        Restrict Access
                      </label>
                    )}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-purple-300 mb-2">Description *</label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <textarea
                        {...field}
                        rows={4}
                        className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="Enter material description"
                      />
                    )}
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-purple-500/30 bg-gray-900/80 p-6">
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-gray-500/50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                onClick={handleSubmit(handleFormSubmit)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isEditing ? 'Updating...' : 'Saving...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FiCheck className="h-4 w-4" />
                    <span>{isEditing ? 'Update Material' : 'Save Material'}</span>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scroll {
          overflow: hidden;
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

export default MaterialForm;