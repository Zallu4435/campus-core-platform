import { FaCalendarAlt, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { Deadline, DeadlinesProps } from '../../../../domain/types/dashboard/user';

export default function Deadlines({ deadlines }: DeadlinesProps) {
  const { styles, theme } = usePreferences();

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl ${styles.backgroundSecondary} group hover:shadow-2xl transition-all duration-500`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-l ${styles.orb.secondary} group-hover:opacity-40 transition-all duration-500`}></div>
      <div className={`absolute -top-8 sm:-top-16 -left-8 sm:-left-16 w-32 h-32 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
      <div className={`absolute -bottom-4 sm:-bottom-8 -right-4 sm:-right-8 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-500`}></div>
      <div className={`absolute top-3 sm:top-6 right-3 sm:right-6 w-6 h-6 sm:w-12 sm:h-12 ${styles.pattern.primary} rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-700`}></div>
      <div className={`absolute bottom-2 sm:bottom-4 left-2 sm:left-4 w-3 h-3 sm:w-6 sm:h-6 bg-gradient-to-br ${styles.pattern.secondary} rounded-full group-hover:scale-150 transition-transform duration-500`}></div>
      <div className="relative z-10 p-4 sm:p-5 md:p-7">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <div className="relative">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <FaCalendarAlt size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
            </div>
            <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme == 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
              Upcoming Deadlines
            </h2>
            <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {deadlines && deadlines.length > 0 ? (
            deadlines.map((item: Deadline, index: number) => (
              <div
                key={index}
                className={`group/item relative overflow-hidden backdrop-blur-md rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02] ${item.urgent
                  ? `${styles.status.error}/10 hover:${styles.status.error}/20 border-${styles.status.error.replace('text-', '')}/20`
                  : `${styles.card.background} ${styles.card.border} ${styles.card.hover}`
                  }`}
              >
                <div className={`absolute -inset-0.5 rounded-xl sm:rounded-2xl blur transition-all duration-300 ${item.urgent
                  ? `bg-gradient-to-r ${styles.status.error}/10 group-hover/item:${styles.status.error}/20`
                  : `bg-gradient-to-r ${styles.orb.secondary} group-hover/item:opacity-20`
                  }`}></div>
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-2 sm:mb-3">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {item.urgent && (
                        <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-opacity-10 border-2" style={{ backgroundColor: styles.status.error.replace('text-', 'bg-') + '/10', borderColor: styles.status.error.replace('text-', 'bg-') + '/20' }}>
                          <FaExclamationTriangle className={`${styles.status.error}`} size={12} />
                        </div>
                      )}
                      <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${item.urgent ? `${styles.status.error} animate-pulse` : `bg-gradient-to-br ${styles.accent}`}`}></div>
                    </div>
                    <div className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${item.urgent
                      ? `bg-opacity-10 text-${styles.status.error.replace('text-', '')} border border-opacity-20`
                      : `${styles.button.secondary} border ${styles.borderSecondary}`
                      }`} style={item.urgent ? { backgroundColor: styles.status.error.replace('text-', 'bg-') + '/10', borderColor: styles.status.error.replace('text-', 'bg-') + '/20' } : {}}>
                      {item.urgent ? 'Urgent' : 'Scheduled'}
                    </div>
                  </div>
                  <h3 className={`text-sm sm:text-base font-semibold ${styles.textPrimary} group-hover/item:text-gray-900 transition-colors duration-200 mb-1 sm:mb-2`}>
                    {item.title}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <FaClock className={`${item.urgent ? styles.status.error : styles.icon.secondary}`} size={10} />
                    <p className={`text-xs sm:text-sm font-medium ${item.urgent ? styles.status.error : styles.textSecondary}`}>
                      {item.urgent && '⚠️ '}
                      {new Date(item.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </p>
                  </div>
                  <div className="mt-2 sm:mt-3">
                    <div className={`h-1 sm:h-1.5 ${styles.progress.background} rounded-full overflow-hidden`}>
                      <div
                        className={`h-full ${styles.progress.fill} rounded-full transition-all duration-1000 ${item.urgent ? 'w-5/6' : 'w-1/2'
                          }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className={`w-12 h-12 rounded-full ${styles.backgroundSecondary} flex items-center justify-center mb-3 bg-opacity-50`}>
                <FaCalendarAlt className={`${styles.textSecondary} opacity-50`} size={20} />
              </div>
              <p className={`text-sm font-medium ${styles.textSecondary}`}>No upcoming deadlines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}