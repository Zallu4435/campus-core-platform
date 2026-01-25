import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Input } from '../../base/Input';
import { Select } from '../../base/Select';
import { Button } from '../../base/Button';
import { RadioGroup } from '../../base/RadioGroup';
import { SubjectModal } from './SubjectModal';
import { countryOptions, examOptions } from './options';
import { getNestedObjectError } from '../../../../shared/utils/formErrors';

interface InternationalSchoolInfoProps {
  onNext: () => void;
}

export const InternationalSchoolInfo: React.FC<InternationalSchoolInfoProps> = ({ onNext }) => {
  const { control, formState: { errors }, trigger } = useFormContext();
  const { fields: subjects, append, remove } = useFieldArray({
    control,
    name: 'international.subjects',
  });
  const [showSubjectModal, setShowSubjectModal] = React.useState(false);

  const handleAddSubject = async (newSubject: {
    subject: string;
    otherSubject: string;
    grade: string;
  }) => {
    append(newSubject);
    setShowSubjectModal(false);
  };

  const handleNext = async () => {
    // Validate only the school-related fields and subjects
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
      onNext();
    }
  };

  return (
    <div className="p-6">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
        <h2 className="text-xl font-semibold text-cyan-900">International High School Education</h2>
      </div>

      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 mb-8">
          <Controller
            name="international.schoolName"
            control={control}
            render={({ field }) => (
              <Input
                id="schoolName"
                name="international.schoolName"
                label="Name of School"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Enter school name"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'schoolName')}
              />
            )}
          />
          <Controller
            name="international.country"
            control={control}
            render={({ field }) => (
              <Select
                id="country"
                name="international.country"
                label="Country"
                options={countryOptions}
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Select country"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'country')}
              />
            )}
          />
          <Controller
            name="international.from"
            control={control}
            render={({ field }) => (
              <Input
                id="from"
                name="international.from"
                label="From"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Start year"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'from')}
              />
            )}
          />
          <Controller
            name="international.to"
            control={control}
            render={({ field }) => (
              <Input
                id="to"
                name="international.to"
                label="To"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="End year"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'to')}
              />
            )}
          />
          <Controller
            name="international.examination"
            control={control}
            render={({ field }) => (
              <Select
                id="examination"
                name="international.examination"
                label="Examination"
                options={examOptions}
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="Select examination"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'examination')}
              />
            )}
          />
          <Controller
            name="international.examMonthYear"
            control={control}
            render={({ field }) => (
              <Input
                id="examMonthYear"
                name="international.examMonthYear"
                label="Exam Month/Year"
                value={field.value}
                onChange={field.onChange}
                required
                placeholder="e.g. 06/2023"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'examMonthYear')}
              />
            )}
          />
          <Controller
            name="international.resultType"
            control={control}
            render={({ field }) => (
              <RadioGroup
                name="international.resultType"
                label="Result Type"
                options={[
                  { label: 'Actual', value: 'actual' },
                  { label: 'Predicted/Forecast', value: 'predicted' },
                ]}
                selectedValue={field.value}
                onChange={field.onChange}
                required
                className="md:col-span-2 mt-2 text-cyan-700"
                error={getNestedObjectError(errors, 'international', 'resultType')}
              />
            )}
          />
        </div>

        {/* Subjects Table */}
        <div className="border border-cyan-200 rounded-lg overflow-hidden mb-8">
          <div className="flex justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
            <h3 className="text-lg font-medium text-cyan-800">Subjects</h3>
            <Button
              label="Add Subject"
              onClick={() => setShowSubjectModal(true)}
              variant="primary"
              className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm relative overflow-hidden group"
            />
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-cyan-50 border-b border-cyan-200">
                <th className="py-3 px-4 text-left font-medium text-cyan-800">Subject</th>
                <th className="py-3 px-4 text-left font-medium text-cyan-800">Other Subject</th>
                <th className="py-3 px-4 text-left font-medium text-cyan-800">Grade</th>
                <th className="py-3 px-4 text-left font-medium text-cyan-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subjects.length === 0 ? (
                <tr>
                  <td className="py-2 px-3 text-gray-500" colSpan={4}>
                    No record(s)
                  </td>
                </tr>
              ) : (
                subjects.map((subj, idx) => {
                  const s = subj as { id: string; subject?: string; otherSubject?: string; grade?: string };
                  return (
                    <tr key={s.id} className="border-b border-cyan-100">
                      <td className="py-2 px-3">{s.subject}</td>
                      <td className="py-2 px-3">{s.otherSubject || '-'}</td>
                      <td className="py-2 px-3">{s.grade}</td>
                      <td className="py-2 px-3">
                        <Button
                          label="Remove"
                          onClick={() => remove(idx)}
                          variant="outline"
                          className="text-cyan-600 hover:text-cyan-700 border border-cyan-300 hover:border-cyan-400 px-3 py-1 rounded-md"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end">
          <Button
            label="Next"
            type="button"
            variant="primary"
            onClick={handleNext}
            className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-6 py-3 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm relative overflow-hidden group"
          />
        </div>
      </div>

      <SubjectModal
        showModal={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        existingSubjects={subjects.map(s => {
          const subj = s as { subject?: string; otherSubject?: string };
          return subj.subject === 'other' ? (subj.otherSubject || '') : (subj.subject || '');
        })}
        onSubmit={handleAddSubject}
      />
    </div>
  );
};