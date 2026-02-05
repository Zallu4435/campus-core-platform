import React, { useEffect } from 'react';
import { FiXCircle, FiStar } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { SiteSectionFormProps, SectionField } from '../../../../domain/types/management/sitemanagement';
import { ghostParticles } from '../../../../shared/constants/siteManagementConstants';

const createSchema = (fields: SectionField[]) => {
  const schemaObject: Record<string, unknown> = {};

  fields.forEach(field => {
    if (field.type === 'image') {
      schemaObject[field.name] = z.union([z.string(), z.instanceof(File)]).optional();
    } else if (field.required) {
      schemaObject[field.name] = z.string().min(1, `${field.label} is required`);
    } else {
      schemaObject[field.name] = z.string().optional();
    }
  });

  return z.object(schemaObject as z.ZodRawShape);
};

const SiteSectionForm: React.FC<SiteSectionFormProps> = ({ fields, initialData, onClose, onSuccess }) => {
  const schema = createSchema(fields);
  type FormData = z.infer<typeof schema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: initialData || Object.fromEntries(fields.map(f => [f.name, ''])),
  });

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  usePreventBodyScroll(true);

  const onSubmit = async (data: FormData) => {
    try {
      if (initialData?.id) {
        await onSuccess({ ...data, id: initialData.id });
      } else {
        await onSuccess(data);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

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
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-purple-600/30 shadow-2xl overflow-hidden relative">
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
                <FiStar size={24} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">
                  {initialData ? 'Edit' : 'Add'} Item
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
        <form onSubmit={handleSubmit(onSubmit)} className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field: SectionField) => (
              <div
                key={field.name}
                className={`bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm ${field.type === 'textarea' ? 'md:col-span-2' : ''
                  }`}
              >
                <label className="block text-sm font-medium text-purple-300 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-400 ml-1">*</span>}
                </label>

                {field.type === 'textarea' ? (
                  <div>
                    <textarea
                      {...register(String(field.name))}
                      rows={8}
                      placeholder={field.placeholder || field.label}
                      className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-vertical"
                    />
                    {errors[field.name as string as keyof FormData] && (
                      <p className="text-red-400 text-sm mt-1">
                        {(errors[field.name as string as keyof FormData]?.message as string) || ''}
                      </p>
                    )}
                  </div>
                ) : field.type === 'image' ? (
                  <div>
                    {/* Show preview if initialData.image is a string (URL) and no new file is selected */}
                    {typeof watch(field.name) === 'string' && watch(field.name) && (
                      <img
                        src={watch(field.name)}
                        alt="Current"
                        className="mb-2 max-h-32 rounded border border-purple-600/30"
                      />
                    )}
                    {/* Show preview for newly selected file */}
                    {typeof watch(field.name) !== 'string' && watch(field.name) && (
                      <img
                        src={URL.createObjectURL(watch(field.name))}
                        alt="Preview"
                        className="mb-2 max-h-32 rounded border border-purple-600/30"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setValue(field.name.toString(), file);
                        }
                      }}
                      className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    {errors[field.name as string as keyof FormData] && (
                      <p className="text-red-400 text-sm mt-1">
                        {(errors[field.name as string as keyof FormData]?.message as string) || ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <input
                      type={field.type}
                      {...register(field.name.toString())}
                      placeholder={field.placeholder || field.label}
                      className="w-full px-3 py-2 bg-gray-900/60 border border-purple-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                    />
                    {errors[field.name as string as keyof FormData] && (
                      <p className="text-red-400 text-sm mt-1">
                        {(errors[field.name as string as keyof FormData]?.message as string) || ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-purple-600/30 bg-gray-900/80 p-6 mt-6">
            <div className="flex justify-end space-x-4">
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
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Saving...
                  </>
                ) : (
                  initialData ? 'Update' : 'Add'
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
          0% { transform: translateY(0) translateX(0); opacity: 0; }
          25% { opacity: 0.8; }
          50% { transform: translateY(-20px) translateX(10px); opacity: 0.3; }
          75% { opacity: 0.7; }
          100% { transform: translateY(0) translateX(0); opacity: 0; }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(128, 90, 213, 0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.3); border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.5); }
      `}</style>
    </div>
  );
};

export default SiteSectionForm; 