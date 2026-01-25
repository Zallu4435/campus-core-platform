import { useEffect, forwardRef, useImperativeHandle, useState, useRef } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AchievementQuestions } from './AchievementQuestions';
import { questions } from './options';
import { AchievementList } from './AchievementList';
import { AchievementModal } from './AchievementModal';
import { AchievementSectionSchema, type AchievementFormData } from '../../../../domain/validation/user/AchievementSchema';
import type { AchievementsProps, AchievementSection } from '../../../../domain/types/application';

export const Achievements = forwardRef<{ trigger: () => Promise<boolean>, getValues: () => AchievementSection }, AchievementsProps>(({ initialData }, ref) => {
  const defaultValues: AchievementFormData = {
    questions: { 1: '', 2: '', 3: '', 4: '', 5: '' },
    achievements: [],
    hasNoAchievements: false,
  };

  const methods = useForm<AchievementFormData>({
    resolver: zodResolver(AchievementSectionSchema),
    defaultValues: initialData ?? defaultValues,
    mode: 'onSubmit',
  });

  const { setValue, watch, formState: { errors }, trigger, reset, getValues } = methods;
  const achievementData = watch();

  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const previousDataRef = useRef<string>('');

  useEffect(() => {
    if (initialData) {
      const dataToSet: AchievementSection = {
        ...initialData,
        achievements: Array.isArray(initialData.achievements) ? initialData.achievements : [],
        hasNoAchievements: !!initialData.hasNoAchievements,
        questions: initialData.questions || { 1: '', 2: '', 3: '', 4: '', 5: '' }
      };

      const dataString = JSON.stringify(dataToSet);

      if (dataString !== previousDataRef.current) {
        previousDataRef.current = dataString;
        reset(dataToSet, { keepDirty: false });
      }
    }
  }, [initialData, reset]);

  useImperativeHandle(ref, () => ({
    trigger: async () => {
      const isValid = await trigger(['questions', 'achievements', 'hasNoAchievements'], { shouldFocus: true });
      if (isValid) {
        methods.clearErrors();
      }
      return isValid;
    },
    getValues: () => methods.getValues(),
  }));

  const handleToggleNoAchievements = () => {
    const newValue = !achievementData.hasNoAchievements;
    setValue('hasNoAchievements', newValue, { shouldValidate: false });
    if (newValue) {
      setValue('achievements', [], { shouldValidate: false });
    }
  };

  const handleRemoveAchievement = (index: number) => {
    const newAchievements = (achievementData.achievements || []).filter((_, i) => i !== index);
    setValue('achievements', newAchievements, { shouldValidate: false });
  };

  const initNewAchievement = () => {
    setValue('newAchievement', {
      activity: '',
      level: '',
      levelOfAchievement: '',
      positionHeld: '',
      organizationName: '',
      fromDate: '',
      toDate: '',
      description: '',
      reference: {
        firstName: '',
        lastName: '',
        position: '',
        email: '',
        phone: { country: '', area: '', number: '' },
      },
    });
  };

  const handleAddAchievement = () => {
    initNewAchievement();
    setEditingIndex(null);
    setShowModal(true);
  };

  return (
    <FormProvider {...methods}>
      <div className="w-full max-w-screen-2xl mx-auto px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-xl border border-cyan-100">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
            <h2 className="text-xl font-semibold text-cyan-900">Achievements & Extra-Curricular Activities</h2>
          </div>

          <div className="p-6">
            {errors.questions && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-700">
                  Please answer all required questions.
                </p>
              </div>
            )}
            {errors.achievements && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
                <p className="text-sm text-red-700">
                  {errors.achievements.message || 'Please add at least one achievement or select "No Achievements to Report".'}
                </p>
              </div>
            )}

            <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded mb-6">
              <p className="text-sm text-cyan-800">
                For better evaluation of your application, please provide information about your achievements
                and activities. This helps us understand your capabilities beyond academic performance.
              </p>
            </div>

            <AchievementQuestions questions={questions} />

            <div className="mt-8">
              <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-cyan-900">List of Achievements</h3>
                  <div className="text-sm text-cyan-600">Contact: record@university.edu</div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-cyan-200">
                <p className="text-cyan-800 mb-4">
                  Please list up to four achievements that may include:
                </p>

                <div className="space-y-2 mb-6 text-cyan-700">
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Co-curricular activities</li>
                    <li>Non-academic activities (e.g., social work, competitive sports)</li>
                    <li>International Olympiad medals</li>
                    <li>National-level representations</li>
                    <li>Leadership positions</li>
                    <li>Relevant work experience or internships</li>
                    <li>Significant projects or contributions</li>
                  </ul>
                </div>

                <div className="bg-cyan-50/50 border border-cyan-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-cyan-800">
                    <span className="font-medium">Note:</span> If you have no achievements to report,
                    please select <span className="inline-block bg-cyan-100 px-2 py-1 text-xs rounded text-cyan-700">Not Applicable</span>
                  </p>
                </div>
              </div>

              <AchievementList
                achievements={achievementData.achievements || []}
                onAdd={handleAddAchievement}
                onEdit={(achievement, index) => {
                  setValue('newAchievement', achievement);
                  setEditingIndex(index);
                  setShowModal(true);
                }}
                onRemove={handleRemoveAchievement}
                max={4}
                hasNoAchievements={achievementData.hasNoAchievements}
                onToggleNoAchievements={handleToggleNoAchievements}
              />
            </div>
          </div>
        </div>

        <AchievementModal
          show={showModal}
          onClose={() => {
            setShowModal(false);
            initNewAchievement();
          }}
          onSubmit={() => {
            const formData = getValues();
            const newAchievement = formData.newAchievement;

            if (newAchievement) {
              const currentAchievements = [...(achievementData.achievements || [])];
              if (editingIndex !== null && editingIndex !== undefined) {
                currentAchievements[editingIndex] = newAchievement;
              } else if (currentAchievements.length < 4) {
                currentAchievements.push(newAchievement);
              }
              setValue('achievements', currentAchievements, { shouldValidate: true });
            }
            setShowModal(false);
            initNewAchievement();
          }}
        />
      </div>
    </FormProvider>
  );
});


Achievements.displayName = 'Achievements';