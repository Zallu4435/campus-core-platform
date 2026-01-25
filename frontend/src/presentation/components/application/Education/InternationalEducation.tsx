import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { InternationalSchoolInfo } from './InternationalSchoolInfo';
import { InternationalTestInfo } from './InternationalTestInfo';
import { getNestedError } from '../../../../shared/utils/formErrors';

interface InternationalEducationProps {
  onNextTab?: () => void;
}

export const InternationalEducation: React.FC<InternationalEducationProps> = ({ onNextTab }) => {
  const { formState: { errors }, trigger, handleSubmit } = useFormContext();
  const [step, setStep] = useState(1);

  const handleNext = async () => {
    const fieldsToValidate = [
      'international.schoolName',
      'international.country',
      'international.from',
      'international.to',
      'international.examination',
      'international.examMonthYear',
      'international.resultType',
      'international.subjects',
    ];
    const isValid = await trigger(fieldsToValidate, { shouldFocus: true });
    if (isValid) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  const onSubmit = () => {
    if (onNextTab) {
      onNextTab();
    }
  };

  return (
    <div className="w-full max-w-screen-2xl">
      <div className="bg-white shadow-sm rounded-xl border border-cyan-100">
        {getNestedError(errors, 'international') && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-sm text-red-700">{getNestedError(errors, 'international')}</p>
          </div>
        )}
        {step === 1 && (
          <InternationalSchoolInfo onNext={handleNext} />
        )}
        {step === 2 && (
          <InternationalTestInfo onBack={handleBack} onSubmit={handleSubmit(onSubmit)} />
        )}
      </div>
    </div>
  );
};