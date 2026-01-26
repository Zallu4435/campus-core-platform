import { FaCalendarAlt } from 'react-icons/fa';
import { usePreferences } from '../../../../application/context/PreferencesContext';
import { CalendarProps, LegendProps } from '../../../../domain/types/dashboard/user';

export default function Calendar({ calendarDays }: CalendarProps) {
  const { styles, theme } = usePreferences();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const typeColor: Record<string, string> = {
    event: styles.status.info,
    sport: styles.status.warning,
    club: styles.status.success,
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-xl ${styles.backgroundSecondary} group hover:shadow-2xl transition-all duration-500`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.backgroundSecondary}`}></div>
      <div className={`absolute inset-0 bg-gradient-to-r ${styles.orb.secondary} group-hover:opacity-40 transition-all duration-500`}></div>
      <div className={`absolute -bottom-8 sm:-bottom-16 -right-8 sm:-right-16 w-32 h-32 sm:w-56 sm:h-56 rounded-full bg-gradient-to-br ${styles.orb.primary} blur-2xl sm:blur-3xl animate-pulse`}></div>
      <div className={`absolute -top-4 sm:-top-8 -left-4 sm:-left-8 w-16 h-16 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${styles.orb.secondary} blur-xl sm:blur-2xl animate-pulse delay-700`}></div>
      <div className={`absolute top-2 sm:top-4 right-2 sm:right-4 w-8 h-8 sm:w-16 sm:h-16 ${styles.pattern.primary} rounded-full rotate-45 group-hover:rotate-90 transition-transform duration-700`}></div>
      <div className={`absolute bottom-4 sm:bottom-8 left-4 sm:left-8 w-4 h-4 sm:w-8 sm:h-8 bg-gradient-to-br ${styles.pattern.secondary} rounded-lg rotate-12 group-hover:rotate-45 transition-transform duration-500`}></div>
      <div className="relative z-10 p-4 sm:p-5 md:p-7">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br ${styles.accent} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110`}>
                <div className="absolute inset-0 rounded-xl sm:rounded-2xl bg-gradient-to-br from-white/20 to-transparent"></div>
                <FaCalendarAlt size={16} className="sm:w-5 sm:h-5 text-white relative z-10" />
              </div>
              <div className={`absolute -inset-1 bg-gradient-to-br ${styles.orb.primary} rounded-xl sm:rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity duration-300`}></div>
            </div>
            <div>
              <h2 className={`text-lg sm:text-xl md:text-2xl font-bold ${theme == 'dark' ? 'text-white' : 'text-gray-800'} bg-clip-text`}>
                Calendar
              </h2>
              <div className={`h-0.5 sm:h-1 w-12 sm:w-16 bg-gradient-to-r ${styles.accent} rounded-full mt-1 group-hover:w-16 sm:group-hover:w-24 transition-all duration-300`}></div>
            </div>
          </div>
          <div
            className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${styles.button.secondary} border ${styles.borderSecondary}`}
          >
            {now.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
            <div
              key={day}
              className={`py-1 font-medium ${styles.textSecondary} ${styles.card.background} ${styles.card.border} rounded-md backdrop-blur-md`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1 text-center">
          {days.map((day, idx) => {
            if (!day) return <div key={`empty-${idx}`} className="py-1.5 sm:py-2" />;
            const entries = calendarDays[day] || [];
            const isToday = day === now.getDate();
            return (
              <div
                key={`day-${idx}`}
                className={`group/day relative py-1.5 sm:py-2 rounded-lg ${styles.card.background} cursor-pointer transition-all duration-300 border ${styles.card.border} shadow-sm hover:shadow-md transform hover:scale-105 ${isToday ? `ring-2 ring-${styles.icon.primary.replace('text-', '')}` : ''}`}
              >
                <span className={`text-xs sm:text-sm ${styles.textPrimary} ${isToday ? 'font-bold' : ''} relative z-10`}>{day}</span>
                <div className="flex justify-center gap-0.5 mt-1">
                  {entries.map((entry, i) => (
                    <span
                      key={`${entry.type}-${entry.title}-${i}`}
                      title={`${entry.type}: ${entry.title}`}
                      className={`inline-block w-2 h-2 rounded-full ${typeColor[entry.type] || styles.status.info}`}
                    ></span>
                  ))}
                </div>
                {entries.length > 0 && (
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1 hidden group-hover/day:block z-20 bg-white dark:bg-gray-900 text-xs rounded shadow-lg px-2 py-1 border border-gray-200 dark:border-gray-700">
                    {entries.map((entry, i) => (
                      <div key={`${entry.type}-${entry.title}-tooltip-${i}`} className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full inline-block ${typeColor[entry.type] || styles.status.info}`}></span>
                        <span>{entry.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 text-xs">
          <Legend color={styles.status.info} label="Event" styles={styles} />
          <Legend color={styles.status.warning} label="Sport" styles={styles} />
          <Legend color={styles.status.success} label="Club" styles={styles} />
        </div>

      </div>
    </div>
  );
}

function Legend({ color, label, styles }: LegendProps) {
  return (
    <div className={`flex items-center ${styles.card.background} px-2 py-1 rounded-md ${styles.card.border} hover:bg-white/90 transition-all duration-300 backdrop-blur-md`}>
      <span
        className={`w-2 h-2 sm:w-3 sm:h-3 inline-block bg-opacity-10 rounded-full mr-1 border border-opacity-20`}
        style={{ backgroundColor: color.replace('text-', 'bg-') + '/10', borderColor: color.replace('text-', 'bg-') + '/20' }}
      ></span>
      <span className={`text-xs font-medium ${styles.textSecondary}`}>{label}</span>
    </div>
  );
}