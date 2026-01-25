import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '../../base/Button';
import { ProgrammeModal } from './ProgrammeModal';
import type { ChoiceOfStudyProps, ChoiceOfStudyRef, ProgrammeChoice } from '../../../../domain/types/application';
import { ChoiceOfStudyFormData, ProgrammeChoiceFormData, choiceOfStudyFormSchema } from '../../../../domain/validation/user/ChoiceOfStudySchema';

export const ChoiceOfStudy = forwardRef<ChoiceOfStudyRef, ChoiceOfStudyProps>(
  ({ initialData }, ref) => {
    const [showModal, setShowModal] = useState(false);

    const methods = useForm<ChoiceOfStudyFormData>({
      resolver: zodResolver(choiceOfStudyFormSchema),
      defaultValues: {
        choices: initialData || []
      },
      mode: 'onSubmit',
    });

    const { setValue, watch, formState: { errors }, trigger } = methods;
    const formData = watch();
    const currentChoices = formData.choices || [];

    useEffect(() => {
      if (initialData) {
        setValue('choices', initialData, { shouldValidate: false });
      }
    }, [initialData, setValue]);


    useImperativeHandle(ref, () => ({
      trigger: async () => {
        const isValid = await trigger();
        return isValid;
      },
      getValues: () => currentChoices,
    }));

    const handleAddProgramme = (data: unknown) => {
      const formData = data as ProgrammeChoiceFormData;
      const newChoice: ProgrammeChoice = {
        programme: formData.programme,
        preferredMajor: formData.preferredMajor ?? ''
      };
      setValue('choices', [...currentChoices, newChoice], { shouldValidate: true });
      setShowModal(false);
    };

    const handleRemove = (idx: number) => {
      const updatedChoices = currentChoices.filter((_, i) => i !== idx);
      setValue('choices', updatedChoices, { shouldValidate: true });
    };

    return (
      <FormProvider {...methods}>
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl border border-cyan-100">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
            <h2 className="text-xl font-semibold text-cyan-900">Choice of Study</h2>
          </div>

          <div className="p-6">
            <div className="mb-8">
              <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded">
                <p className="mb-2 font-semibold text-cyan-900">Instructions:</p>
                <ul className="list-disc pl-6 text-sm text-cyan-800 space-y-2">
                  <li>Indicate your choice(s) in order of preference. You may choose up to 8 programme(s).</li>
                  <li>To be considered for Dentistry or Medicine, you must rank these undergraduate programmes as first or second choice.</li>
                  <li>To be considered for Law, you must rank this programme as first, second or third choice.</li>
                  <li>Some programmes require you to indicate a preferred major.</li>
                </ul>
              </div>
            </div>

            {errors.choices && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-700">{errors.choices.message}</p>
              </div>
            )}

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-cyan-800">Your Choices</h3>
                <Button
                  label="Add Programme"
                  onClick={() => setShowModal(true)}
                  variant="primary"
                  className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm relative overflow-hidden group"
                />
              </div>
              <div className="border border-cyan-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-cyan-50 border-b border-cyan-200">
                      <th className="py-3 px-4 text-left font-medium text-cyan-800">Ranking</th>
                      <th className="py-3 px-4 text-left font-medium text-cyan-800">Programme*</th>
                      <th className="py-3 px-4 text-left font-medium text-cyan-800">Preferred Major</th>
                      <th className="py-3 px-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentChoices.length === 0 ? (
                      <tr>
                        <td className="py-4 px-4 text-cyan-600" colSpan={4}>No record(s)</td>
                      </tr>
                    ) : (
                      currentChoices.map((choice, idx) => (
                        <tr key={idx} className="border-b border-cyan-100 hover:bg-cyan-50">
                          <td className="py-3 px-4 text-cyan-800">{idx + 1}</td>
                          <td className="py-3 px-4 text-cyan-800">{choice.programme}</td>
                          <td className="py-3 px-4 text-cyan-800">{choice.preferredMajor || '-'}</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => handleRemove(idx)}
                              className="text-cyan-600 hover:text-cyan-700 border border-cyan-300 hover:border-cyan-400 px-3 py-1 rounded-md relative overflow-hidden group"
                            >
                              <span className="relative z-10">Remove</span>
                              <div
                                className="absolute inset-0 -z-10 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"
                                style={{
                                  backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)',
                                  backgroundSize: '200% 100%',
                                  animation: 'shimmer 2s infinite',
                                }}
                              />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <ProgrammeModal
          showModal={showModal}
          onClose={() => setShowModal(false)}
          onSubmit={handleAddProgramme}
          choices={currentChoices.map(choice => ({
            programme: choice.programme,
            preferredMajor: choice.preferredMajor ?? ''
          }))}
        />
      </FormProvider>
    );
  }
);

ChoiceOfStudy.displayName = 'ChoiceOfStudy';