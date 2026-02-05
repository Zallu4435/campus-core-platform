import React from 'react';
import { IoCloseOutline as X, IoPeopleOutline as Users, IoPersonOutline as User, IoTrophyOutline as Trophy, IoCalendarOutline as Calendar, IoInformationCircleOutline as Info, IoBusinessOutline as Building } from 'react-icons/io5';
import { TeamDetailsModalProps } from '../../../../../domain/types/management/sportmanagement';
import { usePreventBodyScroll } from '../../../../../shared/hooks/usePreventBodyScroll';
import { getOrganizerIcon, ghostParticles, InfoCard, StatusBadge } from '../../../../../shared/constants/sportManagementConstants';

const TeamDetailsModal: React.FC<TeamDetailsModalProps> = ({ isOpen, onClose, team }) => {

  usePreventBodyScroll(isOpen);

  if (!isOpen || !team) return null;

  const OrganizerIcon = getOrganizerIcon(team.organizerType);

  return (
    <div className="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {ghostParticles.map((particle, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-purple-500/20 blur-sm"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            top: `${particle.top}%`,
            left: `${particle.left}%`,
            animation: `floatParticle ${particle.animDuration}s infinite ease-in-out`,
            animationDelay: `${particle.animDelay}s`,
          }}
        />
      ))}

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-purple-600/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border border-purple-600/30"
                style={{ backgroundColor: `${team.color}20`, borderColor: team.color }}
              >
                {team.icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">{team.name}</h2>
                <p className="text-sm text-purple-300">Team ID: {team._id}</p>
                <div className="flex items-center mt-2">
                  <StatusBadge status={team.status} />
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-purple-500/20 rounded-full transition-colors"
            >
              <X size={24} className="text-purple-300" />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-200px)] p-6 space-y-6 custom-scrollbar">
          <div className="flex flex-wrap items-center justify-between mb-8 gap-4">
            <StatusBadge status={team.status} />
            <div className="flex items-center space-x-6 text-sm text-purple-300">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-purple-400" />
                <span>{team.participants} players</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-purple-400" />
                <span>{new Date(team.createdAt || '').toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <InfoCard icon={Trophy} label="Sport Type" value={team.type} />
            <InfoCard icon={User} label="Coach" value={team.headCoach} />
            <InfoCard icon={Users} label="Player Count" value={team.participants || 0} />
            <InfoCard icon={Calendar} label="Formed On" value={new Date(team.formedOn || '').toLocaleDateString()} />
            <InfoCard icon={Trophy} label="Division" value={team.division} />
            <InfoCard icon={OrganizerIcon} label="Organizer" value={team.organizer} />
            <InfoCard icon={Building} label="Category" value={team.category} />
            <InfoCard icon={Trophy} label="Record" value={team.record} />
            <InfoCard icon={Users} label="Home Games" value={team.homeGames} />
          </div>

          {team.description && (
            <div className="mb-8">
              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-900/60 flex items-center">
                  <Info size={20} className="text-purple-300" />
                  <h3 className="ml-3 text-lg font-semibold text-purple-100">Team Description</h3>
                </div>
                <div className="p-6">
                  <p className="text-purple-200 leading-relaxed">{team.description}</p>
                </div>
              </div>
            </div>
          )}

          {team?.upcomingGames?.length > 0 && (
            <div className="mb-8">
              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-900/60 flex items-center">
                  <Calendar size={20} className="text-purple-300" />
                  <h3 className="ml-3 text-lg font-semibold text-purple-100">Upcoming Games</h3>
                </div>
                <div className="p-6">
                  <ul className="space-y-4">
                    {team.upcomingGames.map((game, index) => (
                      <li key={index} className="flex items-center space-x-4 text-purple-200">
                        <span className="text-sm font-medium text-purple-300">{new Date(game.date).toLocaleString()}</span>
                        <span className="text-sm">{game.description}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-purple-600/30 bg-gray-900/80 p-6">
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={onClose}
                className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors border border-gray-500/50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .no-scroll {
          overflow: hidden;
        }

        @keyframes floatParticle {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          25% {
            opacity: 0.8;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.3;
          }
          75% {
            opacity: 0.7;
          }
          100% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(128, 90, 213, 0.1);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.3);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.5);
        }
      `}</style>
    </div>
  );
};

export default TeamDetailsModal;