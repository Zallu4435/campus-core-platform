import React from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '../../base/Button';
import IELTSSection from './IELTSSection';
import TOEFLSection from './TOEFLSection';
import TOEFLEssentialsSection from './TOEFLEssentialsSection';
import PTESection from './PTESection';
import MappedTestsSection from './MappedTestsSection';
import SATSection from './SATSection';
import ACTSection from './ACTSection';
import APSection from './APSection';
import { getNestedError } from '../../../../shared/utils/formErrors';

interface InternationalTestInfoProps {
  onBack: () => void;
  onSubmit: () => void;
}

const InternationalTestInfo: React.FC<InternationalTestInfoProps> = ({ onBack, onSubmit }) => {
  const { formState: { errors }, trigger } = useFormContext();

  const handleSubmitWithValidation = async () => {
    const isValid = await trigger('international', { shouldFocus: true });
    if (isValid) {
      onSubmit();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-sm rounded-xl border border-cyan-100">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
          <h2 className="text-xl font-semibold text-cyan-900">International Test Information</h2>
        </div>

        <div className="p-6 space-y-6">
          {getNestedError(errors, 'international') && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="text-sm text-red-700">{getNestedError(errors, 'international')}</p>
            </div>
          )}


          {/* English Language Tests */}
          <div className="space-y-6">
            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded">
              <p className="text-sm text-cyan-800">
                Please provide your test scores for at least one of the following English language proficiency tests
                taken in the past 2 years.
              </p>
            </div>

            <IELTSSection />
            <TOEFLSection />
            <TOEFLEssentialsSection label="TOEFL Essentials 1" prefix="toeflEssentials1" />
            <TOEFLEssentialsSection label="TOEFL Essentials 2" prefix="toeflEssentials2" />
            <PTESection />
            <MappedTestsSection />
          </div>

          {/* Standardized Tests */}
          <div className="space-y-6 pt-6 border-t border-cyan-100">
            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded">
              <p className="text-sm text-cyan-800">
                Please provide your scores for any standardized tests you have taken (optional).
              </p>
            </div>

            <SATSection />
            <ACTSection />
            <APSection />
          </div>

          <div className="flex justify-between">
            <Button
              label="Back"
              type="button"
              variant="outline"
              onClick={onBack}
              className="text-cyan-600 hover:text-cyan-700 border border-cyan-300 hover:border-cyan-400 px-6 py-3 rounded-lg"
            />
            <Button
              label="Save & Next"
              type="button"
              variant="primary"
              onClick={handleSubmitWithValidation}
              className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export { InternationalTestInfo };