import React from 'react';
import { SessionHeaderProps } from '../../../../../domain/types/canvas/session';

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  userName,
  currentTime,
  isEnrolled,
  sessionCount,
  styles
}) => {
  return (
    <div className={`bg-transparent`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 pb-4">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className={`h-1.5 w-12 bg-gradient-to-r ${styles.accent} rounded-full`}></div>
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-wider ${styles.textSecondary}`}>Virtual Classroom</span>
            </div>
            <h1 className={`text-3xl sm:text-4xl font-black ${styles.textPrimary} tracking-tight leading-none`}>
              Live <span className={`text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600`}>Sessions</span>
            </h1>
            <p className={`text-sm sm:text-base ${styles.textSecondary} mt-3 opacity-80 max-w-xl`}>
              Join interactive lectures and workshops for <span className="font-semibold text-blue-500">Advanced Web Development</span>.
            </p>
          </div>

          <div className={`flex items-center gap-4 ${styles.card.background} backdrop-blur-md p-3 rounded-2xl border ${styles.border} shadow-xl`}>
            <div className="flex flex-col items-end">
              <span className={`${styles.textSecondary} text-[10px] font-medium opacity-60`}>Welcome back,</span>
              <span className={`font-bold ${styles.textPrimary} text-sm`}>{userName}</span>
            </div>
            <div className={`w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg shadow-blue-500/20`}>
              {userName.charAt(0)}
            </div>
          </div>
        </div>

        <div className={`flex flex-wrap items-center gap-3 mt-8 p-1.5 ${styles.card.background} backdrop-blur-md rounded-full border ${styles.border} w-fit`}>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${isEnrolled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'} text-[10px] sm:text-xs font-bold border border-current/20`}>
            <div className={`w-1.5 h-1.5 rounded-full bg-current ${isEnrolled ? 'animate-pulse' : ''}`}></div>
            {isEnrolled ? 'ENROLLED' : 'NOT ENROLLED'}
          </div>
          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-500 text-[10px] sm:text-xs font-bold border border-blue-500/20`}>
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {currentTime.toLocaleDateString()}
          </div>
          <div className="h-4 w-px bg-white/10 mx-1 hidden sm:block"></div>
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-500 text-[10px] sm:text-xs font-bold border border-indigo-500/20`}>
            {sessionCount} AVAILABLE SESSIONS
          </div>
        </div>
      </div>
    </div>
  );
}; 