import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../base/Button';
import { Select } from '../../base/Select';
import { programmeOptions } from './options';
import { createProgrammeChoiceSchema, ProgrammeChoiceFormData } from '../../../../domain/validation/user/ChoiceOfStudySchema';
import type { ProgrammeModalProps } from '../../../../domain/types/application';

export const ProgrammeModal: React.FC<ProgrammeModalProps> = ({
  showModal,
  onClose,
  onSubmit,
  choices,
}) => {
  const resolver = React.useMemo(() => zodResolver(createProgrammeChoiceSchema(choices)), [choices]);

  const { control, handleSubmit, watch, reset, formState: { errors } } = useForm<ProgrammeChoiceFormData>({
    resolver,
    defaultValues: {
      programme: '',
      preferredMajor: '',
    },
    mode: 'onSubmit',
  });

  const selectedProgramme = watch('programme');

  useEffect(() => {
    if (showModal) {
      reset({ programme: '', preferredMajor: '' });
    }
  }, [showModal, reset]);

  if (!showModal) return null;

  const onFormSubmit = (data: ProgrammeChoiceFormData) => {
    onSubmit(data);
  };

  const majors = programmeOptions.find(p => p.value === selectedProgramme)?.children || [];

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-blue-100">
        <button
          className="absolute top-4 right-4 text-blue-400 hover:text-blue-600 transition-colors"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-6 text-blue-900">Add Programme</h2>

        {errors.programme?.message && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errors.programme.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            name="programme"
            control={control}
            render={({ field }) => (
              <Select
                id="programme"
                name="programme"
                label="Programme"
                options={programmeOptions}
                value={field.value || ''}
                onChange={field.onChange}
                placeholder="Select a programme"
                required
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 bg-white mb-4"
                labelClassName="text-blue-700"
              />
            )}
          />
          {selectedProgramme && (
            <Controller
              name="preferredMajor"
              control={control}
              render={({ field }) => (
                <Select
                  id="preferredMajor"
                  name="preferredMajor"
                  label="Preferred Major"
                  options={majors}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Select a major"
                  required
                  className="border-blue-200 focus:border-blue-400 focus:ring-blue-200 bg-white"
                  labelClassName="text-blue-700"
                  error={errors.preferredMajor?.message}
                />
              )}
            />
          )}
          <div className="flex justify-end mt-6">
            <Button
              label="Add"
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-blue-400 to-sky-400 hover:from-blue-500 hover:to-sky-500 text-white px-6 py-2 rounded-lg transition-all duration-300 shadow-sm"
            />
          </div>
        </form>
      </div>
    </div>
  );
};