import React from 'react';
import { FaVideo, FaUsers } from 'react-icons/fa';
import { TopBarProps } from '../../../domain/types/videoConference';

export const TopBar: React.FC<TopBarProps> = ({ sessionName, meetingTimer, participantCount }) => (
  <div className="fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-b border-white/20 px-2 sm:px-6 py-3 sm:py-4 z-20">
    <div className="flex items-center justify-between max-w-6xl mx-auto flex-nowrap gap-2 sm:gap-4">
      <div className="flex items-center flex-nowrap gap-2 sm:gap-4 min-w-0">
        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <FaVideo className="w-4 h-4 text-white" />
        </div>
        <span className="text-white font-semibold text-base sm:text-lg truncate max-w-[90vw] sm:max-w-xs">{sessionName}</span>
        <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium flex-shrink-0">
          Live
        </div>
      </div>
      <div className="flex items-center flex-nowrap gap-2 sm:gap-4">
        <div className="flex items-center gap-1 text-white/60 flex-shrink-0">
          <FaUsers className="w-4 h-4" />
          <span className="text-xs sm:text-sm font-medium">{participantCount}</span>
        </div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse flex-shrink-0" />
        <div className="bg-gray-800/80 text-white text-xs px-2 py-1 rounded font-mono ml-1 sm:ml-2 flex-shrink-0">
          {meetingTimer}
        </div>
      </div>
    </div>
  </div>
); 