import React from 'react';
import { useFormContext, Controller, useFieldArray } from 'react-hook-form';
import { Input } from '../../base/Input';
import { Button } from '../../base/Button';
import { getNestedObjectError, getArrayError } from '../../../../shared/utils/formErrors';

const APSection: React.FC = () => {
  const { control, formState: { errors } } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'international.ap.subjects',
  });

  return (
    <div className="mb-8 bg-white rounded-lg border border-cyan-100 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
        <h3 className="text-lg font-medium text-cyan-900">AP Test Score</h3>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="flex flex-col">
            <span className="text-cyan-700 text-sm font-medium mb-2">Test Type</span>
            <span className="text-cyan-900">Advanced Placement (AP)</span>
          </div>
          <Controller
            name="international.ap.date"
            control={control}
            render={({ field }) => (
              <Input
                name="apDate"
                id="apDate"
                label="Date Taken"
                value={field.value}
                onChange={field.onChange}
                placeholder="MM/YYYY"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                labelClassName="text-cyan-700"
                error={getNestedObjectError(errors, 'international.ap', 'date')}
              />
            )}
          />
        </div>

        <div className="border border-cyan-200 rounded-lg overflow-hidden">
          <div className="flex justify-between p-4 bg-gradient-to-r from-cyan-50 to-blue-50 border-b border-cyan-100">
            <h4 className="text-lg font-medium text-cyan-800">Subjects</h4>
            <Button
              label="Add Subject"
              onClick={() => append({ subject: '', score: '' })}
              variant="primary"
              className="bg-gradient-to-r from-cyan-400 to-blue-400 text-white px-4 py-2 rounded-lg hover:from-cyan-500 hover:to-blue-500 transition-all duration-300 shadow-sm"
            />
          </div>

          {getNestedObjectError(errors, 'international.ap', 'subjects') && (
            <div className="mx-4 mt-4 p-3 bg-red-50 border-l-4 border-red-500 rounded text-sm text-red-700 flex items-center gap-2">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getNestedObjectError(errors, 'international.ap', 'subjects')}</span>
            </div>
          )}

          <table className="w-full">
            <thead>
              <tr className="bg-cyan-50 border-b border-cyan-200">
                <th className="text-left p-3 text-cyan-800 font-medium">Subject</th>
                <th className="text-left p-3 text-cyan-800 font-medium">Score</th>
                <th className="text-left p-3 text-cyan-800 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {fields.length === 0 ? (
                <tr>
                  <td className="p-3 text-gray-500" colSpan={3}>No subjects added</td>
                </tr>
              ) : (
                fields.map((field, index) => (
                  <tr key={field.id} className="border-b border-cyan-100">
                    <td className="p-3">
                      <Controller
                        name={`international.ap.subjects[${index}].subject`}
                        control={control}
                        render={({ field: subField }) => (
                          <Input
                            name={`apSubject-${index}`}
                            id={`apSubject-${index}`}
                            value={subField.value}
                            onChange={subField.onChange}
                            placeholder="AP Subject Name"
                            className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                            error={getArrayError(errors, 'international.ap.subjects', index)}
                          />
                        )}
                      />
                    </td>
                    <td className="p-3">
                      <Controller
                        name={`international.ap.subjects[${index}].score`}
                        control={control}
                        render={({ field: subField }) => (
                          <Input
                            name={`apScore-${index}`}
                            id={`apScore-${index}`}
                            value={subField.value}
                            onChange={subField.onChange}
                            placeholder="1-5"
                            className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 bg-white"
                            error={getArrayError(errors, 'international.ap.subjects', index)}
                          />
                        )}
                      />
                    </td>
                    <td className="p-3">
                      <Button
                        label="Remove"
                        onClick={() => remove(index)}
                        variant="outline"
                        className="text-cyan-600 hover:text-cyan-700 border border-cyan-300 hover:border-cyan-400 px-3 py-1 rounded-md"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default APSection;