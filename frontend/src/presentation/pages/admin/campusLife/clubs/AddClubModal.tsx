import React, { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { IoCloseOutline as X, IoAdd, IoTrash } from 'react-icons/io5';

import { usePreventBodyScroll } from '../../../../../shared/hooks/usePreventBodyScroll';
import { AddClubModalProps } from '../../../../../domain/types/management/clubmanagement';
import { clubSchema, ClubFormData } from '../../../../../domain/validation/management/clubSchema';
import { ghostParticles } from '../../../../../shared/constants/clubManagementConstants';

const AddClubModal: React.FC<AddClubModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isEditing = false,
  clubTypes,
  roles,
  icons,
  colors,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<ClubFormData>({
    resolver: zodResolver(clubSchema),
    defaultValues: {
      name: '',
      type: '',
      members: '',
      icon: '🎓',
      color: '#8B5CF6',
      status: 'active',
      role: '',
      nextMeeting: '',
      about: '',
      createdBy: '',
      upcomingEvents: [],
      ...initialData,
    },
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'upcomingEvents',
  });

  const watchedIcon = watch('icon');
  const watchedColor = watch('color');

  const handleFormSubmit = async (data: ClubFormData) => {
    try {
      const clubData = {
        name: data.name,
        type: data.type,
        members: Array.isArray(data.members) ? data.members : (data.members ? [data.members] : []),

        icon: data.icon || '🎓',
        color: data.color || '#8B5CF6',
        status: data.status || 'active',
        role: data.role,
        nextMeeting: data.nextMeeting || '',
        about: data.about || '',
        createdBy: data.createdBy,
        upcomingEvents: data.upcomingEvents || [],
      };
      await onSubmit(clubData);
      reset();
      onClose();
    } catch (error: unknown) {
      console.error('Club submission error:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (isOpen && initialData) {
      reset({
        ...initialData,
        members: Array.isArray(initialData.members) ? initialData.members.join(', ') : (initialData.members || ''),
        upcomingEvents: initialData.upcomingEvents || []
      } as any);

    } else if (isOpen && !isEditing) {
      reset({
        name: '',
        type: '',
        members: '',
        icon: '🎓',
        color: '#8B5CF6',
        status: 'active',
        role: '',
        nextMeeting: '',
        about: '',
        createdBy: '',
        upcomingEvents: [],
      });
    }
  }, [isOpen, initialData, isEditing, reset]);

  usePreventBodyScroll(isOpen);

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

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-5xl max-h-[90vh] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border border-purple-500/30"
                style={{ backgroundColor: `${watchedColor}20`, borderColor: watchedColor }}
              >
                {watchedIcon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">
                  {isEditing ? 'Edit Club' : 'Create New Club'}
                </h2>
                <p className="text-purple-300 text-sm">
                  {isEditing ? 'Update your club details' : 'Fill in the details to create your club'}
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
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Club Name */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Club Name *
                    </label>
                    <Controller
                      name="name"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                          placeholder="Enter club name"
                        />
                      )}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-400">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Club Type *
                    </label>
                    <Controller
                      name="type"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.type ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                        >
                          <option value="">Select Type</option>
                          {clubTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.type && (
                      <p className="mt-1 text-sm text-red-400">{errors.type.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Role *
                    </label>
                    <Controller
                      name="role"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.role ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                        >
                          <option value="">Select Role</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
                          ))}
                        </select>
                      )}
                    />
                    {errors.role && (
                      <p className="mt-1 text-sm text-red-400">{errors.role.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Created By *
                    </label>
                    <Controller
                      name="createdBy"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.createdBy ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                          placeholder="Enter creator name"
                        />
                      )}
                    />
                    {errors.createdBy && (
                      <p className="mt-1 text-sm text-red-400">{errors.createdBy.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Club Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Members
                    </label>
                    <Controller
                      name="members"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="text"
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.members ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                          placeholder="e.g., 12"
                        />
                      )}
                    />
                    {errors.members && (
                      <p className="mt-1 text-sm text-red-400">{errors.members.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Status
                    </label>
                    <Controller
                      name="status"
                      control={control}
                      render={({ field }) => (
                        <select
                          {...field}
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.status ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      )}
                    />
                    {errors.status && (
                      <p className="mt-1 text-sm text-red-400">{errors.status.message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Next Meeting
                    </label>
                    <Controller
                      name="nextMeeting"
                      control={control}
                      render={({ field }) => (
                        <input
                          {...field}
                          type="datetime-local"
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.nextMeeting ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                        />
                      )}
                    />
                    {errors.nextMeeting && (
                      <p className="mt-1 text-sm text-red-400">{errors.nextMeeting.message}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      About
                    </label>
                    <Controller
                      name="about"
                      control={control}
                      render={({ field }) => (
                        <textarea
                          {...field}
                          rows={4}
                          className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.about ? 'border-red-500' : 'border-purple-500/30'
                            }`}
                          placeholder="Enter club description"
                        />
                      )}
                    />
                    {errors.about && (
                      <p className="mt-1 text-sm text-red-400">{errors.about.message}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Upcoming Events
                </h3>
                <div className="flex justify-end mb-4">
                  <button
                    type="button"
                    onClick={() => append({ date: '', description: '' })}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-colors border border-blue-500/50"
                  >
                    <IoAdd size={16} />
                    Add Event
                  </button>
                </div>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-900/60 rounded-lg border border-purple-500/30"
                    >
                      <div>
                        <label className="block text-sm font-medium text-purple-300 mb-2">
                          Event Date *
                        </label>
                        <Controller
                          name={`upcomingEvents.${index}.date`}
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="datetime-local"
                              className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.upcomingEvents?.[index]?.date ? 'border-red-500' : 'border-purple-500/30'
                                }`}
                            />
                          )}
                        />
                        {errors.upcomingEvents?.[index]?.date && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.upcomingEvents[index]?.date?.message}
                          </p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-purple-300">
                            Event Description *
                          </label>
                          {fields.length > 0 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                            >
                              <IoTrash size={16} />
                            </button>
                          )}
                        </div>
                        <Controller
                          name={`upcomingEvents.${index}.description`}
                          control={control}
                          render={({ field }) => (
                            <input
                              {...field}
                              type="text"
                              placeholder="Event description"
                              className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.upcomingEvents?.[index]?.description ? 'border-red-500' : 'border-purple-500/30'
                                }`}
                            />
                          )}
                        />
                        {errors.upcomingEvents?.[index]?.description && (
                          <p className="mt-1 text-sm text-red-400">
                            {errors.upcomingEvents[index]?.description?.message}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  Customization
                </h3>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-purple-300 mb-3">
                    Club Icon
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-4 bg-gray-900/60 rounded-lg border border-purple-500/30 max-h-40 overflow-y-auto custom-scrollbar">
                    {icons.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setValue('icon', icon)}
                        className={`w-10 h-10 text-xl rounded-lg transition-all duration-200 hover:scale-110 ${watchedIcon === icon
                          ? 'bg-purple-600/30 border-purple-500/50 shadow-lg'
                          : 'bg-gray-900/60 border-purple-500/30 hover:bg-purple-900/20'
                          }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-purple-300 mb-3">
                    Club Color
                  </label>
                  <div className="grid grid-cols-5 gap-2 p-4 bg-gray-900/60 rounded-lg border border-purple-500/30">
                    {colors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setValue('color', color)}
                        className={`w-12 h-12 rounded-lg transition-all duration-200 hover:scale-110 ${watchedColor === color
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
                          : ''
                          }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-6 p-4 bg-gray-900/60 rounded-lg border border-purple-500/30">
                  <div className="text-sm font-medium text-purple-300 mb-2">Preview</div>
                  <div
                    className="p-4 rounded-lg border-l-4 bg-gray-900/60"
                    style={{ borderLeftColor: watchedColor }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                        style={{ backgroundColor: `${watchedColor}20`, color: watchedColor }}
                      >
                        {watchedIcon}
                      </div>
                      <div>
                        <div className="text-purple-100 font-medium">{watch('name') || 'Club Name'}</div>
                        <div className="text-purple-300 text-sm">{watch('type') || 'Type'}</div>
                      </div>
                    </div>
                  </div>
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
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditing ? 'Update Club' : 'Create Club'
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

export default AddClubModal;