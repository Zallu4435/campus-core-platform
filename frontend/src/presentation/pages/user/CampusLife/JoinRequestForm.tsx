import { FaPaperPlane, FaTimes } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { joinRequestSchema, JoinRequestFormValues } from '../../../../domain/validation/user/JoinRequestSchema';
import { JoinRequestFormProps } from '../../../../domain/types/user/campus-life';

export default function JoinRequestForm({ onSubmit, onCancel, isLoading, title }: JoinRequestFormProps) {
  const { styles, theme } = usePreferences();
  const maxReasonLength = 500;
  const maxAdditionalInfoLength = 300;
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<JoinRequestFormValues>({
    resolver: zodResolver(joinRequestSchema),
    mode: 'onTouched',
  });

  const watchedReason = watch('reason', '');
  const watchedAdditionalInfo = watch('additionalInfo', '');

  const onFormSubmit = (data: JoinRequestFormValues) => {
    onSubmit(data);
    reset();
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl shadow-xl ${styles.card.background} border ${styles.border} group hover:${styles.card.hover} transition-all duration-500`}>
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-2xl blur transition-all duration-300`}></div>
      <div className={`absolute -top-8 -left-8 w-48 h-48 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-3xl animate-pulse`}></div>
      <div className={`absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-2xl animate-pulse delay-700`}></div>

      <div className="relative z-10 p-4 sm:p-6">
        <div className="flex items-center space-x-4 mb-4 sm:mb-6">
          <div className="relative">
            <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <FaPaperPlane size={16} className="text-white relative z-10" />
            </div>
            <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
          <div>
            <h3 className={`text-lg sm:text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
              Request to Join {title}
            </h3>
            <div className={`h-1 w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-24 transition-all duration-300`}></div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 sm:space-y-5">
          <div>
            <label
              htmlFor="reason"
              className={`block text-sm font-medium ${styles.textPrimary} mb-1`}
            >
              Why do you want to join?
            </label>
            <textarea
              id="reason"
              {...register('reason')}
              className={`block w-full px-4 py-2 ${styles.input.background} border ${styles.input.border} rounded-lg focus:${styles.input.focus} transition-all duration-300 text-sm sm:text-base ${styles.textSecondary} placeholder-${styles.textSecondary}`}
              rows={3}
              required
              placeholder="Tell us why you're interested in joining..."
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs ${errors.reason ? styles.status.error : styles.textSecondary}`}>
                {errors.reason?.message || 'Required'}
              </p>
              <p className={`text-xs ${styles.textSecondary}`}>
                {watchedReason.length}/{maxReasonLength}
              </p>
            </div>
          </div>

          <div>
            <label
              htmlFor="additionalInfo"
              className={`block text-sm font-medium ${styles.textPrimary} mb-1`}
            >
              Additional Information
            </label>
            <textarea
              id="additionalInfo"
              {...register('additionalInfo')}
              className={`block w-full px-4 py-2 ${styles.input.background} border ${styles.input.border} rounded-lg focus:${styles.input.focus} transition-all duration-300 text-sm sm:text-base ${styles.textSecondary} placeholder-${styles.textSecondary}`}
              rows={2}
              placeholder="Any additional information you'd like to share..."
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <p className={`text-xs ${errors.additionalInfo ? styles.status.error : styles.textSecondary}`}>
                {errors.additionalInfo?.message || 'Optional'}
              </p>
              <p className={`text-xs ${styles.textSecondary}`}>
                {(watchedAdditionalInfo || '').length}/{maxAdditionalInfoLength}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-4 border-t border-amber-100/50">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className={`group/btn px-4 sm:px-6 py-2 sm:py-3 ${styles.textSecondary} ${styles.card.background} border ${styles.border} hover:${styles.card.hover} rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base`}
            >
              <span>Cancel</span>
              <FaTimes size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`group/btn px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r ${styles.accent} hover:${styles.button.primary} text-white rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 text-sm sm:text-base min-w-[160px]`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Request</span>
                  <FaPaperPlane size={12} className="group-hover/btn:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
