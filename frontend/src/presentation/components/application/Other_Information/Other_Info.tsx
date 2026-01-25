import React, { forwardRef, useImperativeHandle } from 'react';
import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Other_Info_One from './Other_Info_One';
import Other_Info_Two from './Other_Info_Two';
import { OtherInformationSchema, OtherInformationSection, OtherInformationFormData } from '../../../../domain/validation/user/OtherInfoSchema';
import type { StepIndicatorProps, OtherInfoProps, OtherInfoRef } from '../../../../domain/types/application';
import { getNestedError } from '../../../../shared/utils/formErrors';

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => (
  <div className="max-w-4xl mx-auto mb-6">
    <div className="flex items-center justify-between">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <React.Fragment key={index}>
          <div className="flex items-center">
            <div className={`w - 8 h - 8 rounded - full flex items - center justify - center ${index + 1 <= currentStep
              ? 'bg-gradient-to-r from-cyan-400 to-blue-400 text-white'
              : 'bg-gray-100 text-gray-400'
              } `}>
              {index + 1}
            </div>
            <span className={`ml - 2 text - sm ${index + 1 <= currentStep ? 'text-cyan-800' : 'text-gray-400'
              } `}>
              {index + 1 === 1 ? 'Health Information' : 'Legal Information'}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div className={`flex - 1 h - 0.5 mx - 4 ${index + 1 < currentStep ? 'bg-cyan-400' : 'bg-gray-200'
              } `} />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

const Other_Info = forwardRef<OtherInfoRef, OtherInfoProps>(({ initialData, onSave, onNextTab }, ref) => {
  const methods = useForm<OtherInformationFormData>({
    resolver: zodResolver(OtherInformationSchema) as Resolver<OtherInformationFormData>,
    defaultValues: {
      health: {
        hasHealthSupport: (initialData as OtherInformationSection)?.health?.hasHealthSupport ?? undefined,
        conditions: (initialData as OtherInformationSection)?.health?.conditions ?? [],
        medicalConditions: (initialData as OtherInformationSection)?.health?.medicalConditions ?? '',
        disabilities: (initialData as OtherInformationSection)?.health?.disabilities ?? '',
        specialNeeds: (initialData as OtherInformationSection)?.health?.specialNeeds ?? '',
      },
      legal: {
        hasCriminalRecord: (initialData as OtherInformationSection)?.legal?.hasCriminalRecord ?? undefined,
        criminalRecord: (initialData as OtherInformationSection)?.legal?.criminalRecord ?? '',
        legalProceedings: (initialData as OtherInformationSection)?.legal?.legalProceedings ?? '',
      },
    },
    mode: 'onChange',
  });

  const { handleSubmit, trigger, formState: { errors }, getValues } = methods;

  const [step, setStep] = React.useState(1);
  const totalSteps = 2;

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      return await trigger(undefined, { shouldFocus: true });
    },
    getValues: () => getValues(),
  }));

  const handleNext = async () => {
    const fieldToValidate = (step === 1 ? 'health' : 'legal') as 'health' | 'legal';
    const isValid = await trigger(fieldToValidate, { shouldFocus: true });
    if (isValid) {
      if (step === 1) {
        onSave(getValues());
      }
      setStep(Math.min(step + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setStep(Math.max(step - 1, 1));
  };

  const onSubmit = () => {
    if (onNextTab) {
      onNextTab();
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-screen-2xl mx-auto px-8 py-6">
        {getNestedError(errors, 'health') && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-sm text-red-700">{getNestedError(errors, 'health')}</p>
          </div>
        )}
        {getNestedError(errors, 'legal') && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
            <p className="text-sm text-red-700">{getNestedError(errors, 'legal')}</p>
          </div>
        )}
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
        {step === 1 && (
          <Other_Info_One onNext={handleNext} />
        )}
        {step === 2 && (
          <Other_Info_Two
            onBack={handleBack}
            onNext={handleSubmit(onSubmit)}
          />
        )}
      </div>
    </FormProvider>
  );
});

Other_Info.displayName = 'Other_Info';

export default Other_Info;