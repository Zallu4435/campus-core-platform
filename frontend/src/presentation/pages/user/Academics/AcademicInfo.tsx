import { FaGraduationCap } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';

export default function AcademicInfo({ major = 'Computer Science', academicStanding = 'Good', advisor = 'Dr. Emma Wilson', catalogYear = '2025-2029' }) {
  const { styles, theme } = usePreferences();

  return (
    <div className={`relative overflow-hidden border-b ${styles.borderSecondary}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.accentSecondary} backdrop-blur-md`}></div>
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.secondary}`}></div>
      <div className={`absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-24 h-24 sm:w-48 sm:h-48 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
      <div className={`absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-700`}></div>

      <div className="w-full sm:px-4 md:px-4 py-4 sm:py-6 relative z-10">
        <div className={`group relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl ${styles.card.background} hover:${styles.card.hover} transition-all duration-300 border ${styles.border}`}>
          <div className={`absolute -inset-0.5 bg-gradient-to-r ${styles.orb.secondary} rounded-xl sm:rounded-2xl blur transition-all duration-300`}></div>

          <div className="relative z-10 p-4 sm:p-5 md:p-6">
            <div className="flex items-center space-x-3 sm:space-x-4 mb-3 sm:mb-4">
              <div className="relative">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                  <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                  <FaGraduationCap size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
                </div>
                <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
              </div>
              <div>
                <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                  Academic Information
                </h2>
                <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
              </div>
            </div>

            <p className={`${styles.textSecondary} text-xs sm:text-sm md:text-sm leading-relaxed`}>
              <span className="font-medium">Current Major:</span> {major} |{' '}
              <span className="font-medium">Catalog Year:</span> {catalogYear} |{' '}
              <span className="font-medium">Academic Standing:</span> {academicStanding} |{' '}
              <span className="font-medium">Advisor:</span> {advisor}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}