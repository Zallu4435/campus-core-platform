import React from 'react';
import {
  FaUser,
  FaCalendarAlt,
  FaClock,
  FaCheckCircle,
  FaCircle,
  FaMicrophone,
  FaVideo,
  FaDesktop,
  FaComments,
  FaUsers,
} from 'react-icons/fa';
import {
  getStatusBadge,
  getDifficultyBadge,
  getActionButton
} from '../utils/sessionUtils';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../../../appStore/store';
import { BackendSession, SessionCardProps } from '../../../../../domain/types/canvas/session';

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  userAccess,
  styles,
  onToggleWatched,
  onJoinSession,
}) => {
  const backendSession = session as unknown as BackendSession;
  const user = useSelector((state: RootState) => state.auth.user);
  const status = (session.status || '').toLowerCase();

  const start = session.startTime ? new Date(session.startTime) : null;
  const dateStr = start ? start.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';
  const timeStr = start ? start.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const avatar = (backendSession.instructorAvatar as string) || '👤';
  const tags = (session.tags as string[]) || [];

  const sessionStyles = {
    status: styles.status,
    badgeBackground: styles.badgeBackground || styles.backgroundSecondary,
    button: styles.button,
    textSecondary: styles.textSecondary,
    success: styles.success || styles.status.success,
    error: styles.error || styles.status.error,
    info: styles.info || styles.status.info,
    border: styles.border,
    cardHover: styles.cardHover || styles.card.hover,
    cardShadow: styles.cardShadow || '',
    card: styles.card,
    icon: styles.icon,
    backgroundSecondary: styles.backgroundSecondary,
    accent: styles.accent
  };

  const getFrontendStatus = (backendStatus: string): string => {
    switch ((backendStatus || '').toLowerCase()) {
      case 'ongoing':
        return 'live';
      case 'scheduled':
        return 'upcoming';
      case 'ended':
        return 'completed';
      default:
        return (backendStatus || '').toLowerCase();
    }
  };
  const frontendStatus = getFrontendStatus(session.status);
  const hasRecording = session.hasRecording ?? false;
  const isEnrolled = session.isEnrolled ?? userAccess.isEnrolled;

  return (
    <div className={`group relative overflow-hidden ${styles.card.background} rounded-2xl border ${styles.border} shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500/30`}>
      {/* Decorative background pulse for live sessions */}
      {session.isLive && (
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-transparent to-transparent animate-pulse -z-10"></div>
      )}

      <div className="p-4 sm:p-7">
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-10">
          {/* Left: Thumbnail/Avatar Area */}
          <div className="relative w-full lg:w-40 xl:w-48 h-40 sm:h-48 lg:h-auto shrink-0 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 border ${styles.border}">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-5xl sm:text-6xl lg:text-7xl">
                {avatar || '👤'}
              </div>
            </div>
            {session.isLive && (
              <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                Live
              </div>
            )}
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 flex flex-col justify-between py-1">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-bold border border-blue-500/20`}>
                      {session.course}
                    </span>
                    {getDifficultyBadge(session.difficulty, sessionStyles) as React.ReactElement}
                    {getStatusBadge(status, sessionStyles, session.isLive) as React.ReactElement}
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-bold ${styles.textPrimary} tracking-tight leading-tight group-hover:text-blue-500 transition-colors duration-300`}>
                    {session.title}
                  </h3>
                </div>

                <div className="hidden sm:block">
                  {getActionButton(session, userAccess, sessionStyles, {
                    onJoin: () => onJoinSession?.(session.id || session._id || '', user?.id || ''),
                    onWatch: () => onToggleWatched(session.id || session._id || '')
                  }) as React.ReactElement}
                </div>
              </div>

              <p className={`${styles.textSecondary} text-sm sm:text-base leading-relaxed opacity-70 mb-6 line-clamp-2 sm:line-clamp-none`}>
                {session.description}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                  <FaUser className="w-4 h-4 text-blue-500" />
                  <div className="flex flex-col">
                    <span className={`${styles.textSecondary} text-[10px] font-medium uppercase tracking-wider`}>Instructor</span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>{session.instructor}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <FaCalendarAlt className="w-4 h-4 text-amber-500" />
                  <div className="flex flex-col">
                    <span className={`${styles.textSecondary} text-[10px] font-medium uppercase tracking-wider`}>Schedule</span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>{dateStr}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <FaClock className="w-4 h-4 text-emerald-500" />
                  <div className="flex flex-col">
                    <span className={`${styles.textSecondary} text-[10px] font-medium uppercase tracking-wider`}>Time & Duration</span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>{timeStr} • {session.duration} hrs</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                  <FaUsers className="w-4 h-4 text-indigo-500" />
                  <div className="flex flex-col">
                    <span className={`${styles.textSecondary} text-[10px] font-medium uppercase tracking-wider`}>Joined</span>
                    <span className={`text-sm font-semibold ${styles.textPrimary}`}>
                      {session.attendees || 0} / {session.maxAttendees || '∞'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className={`flex flex-col sm:flex-row items-center justify-between pt-6 border-t ${styles.border} gap-4`}>
              <div className="flex flex-wrap items-center gap-2">
                {(tags || []).map((tag: string) => (
                  <span key={tag} className={`px-3 py-1 bg-white/5 ${styles.textSecondary} rounded-lg text-[10px] font-bold uppercase border border-white/5 tracking-wider hover:bg-white/10 transition-colors cursor-default`}>
                    #{tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 w-full sm:w-auto">
                <div className="sm:hidden w-full">
                  {getActionButton(session, userAccess, sessionStyles, {
                    onJoin: () => onJoinSession?.(session.id || session._id || '', user?.id || ''),
                    onWatch: () => onToggleWatched(session.id || session._id || '')
                  }) as React.ReactElement}
                </div>
                {frontendStatus === 'completed' && hasRecording && isEnrolled && (
                  <button
                    onClick={() => onToggleWatched(session.id || session._id || '')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all duration-300 transform active:scale-95`}
                    aria-label={userAccess.watchedSessions.includes(session.id || session._id || '') ? 'Mark as unwatched' : 'Mark as watched'}
                  >
                    {userAccess.watchedSessions.includes(session.id || session._id || '') ? (
                      <>
                        <FaCheckCircle className="w-3.5 h-3.5" />
                        <span>WATCHED</span>
                      </>
                    ) : (
                      <>
                        <FaCircle className="w-3.5 h-3.5 opacity-40" />
                        <span>MARK AS WATCHED</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {session.isLive && (
          <div className={`mt-6 p-4 bg-rose-500/5 rounded-2xl border ${styles.border}`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center -space-x-2 group-hover:-space-x-1 transition-all duration-500">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-blue-500 shadow-lg">
                    <FaMicrophone className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-rose-500 shadow-lg">
                    <FaVideo className="w-3.5 h-3.5" />
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-emerald-500 shadow-lg">
                    <FaDesktop className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className={`text-[10px] font-bold uppercase tracking-widest text-rose-500`}>Session Active</span>
                  <span className={`text-xs ${styles.textSecondary} opacity-60`}>All classroom features are currently available</span>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-500">
                <FaComments className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">Chat Active</span>
              </div>
            </div>
          </div>
        )}

        {backendSession.joinUrl && (backendSession.status === 'Ongoing' || session.status === 'live' || session.isLive) && (
          <div className="mt-6 flex justify-center lg:hidden">
            {/* Mobile only join button if it was missing above */}
          </div>
        )}
      </div>
    </div>
  );
};