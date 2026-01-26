import { FaCalendarAlt, FaMapMarkerAlt } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { NewEventsProps } from '../../../../domain/types/dashboard/user';

// Mock data removed in favor of real API data

export default function NewEvents({ events }: NewEventsProps) {
  const { styles, theme } = usePreferences();
  const displayEvents = events;

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl ${styles.backgroundSecondary} group hover:shadow-2xl transition-all duration-500`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.secondary} group-hover:opacity-40 transition-all duration-500`}></div>
      <div className={`absolute -bottom-8 sm:-bottom-16 -right-8 sm:-right-16 w-32 h-32 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
      <div className={`absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-700`}></div>
      <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-16 sm:h-16 ${styles.pattern.primary} rounded-full rotate-45 group-hover:rotate-90 transition-transform duration-700`}></div>
      <div className={`absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-br ${styles.pattern.secondary} rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-500`}></div>
      <div className="relative z-10 p-4 sm:p-5 md:p-7">
        <div className="flex items-center space-x-3 sm:space-x-4 mb-4 sm:mb-6">
          <div className="relative">
            <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
              <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
              <FaCalendarAlt size={18} className="sm:w-5 sm:h-5 text-white relative z-10" />
            </div>
            <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme == 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
              New Events
            </h2>
            <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
          </div>
        </div>
        <div className="space-y-3 sm:space-y-4">
          {displayEvents && displayEvents.length > 0 ? (
            displayEvents.map((event) => (
              <div
                key={event.id}
                className={`group/item relative overflow-hidden ${styles.card.background} ${styles.card.border} ${styles.card.hover} rounded-xl sm:rounded-2xl p-3 sm:p-4 md:p-5 transition-all duration-300 shadow-sm hover:shadow-lg transform hover:scale-[1.02] backdrop-blur-md`}
              >
                <div className="relative z-10 flex flex-col gap-1">
                  <div className="flex items-center gap-2 mb-1">
                    <FaCalendarAlt className={`${styles.icon.secondary}`} size={14} />
                    <span className={`text-xs sm:text-sm font-semibold ${styles.textPrimary}`}>
                      {new Date(event.date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                    <FaMapMarkerAlt className={`ml-2 ${styles.icon.secondary}`} size={13} />
                    <span className={`text-xs sm:text-sm ${styles.textSecondary}`}>{event.location}</span>
                  </div>
                  <h3 className={`text-sm sm:text-base font-semibold ${styles.textPrimary}`}>{event.title}</h3>
                  <p className={`text-xs sm:text-sm ${styles.textSecondary}`}>{event.description}</p>
                </div>
                <div className={`absolute bottom-0 left-0 h-0.5 sm:h-1 w-0 bg-gradient-to-r ${styles.accent} group-hover/item:w-full transition-all duration-300 rounded-full`}></div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className={`w-12 h-12 rounded-full ${styles.backgroundSecondary} flex items-center justify-center mb-3 bg-opacity-50`}>
                <FaCalendarAlt className={`${styles.textSecondary} opacity-50`} size={20} />
              </div>
              <p className={`text-sm font-medium ${styles.textSecondary}`}>No new events</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 