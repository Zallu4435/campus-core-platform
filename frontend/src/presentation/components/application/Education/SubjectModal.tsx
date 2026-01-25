import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../base/Input';
import { Button } from '../../base/Button';
import { createSubjectSchema } from '../../../../domain/validation/user/EducationSchema';
import { getNestedError } from '../../../../shared/utils/formErrors';

interface SubjectModalProps {
  showModal: boolean;
  onClose: () => void;
  existingSubjects: string[];
  onSubmit: (subject: {
    subject: string;
    otherSubject: string;
    grade: string;
  }) => void;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  showModal,
  onClose,
  existingSubjects,
  onSubmit,
}) => {
  const resolver = React.useMemo(() => zodResolver(createSubjectSchema(existingSubjects)), [existingSubjects]);

  const { control, handleSubmit, formState: { errors }, reset, watch } = useForm<{
    subject: string;
    otherSubject: string;
    grade: string;
  }>({
    resolver: resolver as any,
    defaultValues: {
      subject: '',
      otherSubject: '',
      grade: '',
    },
    mode: 'onSubmit',
  });

  const subjectValue = watch('subject');

  useEffect(() => {
    if (showModal) {
      reset();
    }
  }, [showModal, reset]);

  const onFormSubmit = (data: {
    subject: string;
    otherSubject: string;
    grade: string;
  }) => {
    onSubmit(data);
    onClose();
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative border border-cyan-100">
        <button
          className="absolute top-4 right-4 text-cyan-400 hover:text-cyan-600"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-6 text-cyan-900">Add Subject</h2>

        {errors.subject?.message && (
          <div className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{errors.subject.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)}>
          <Controller
            name="subject"
            control={control}
            render={({ field }) => (
              <Input
                name="subject"
                id="subject"
                label="Subject"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Enter subject"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
              />
            )}
          />
          {subjectValue === 'other' && (
            <Controller
              name="otherSubject"
              control={control}
              render={({ field }) => (
                <Input
                  name="otherSubject"
                  id="otherSubject"
                  label="Other Subject"
                  value={field.value}
                  onChange={field.onChange}
                  required
                  placeholder="Enter other subject name"
                  className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                  labelClassName="text-cyan-700"
                  error={getNestedError(errors, 'otherSubject')}
                />
              )}
            />
          )}
          <Controller
            name="grade"
            control={control}
            render={({ field }) => (
              <Input
                name="grade"
                id="grade"
                label="Grade"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Enter grade"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedError(errors, 'grade')}
              />
            )}
          />
          <div className="flex justify-end mt-6">
            <Button
              label="Add"
              type="submit"
              variant="primary"
              className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm relative overflow-hidden group"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
