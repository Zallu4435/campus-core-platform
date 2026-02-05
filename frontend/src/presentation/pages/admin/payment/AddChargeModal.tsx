import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { chargeSchema, ChargeFormDataRaw } from '../../../../domain/validation/management/chargeSchema';
import { FiX as X, FiDollarSign, FiCalendar, FiFileText, FiAlertCircle } from 'react-icons/fi';
import { AddChargeModalProps, ChargeFormData } from '../../../../domain/types/management/financialmanagement';
import { usePreventBodyScroll } from '../../../../shared/hooks/usePreventBodyScroll';
import { ghostParticles } from '../../../../shared/constants/paymentManagementConstants';


const AddChargeModal: React.FC<AddChargeModalProps> = ({ isOpen, onClose, onSubmit, initialValues }) => {
  const [apiError, setApiError] = useState<string>('');

  const getInitialValue = (val: string | Record<string, unknown> | undefined) => {
    if (typeof val === 'object' && val !== null) {
      return (val.type as string) || (val.slug as string) || '';
    }
    return val || '';
  };

  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    return dateStr.split('T')[0];
  };

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ChargeFormDataRaw>({
    resolver: zodResolver(chargeSchema),
    defaultValues: initialValues
      ? {
        title: initialValues.title || '',
        description: initialValues.description || '',
        amount: initialValues.amount !== undefined ? String(initialValues.amount) : '0',
        term: initialValues.term || '',
        dueDate: formatDateForInput(initialValues.dueDate || ''),
        applicableFor: getInitialValue(initialValues.applicableFor),
      }
      : {
        title: '',
        description: '',
        amount: '0',
        term: '',
        dueDate: '',
        applicableFor: '',
      },
    mode: 'onChange',
  });

  useEffect(() => {
    if (initialValues && isOpen) {
      reset({
        title: initialValues.title || '',
        description: initialValues.description || '',
        amount: initialValues.amount !== undefined ? String(initialValues.amount) : '0',
        term: initialValues.term || '',
        dueDate: formatDateForInput(initialValues.dueDate || ''),
        applicableFor: getInitialValue(initialValues.applicableFor),
      });
      setApiError('');
    } else if (isOpen) {
      reset({
        title: '',
        description: '',
        amount: '0',
        term: '',
        dueDate: '',
        applicableFor: '',
      });
      setApiError('');
    }
  }, [initialValues, isOpen, reset]);

  const handleFormSubmit = async (data: ChargeFormDataRaw) => {
    try {
      setApiError('');
      const transformed: ChargeFormData = {
        ...data,
        amount: typeof data.amount === 'string' ? Number(data.amount) : data.amount,
      };
      await onSubmit(transformed);
      reset();
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create charge. Please try again.';
      setApiError(errorMessage);
    }
  };

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

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-2xl max-h-[90vh] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border border-purple-500/30 bg-purple-600/20">
                <FiDollarSign className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">{initialValues ? 'Edit Charge' : 'Add New Charge'}</h2>
                <p className="text-purple-300 text-sm">{initialValues ? 'Update the details of the charge' : 'Fill in the details to create a new charge'}</p>
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

        <form onSubmit={handleSubmit(handleFormSubmit)} className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-start gap-3">
              <FiAlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <h4 className="text-red-400 font-semibold mb-1">Error Creating Charge</h4>
                <p className="text-red-300 text-sm">{apiError}</p>
              </div>
              <button
                type="button"
                onClick={() => setApiError('')}
                className="text-red-400 hover:text-red-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-purple-100 mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Charge Details
            </h3>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Title *</label>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <FiFileText className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                      <input
                        {...field}
                        type="text"
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="Enter charge title"
                      />
                    </div>
                  )}
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>}
              </div>

              <div>
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
                      placeholder="Enter charge description"
                    />
                  )}
                />
                {errors.description && <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Amount ($)*</label>
                <Controller
                  name="amount"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <FiDollarSign className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                      <input
                        {...field}
                        type="number"
                        step="0.01"
                        min="0"
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900/60 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.amount ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                        placeholder="Enter amount"
                      />
                    </div>
                  )}
                />
                {errors.amount && <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Term *</label>
                <Controller
                  name="term"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.term ? 'border-red-500' : 'border-purple-500/30'
                        }`}
                    >
                      <option value="">Select Term</option>
                      <option value="Fall 2024">Fall 2024</option>
                      <option value="Spring 2025">Spring 2025</option>
                      <option value="Summer 2025">Summer 2025</option>
                    </select>
                  )}
                />
                {errors.term && <p className="mt-1 text-sm text-red-400">{errors.term.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Due Date *</label>
                <Controller
                  name="dueDate"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      <FiCalendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" />
                      <input
                        {...field}
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full pl-12 pr-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.dueDate ? 'border-red-500' : 'border-purple-500/30'
                          }`}
                      />
                    </div>
                  )}
                />
                {errors.dueDate && <p className="mt-1 text-sm text-red-400">{errors.dueDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-purple-300 mb-2">Applicable For *</label>
                <Controller
                  name="applicableFor"
                  control={control}
                  render={({ field }) => (
                    <select
                      {...field}
                      className={`w-full px-4 py-3 bg-gray-900/60 border rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${errors.applicableFor ? 'border-red-500' : 'border-purple-500/30'
                        }`}
                    >
                      <option value="">Select Target Group</option>
                      <option value="all_students">All Students</option>
                      <option value="batch_2024">Batch 2024</option>
                      <option value="batch_2025">Batch 2025</option>
                      <option value="cs_department">CS Department</option>
                      <option value="admission_applicant">Admission Applicant</option>
                    </select>
                  )}
                />
                {errors.applicableFor && <p className="mt-1 text-sm text-red-400">{errors.applicableFor.message}</p>}
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
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-blue-500/50 flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {initialValues ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  initialValues ? 'Update Charge' : 'Add Charge'
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

export default AddChargeModal;