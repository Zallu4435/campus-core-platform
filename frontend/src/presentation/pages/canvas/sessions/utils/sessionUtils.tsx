import React from 'react';
import {
  FaWifi,
  FaSignal,
  FaLock,
  FaPlay,
} from 'react-icons/fa';
import { Session, SessionStats } from '../../../../../domain/types/canvas/session';

export const getStatusBadge = (status: string, isLive?: boolean): React.JSX.Element => {
  const getDisplayStatus = (backendStatus: string, isLive?: boolean): { text: string; color: string; bg: string } => {
    if (isLive === true) {
      return { text: 'LIVE', color: 'text-rose-500', bg: 'bg-rose-500/10' };
    }

    switch (backendStatus?.toLowerCase()) {
      case 'ongoing':
      case 'live':
        return { text: 'LIVE', color: 'text-rose-500', bg: 'bg-rose-500/10' };
      case 'scheduled':
      case 'upcoming':
        return { text: 'UPCOMING', color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'ended':
      case 'completed':
        return { text: 'COMPLETED', color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'cancelled':
        return { text: 'CANCELLED', color: 'text-slate-500', bg: 'bg-slate-500/10' };
      default:
        return { text: (backendStatus || 'Unknown').toUpperCase(), color: 'text-blue-500', bg: 'bg-blue-500/10' };
    }
  };

  const { text, color, bg } = getDisplayStatus(status, isLive);

  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-current/20 ${color} ${bg} backdrop-blur-md shadow-lg shadow-black/5`}>
      {text}
    </span>
  );
};

export const getDifficultyBadge = (difficulty: Session['difficulty']): React.JSX.Element => {
  const config = {
    'Beginner': { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    'Intermediate': { color: 'text-amber-500', bg: 'bg-amber-500/10' },
    'Advanced': { color: 'text-rose-500', bg: 'bg-rose-500/10' }
  };

  const { color, bg } = config[difficulty] || config['Beginner'];

  return (
    <span className={`px-4 py-1 rounded-full text-[10px] font-black tracking-widest border border-current/20 ${color} ${bg} backdrop-blur-md`}>
      {difficulty?.toUpperCase()}
    </span>
  );
};

export const getConnectionQualityIcon = (quality: Session['connectionQuality']): React.JSX.Element | null => {
  switch (quality) {
    case 'excellent':
      return <FaWifi className={`w-4 h-4 text-emerald-500`} />;
    case 'good':
      return <FaSignal className={`w-4 h-4 text-amber-500`} />;
    case 'poor':
      return <FaWifi className={`w-4 h-4 text-rose-500`} />;
    default:
      return null;
  }
};

export const getActionButton = (
  session: Session,
  userAccess: { isEnrolled: boolean },
  actions?: { onJoin?: () => void; onWatch?: () => void }
): React.JSX.Element => {
  if (!userAccess.isEnrolled) {
    return (
      <button className={`flex items-center gap-3 px-8 py-3.5 bg-white/5 text-slate-400 font-black rounded-2xl cursor-not-allowed border border-white/10 text-xs tracking-widest shadow-xl`}>
        <FaLock className="w-4 h-4 opacity-40" />
        ENROLLMENT REQUIRED
      </button>
    );
  }

  const getSessionStatus = (backendStatus: string, isLive?: boolean): string => {
    if (isLive === true) return 'live';
    switch (backendStatus?.toLowerCase()) {
      case 'ongoing': return 'live';
      case 'scheduled': return 'upcoming';
      case 'ended': return 'completed';
      default: return backendStatus?.toLowerCase() || 'unknown';
    }
  };

  const status = getSessionStatus(session.status, session.isLive);

  switch (status) {
    case 'live':
      return (
        <button
          onClick={actions?.onJoin}
          className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl shadow-xl shadow-rose-500/20 hover:shadow-rose-500/40 hover:scale-105 active:scale-95 transition-all duration-300 text-xs font-black tracking-widest ring-1 ring-white/20`}
        >
          <FaPlay className="w-3 h-3 animate-pulse" />
          JOIN LIVE SESSION
        </button>
      );
    case 'completed':
      return session.hasRecording ? (
        <button
          onClick={actions?.onWatch}
          className={`flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all duration-300 text-xs font-black tracking-widest ring-1 ring-white/20`}
        >
          <FaPlay className="w-3 h-3" />
          WATCH RECORDING
        </button>
      ) : (
        <span className={`text-[10px] font-black tracking-widest px-6 py-4 bg-white/5 border border-white/5 rounded-2xl text-slate-500 italic uppercase opacity-50`}>
          No Recording
        </span>
      );
    default:
      return <></>;
  }
};

export const calculateSessionStats = (sessions: Session[], watchedSessions: string[]): SessionStats => {
  const getFrontendStatus = (backendStatus: string): string => {
    switch (backendStatus?.toLowerCase()) {
      case 'ongoing':
        return 'live';
      case 'scheduled':
        return 'upcoming';
      case 'ended':
        return 'completed';
      case 'cancelled':
        return 'cancelled';
      default:
        return backendStatus?.toLowerCase() || 'unknown';
    }
  };

  const liveCount = sessions.filter(s => s.isLive === true).length;
  const upcomingCount = sessions.filter(s => getFrontendStatus(s.status) === 'upcoming' && !s.isLive).length;
  const completedCount = sessions.filter(s => getFrontendStatus(s.status) === 'completed').length;
  const watchedCount = watchedSessions.length;

  return {
    liveCount,
    upcomingCount,
    completedCount,
    watchedCount
  };
};  