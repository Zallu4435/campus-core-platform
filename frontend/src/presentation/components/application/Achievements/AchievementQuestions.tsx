import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { AchievementQuestionsProps } from '../../../../domain/types/application';
import { Textarea } from '../../base/Textarea';
import { getNestedError } from '../../../../shared/utils/formErrors';
import { AchievementFormData } from '../../../../domain/validation/user/AchievementSchema';

export const AchievementQuestions: React.FC<AchievementQuestionsProps> = ({ questions }) => {
  const { register, formState: { errors } } = useFormContext<AchievementFormData>();

  return (
    <div className="mb-8 bg-white rounded-xl border border-cyan-100 overflow-hidden">
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 border-b border-cyan-100">
        <h3 className="text-lg font-medium text-cyan-900">Short Questions and Answers</h3>
      </div>

      <div className="p-6">
        <div className="bg-cyan-50 border-l-4 border-cyan-400 p-4 rounded mb-6">
          <p className="text-sm text-cyan-800 font-medium">This section is MANDATORY</p>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-sm text-cyan-800">
            As part of our admissions process, we would like to get to know you better through a series of 5 short response questions.
            This is a self-evaluation of your interests and suitability for the programme, so please answer simply and honestly in Standard English,
            and in your own words. Do not use any external aid such as Artificial Intelligence or Ghostwriting: doing so may have a negative impact
            on your application.
          </p>
          <p className="text-sm italic text-cyan-600">
            Each question has a character limit, so avoid verbose answers and write straight to the point.
          </p>
        </div>

        <div className="space-y-8">
          {questions.map((q) => (
            <div key={q.id} className="border border-cyan-100 rounded-lg p-4">
              <label className="block mb-3 text-cyan-800 font-medium">
                {q.id}. {q.question}
                {q.hint && (
                  <span className="block mt-1 italic text-cyan-600 text-sm">
                    {q.hint}
                  </span>
                )}
              </label>
              <Textarea
                id={`question-${q.id}`}
                {...register(`questions.${q.id}` as any)}
                maxLength={q.maxLength}
                rows={6}
                required
                placeholder="Type your answer here"
                className="border-cyan-200 focus:border-cyan-400 focus:ring-cyan-200 text-cyan-800 placeholder-cyan-400"
                error={getNestedError(errors, `questions.${q.id}` as any)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};