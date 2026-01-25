import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Input } from '../../base/Input';
import { Button } from '../../base/Button';
import { Select } from '../../base/Select';
import { Textarea } from '../../base/Textarea';
import { getNestedError } from '../../../../shared/utils/formErrors';
import type { AchievementModalProps } from '../../../../domain/types/application';
import { AchievementFormData, Achievement } from '../../../../domain/validation/user/AchievementSchema';
import { FieldPath } from 'react-hook-form';

type NewAchievementPath = Extract<FieldPath<AchievementFormData>, `newAchievement.${keyof Achievement}`>;

export const AchievementModal: React.FC<AchievementModalProps> = ({
  show,
  onClose,
  onSubmit,
}) => {
  const { register, formState: { errors }, trigger, control } = useFormContext<AchievementFormData>();

  if (!show) return null;

  const selectFields: Array<{ id: keyof Achievement, label: string, placeholder: string, options: Array<{ value: string, label: string }> }> = [
    { id: 'activity', label: 'Activity', placeholder: 'Select Activity', options: [{ value: 'Sports', label: 'Sports' }, { value: 'Arts', label: 'Arts' }, { value: 'Leadership', label: 'Leadership' }, { value: 'Work Experience', label: 'Work Experience' }, { value: 'Other', label: 'Other' }] },
    { id: 'level', label: 'Level', placeholder: 'Select Level', options: [{ value: 'School', label: 'School' }, { value: 'Regional', label: 'Regional' }, { value: 'National', label: 'National' }, { value: 'International', label: 'International' }] },
    { id: 'levelOfAchievement', label: 'Level of Achievement', placeholder: 'Select Achievement Level', options: [{ value: 'Participation', label: 'Participation' }, { value: 'Bronze', label: 'Bronze' }, { value: 'Silver', label: 'Silver' }, { value: 'Gold', label: 'Gold' }, { value: 'Other', label: 'Other' }] },
    { id: 'positionHeld', label: 'Position Held', placeholder: 'Select Position', options: [{ value: 'Participant', label: 'Participant' }, { value: 'Team Member', label: 'Team Member' }, { value: 'Team Leader', label: 'Team Leader' }, { value: 'President', label: 'President' }, { value: 'Other', label: 'Other' }] },
  ];
  const referenceFields: Array<{ id: string, label: string, registerId: FieldPath<AchievementFormData>, placeholder: string, type?: string }> = [
    { id: 'firstName', label: 'First Name', registerId: 'newAchievement.reference.firstName', placeholder: 'Enter first name' },
    { id: 'lastName', label: 'Last Name', registerId: 'newAchievement.reference.lastName', placeholder: 'Enter last name' },
    { id: 'position', label: 'Position / Title', registerId: 'newAchievement.reference.position', placeholder: 'Enter position or title' },
    { id: 'email', label: 'Email', registerId: 'newAchievement.reference.email', placeholder: 'Enter email address', type: 'email' },
    { id: 'phoneCountry', label: 'Country Code', registerId: 'newAchievement.reference.phone.country', placeholder: 'e.g., +65' },
    { id: 'phoneArea', label: 'Area Code', registerId: 'newAchievement.reference.phone.area', placeholder: 'e.g., 123' },
    { id: 'phoneNumber', label: 'Phone Number', registerId: 'newAchievement.reference.phone.number', placeholder: 'e.g., 4567890' },
  ];

  const handleModalSubmit = async () => {
    const isValid = await trigger(['newAchievement'], { shouldFocus: true });
    if (isValid) {
      onSubmit();
    } else {
      console.error('AchievementModal: Validation errors', {
        achievementErrors: errors.newAchievement,
        referenceErrors: getNestedError(errors, 'newAchievement.reference'),
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyan-100">
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-cyan-900">Add Achievement</h2>
            <Button
              onClick={onClose}
              aria-label="Close"
              label="×"
              className="text-cyan-400 hover:text-cyan-600"
            />
          </div>
        </div>

        <div className="p-6">
          {errors.newAchievement && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded mb-6">
              <p className="text-sm text-red-700">
                Please complete all required fields.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {selectFields.map(field => {
              const fieldName = `newAchievement.${field.id}` as NewAchievementPath;
              return (
                <div key={field.id}>
                  <Controller<AchievementFormData, NewAchievementPath>
                    name={fieldName}
                    control={control}
                    render={({ field: { onChange, value, ref } }) => (
                      <Select
                        id={field.id}
                        label={field.label}
                        options={field.options}
                        value={(value as unknown as string) || ''}
                        onChange={onChange}
                        ref={ref}
                        required
                        placeholder={field.placeholder}
                        className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                        labelClassName="text-cyan-700"
                      />
                    )}
                  />
                  {getNestedError(errors, fieldName) && (
                    <p className="text-sm text-red-700 mt-1">
                      {getNestedError(errors, fieldName)}
                    </p>
                  )}
                </div>
              );
            })}

            {(['organizationName', 'fromDate', 'toDate'] as const).map((fieldKey) => (
              <div key={fieldKey}>
                <Input
                  id={fieldKey}
                  label={fieldKey === 'organizationName' ? 'Organization / Employer' :
                    fieldKey === 'fromDate' ? 'From (MM/YYYY)' : 'To (MM/YYYY)'}
                  {...register(`newAchievement.${fieldKey}`)}
                  placeholder={fieldKey.includes('Date') ? 'MM/YYYY' : 'Enter name'}
                  className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                  labelClassName="text-cyan-700"
                />
                {getNestedError(errors, `newAchievement.${fieldKey}`) && (
                  <p className="text-sm text-red-700 mt-1">
                    {getNestedError(errors, `newAchievement.${fieldKey}`)}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div className="mb-6">
            <Textarea
              id="description"
              label="Key Contribution Description"
              {...register('newAchievement.description')}
              placeholder="Describe your achievement (max 1000 characters)"
              className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
              labelClassName="text-cyan-700"
              maxLength={1000}
              rows={4}
            />
            {getNestedError(errors, 'newAchievement.description') && (
              <p className="text-sm text-red-700 mt-1">
                {getNestedError(errors, 'newAchievement.description')}
              </p>
            )}
          </div>

          <div className="border-t border-cyan-100 pt-6 mt-6">
            <h3 className="text-lg font-medium text-cyan-800 mb-4">Reference Contact</h3>
            {getNestedError(errors, 'newAchievement.reference') && (
              <p className="text-sm text-red-700 mb-4">
                Please complete all reference contact fields.
              </p>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {referenceFields.map(field => {
                const errorMessage = getNestedError(errors, field.registerId);

                return (
                  <div key={field.id}>
                    <Input
                      id={field.id}
                      label={field.label}
                      type={field.type || 'text'}
                      {...register(field.registerId)}
                      placeholder={field.placeholder}
                      className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                      labelClassName="text-cyan-700"
                    />
                    {errorMessage && (
                      <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 p-6 bg-gray-50 border-t border-cyan-100">
          <Button
            label="Cancel"
            variant="outline"
            onClick={onClose}
            className="text-cyan-600 border-cyan-200 hover:bg-cyan-50"
          />
          <Button
            label="Submit"
            variant="primary"
            onClick={handleModalSubmit}
            className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white hover:from-cyan-500 hover:to-blue-500"
          />
        </div>
      </div>
    </div>
  );
};