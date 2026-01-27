import React from 'react';
import { FaRecordVinyl, FaClock, FaCheckCircle, FaEye } from 'react-icons/fa';
import { SessionStatsProps } from '../../../../../domain/types/canvas/session';

export const SessionStats: React.FC<SessionStatsProps> = ({ stats, styles }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10">
      <div className={`group relative overflow-hidden ${styles.card.background} backdrop-blur-xl rounded-[2rem] border ${styles.border} p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-rose-500/10 active:scale-95`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 blur-[3rem] -mr-8 -mt-8 rounded-full"></div>
        <div className="flex items-center gap-4 relative">
          <div className={`w-12 h-12 bg-rose-500/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 shadow-inner group-hover:bg-rose-500 group-hover:text-white transition-all duration-300`}>
            <FaRecordVinyl className="w-6 h-6 animate-[spin_3s_linear_infinite]" />
          </div>
          <div>
            <div className={`text-2xl font-black ${styles.textPrimary} tracking-tight`}>
              {stats.liveCount}
            </div>
            <div className={`${styles.textSecondary} text-[10px] font-bold uppercase tracking-widest opacity-60`}>Live Now</div>
          </div>
        </div>
      </div>

      <div className={`group relative overflow-hidden ${styles.card.background} backdrop-blur-xl rounded-[2rem] border ${styles.border} p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-amber-500/10 active:scale-95`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 blur-[3rem] -mr-8 -mt-8 rounded-full"></div>
        <div className="flex items-center gap-4 relative">
          <div className={`w-12 h-12 bg-amber-500/20 border border-amber-500/30 rounded-2xl flex items-center justify-center text-amber-500 shadow-inner group-hover:bg-amber-500 group-hover:text-white transition-all duration-300`}>
            <FaClock className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${styles.textPrimary} tracking-tight`}>
              {stats.upcomingCount}
            </div>
            <div className={`${styles.textSecondary} text-[10px] font-bold uppercase tracking-widest opacity-60`}>Upcoming</div>
          </div>
        </div>
      </div>

      <div className={`group relative overflow-hidden ${styles.card.background} backdrop-blur-xl rounded-[2rem] border ${styles.border} p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-blue-500/10 active:scale-95`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 blur-[3rem] -mr-8 -mt-8 rounded-full"></div>
        <div className="flex items-center gap-4 relative">
          <div className={`w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center text-blue-500 shadow-inner group-hover:bg-blue-500 group-hover:text-white transition-all duration-300`}>
            <FaCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${styles.textPrimary} tracking-tight`}>
              {stats.completedCount}
            </div>
            <div className={`${styles.textSecondary} text-[10px] font-bold uppercase tracking-widest opacity-60`}>Completed</div>
          </div>
        </div>
      </div>

      <div className={`group relative overflow-hidden ${styles.card.background} backdrop-blur-xl rounded-[2rem] border ${styles.border} p-5 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 active:scale-95`}>
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-[3rem] -mr-8 -mt-8 rounded-full"></div>
        <div className="flex items-center gap-4 relative">
          <div className={`w-12 h-12 bg-emerald-500/20 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-500 shadow-inner group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300`}>
            <FaEye className="w-6 h-6" />
          </div>
          <div>
            <div className={`text-2xl font-black ${styles.textPrimary} tracking-tight`}>
              {stats.watchedCount}
            </div>
            <div className={`${styles.textSecondary} text-[10px] font-bold uppercase tracking-widest opacity-60`}>Watched</div>
          </div>
        </div>
      </div>
    </div>
  );
};