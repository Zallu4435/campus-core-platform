import React, { forwardRef, useImperativeHandle, useEffect } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { EducationFormData } from '../../../../domain/validation/user/EducationSchema';
import { LocalEducation } from './LocalEducation';
import { TransferEducation } from './TransferEducation';
import { InternationalEducation } from './InternationalEducation';
import { Select } from '../../base/Select';
import { getNestedError } from '../../../../shared/utils/formErrors';

const studentTypeOptions = [
  { value: 'local', label: 'Local' },
  { value: 'transfer', label: 'Transfer' },
  { value: 'international', label: 'International' },
];

interface EducationProps {
  initialData?: EducationFormData;
  onSave: (values: EducationFormData) => void;
  onNextTab?: () => void;
}

interface EducationRef {
  trigger: () => Promise<boolean>;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 bg-red-50 text-red-700">Something went wrong. Please try again.</div>;
    }
    return this.props.children;
  }
}

export const Education = forwardRef<EducationRef, EducationProps>(({ initialData, onNextTab }, ref) => {
  const methods = useFormContext();
  const { control, formState: { errors }, setValue, trigger, watch, getValues } = methods;

  const studentType = watch('studentType');

  useEffect(() => {
    if (initialData) {
      setValue('studentType', initialData.studentType || '');

      if (initialData.local) {
        setValue('local', initialData.local);
      }

      if (initialData.transfer) {
        setValue('transfer', initialData.transfer);
      }

      if (initialData.international) {
        setValue('international', initialData.international);
      }
    }
  }, [initialData, setValue]);

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      try {
        const currentValues = getValues();
        if (!currentValues.studentType) {
          return false;
        }
        const isValid = await trigger();

        if (isValid) {
          const educationData = {
            studentType: currentValues.studentType,
            local: currentValues.local,
            transfer: currentValues.transfer,
            international: currentValues.international,
          };
          setValue('education', educationData, { shouldValidate: false });
        }

        return isValid;
      } catch (error) {
        console.error('Education: Validation error:', error);
        return false;
      }
    },
  }));

  const handleStudentTypeChange = (value: string) => {
    setValue('local', undefined);
    setValue('transfer', undefined);
    setValue('international', undefined);
    setValue('studentType', value, { shouldValidate: true });
  };

  return (
    <ErrorBoundary>
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="bg-white shadow-sm rounded-xl border border-cyan-100 p-6">
          <h1 className="text-2xl font-semibold text-cyan-900 mb-6">Education Information</h1>

          {getNestedError(errors, 'studentType') && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="text-sm text-red-700">{getNestedError(errors, 'studentType')}</p>
            </div>
          )}

          <div className="mb-6">
            <Controller
              name="studentType"
              control={control}
              render={({ field }) => (
                <Select
                  id="studentType"
                  label="Student Type"
                  options={studentTypeOptions}
                  value={field.value}
                  onChange={handleStudentTypeChange}
                  onBlur={field.onBlur}
                  required
                  placeholder="Select student type"
                  className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                  labelClassName="text-cyan-700"
                  error={getNestedError(errors, 'studentType')}
                />
              )}
            />
          </div>

          {studentType === 'local' && <LocalEducation />}
          {studentType === 'transfer' && <TransferEducation />}
          {studentType === 'international' && <InternationalEducation onNextTab={onNextTab} />}
        </div>
      </div>
    </ErrorBoundary>
  );
});

Education.displayName = 'Education';