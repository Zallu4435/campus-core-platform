import React from 'react';
import {
  IoCloseOutline as X,
  IoCalendarOutline as Calendar,
  IoPeopleOutline as Users,
  IoPersonOutline as User,
  IoTrophyOutline as Trophy,
  IoHeartOutline as Heart,
  IoDocumentTextOutline as DocumentText,
  IoMailOutline as Mail,
  IoIdCardOutline as IdCard,
} from 'react-icons/io5';
import {
  TeamRequestDetailsModalProps,
  SportStatus,
} from '../../../../../domain/types/management/sportmanagement';
import { usePreventBodyScroll } from '../../../../../shared/hooks/usePreventBodyScroll';
import { formatDate, formatDateTime } from '../../../../../shared/utils/dateUtils';
import { RequestStatusBadge, RequestInfoCard } from '../../../../../shared/constants/sportManagementConstants';

const TeamRequestDetailsModal: React.FC<TeamRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  usePreventBodyScroll(isOpen);

  if (!isOpen || !request || !request.sportRequest) return null;

  const { sport, user } = request.sportRequest;

  const ghostParticles = Array(30)
    .fill(0)
    .map((_) => ({
      size: Math.random() * 10 + 5,
      top: Math.random() * 100,
      left: Math.random() * 100,
      animDuration: Math.random() * 10 + 15,
      animDelay: Math.random() * 5,
    }));

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
                style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}
              >
                <Trophy size={24} className="text-purple-300" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">{sport?.title || 'Unknown Sport'}</h2>
                <p className="text-sm text-purple-300">Request ID: {request.sportRequest.id}</p>
                <div className="flex items-center mt-2">
                  <RequestStatusBadge status={request.sportRequest.status as SportStatus} />
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
            <RequestStatusBadge status={request.sportRequest.status as SportStatus} />
            <div className="flex items-center space-x-6 text-sm text-purple-300">
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-purple-400" />
                <span>{formatDate(request.sportRequest.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-purple-400" />
                <span>{sport.playerCount} Players</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <RequestInfoCard icon={User} label="Requested By" value={user.name} />
            <RequestInfoCard icon={Mail} label="Contact Email" value={user.email} />
            <RequestInfoCard icon={Trophy} label="Sport Type" value={sport.type} />
            <RequestInfoCard icon={User} label="Coach" value={sport.headCoach} />
            <RequestInfoCard icon={IdCard} label="Team ID" value={sport.id} />
            <RequestInfoCard icon={Calendar} label="Last Updated" value={formatDateTime(request.sportRequest.updatedAt)} />
            <RequestInfoCard icon={Users} label="Player Count" value={sport.playerCount} />
            <RequestInfoCard icon={Trophy} label="Division" value={sport.division} />
          </div>

          <div className="mb-8">
            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-900/60 flex items-center">
                <Heart size={20} className="text-purple-300" />
                <h3 className="ml-3 text-lg font-semibold text-purple-100">Why Join</h3>
              </div>
              <div className="p-6">
                <p className="text-purple-200 leading-relaxed">{request.sportRequest.whyJoin}</p>
              </div>
            </div>
          </div>

          {request.sportRequest.additionalInfo && (
            <div className="mb-8">
              <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-900/60 flex items-center">
                  <DocumentText size={20} className="text-purple-300" />
                  <h3 className="ml-3 text-lg font-semibold text-purple-100">Additional Information</h3>
                </div>
                <div className="p-6">
                  <p className="text-purple-200 leading-relaxed">{request.sportRequest.additionalInfo}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-900/60 flex items-center">
                <User size={20} className="text-purple-300" />
                <h3 className="ml-3 text-lg font-semibold text-purple-100">Requester Information</h3>
              </div>
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/60 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center mb-2">
                    <User size={18} className="text-purple-300" />
                    <span className="ml-2 text-sm font-medium text-purple-300">Full Name</span>
                  </div>
                  <p className="text-white font-semibold">{user.name}</p>
                </div>
                <div className="bg-gray-900/60 rounded-lg p-4 border border-purple-600/30">
                  <div className="flex items-center mb-2">
                    <Mail size={18} className="text-purple-300" />
                    <span className="ml-2 text-sm font-medium text-purple-300">Email Address</span>
                  </div>
                  <p className="text-white font-semibold break-all">{user.email}</p>
                </div>
              </div>
            </div>
          </div>

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

export default TeamRequestDetailsModal;