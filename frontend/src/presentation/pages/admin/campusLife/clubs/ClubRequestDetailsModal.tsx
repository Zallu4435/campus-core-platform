import React from 'react';
import {
  IoCloseOutline as X,
  IoPeopleOutline as Users,
  IoPersonOutline as User,
  IoInformationCircleOutline as Info,
  IoMailOutline as Mail,
  IoHeartOutline as Heart,
  IoDocumentTextOutline as DocumentText,
  IoSparklesOutline as Sparkles,
  IoTimeOutline as Clock,
} from 'react-icons/io5';
import {
  ClubRequestDetailsModalProps,
  StatusType,
} from '../../../../../domain/types/management/clubmanagement';
import { usePreventBodyScroll } from '../../../../../shared/hooks/usePreventBodyScroll';
import { formatDateTime } from '../../../../../shared/utils/dateUtils';
import { RequestStatusBadge, RequestInfoCard, ghostParticles, } from '../../../../../shared/constants/clubManagementConstants';


const ClubRequestDetailsModal: React.FC<ClubRequestDetailsModalProps> = ({
  isOpen,
  onClose,
  request,
}) => {
  usePreventBodyScroll(isOpen);

  console.log(request, "request")

  if (!isOpen || !request) return null;

  const clubRequest = 'clubRequest' in request ? request.clubRequest : request;
  const club = 'club' in clubRequest ? clubRequest.club : clubRequest;
  const user = 'user' in clubRequest ? clubRequest.user : { name: clubRequest.requestedBy, email: clubRequest.requestedBy };

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

      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 w-full max-w-4xl max-h-[90vh] rounded-2xl border border-purple-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 via-transparent to-purple-600/5 pointer-events-none" />

        <div className="absolute top-0 left-0 w-20 h-20 bg-purple-500/10 rounded-br-full" />
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-purple-500/10 rounded-tl-full" />

        <div className="bg-gradient-to-r from-purple-900 to-gray-900 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-lg border border-purple-500/30"
                style={{ backgroundColor: '#8B5CF620', borderColor: '#8B5CF6' }}
              >
                <Sparkles size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-purple-100">{club.name}</h2>
                <div className="flex items-center mt-2">
                  <RequestStatusBadge status={clubRequest.status as StatusType} />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <RequestInfoCard
              icon={User}
              label="Requested By"
              value={user?.name || 'Unknown'}
              highlight={true}
            />
            <RequestInfoCard icon={Mail} label="Contact Email" value={user?.email || 'N/A'} />
            <RequestInfoCard icon={Info} label="Club Type" value={club.type} />
            <RequestInfoCard
              icon={Users}
              label="Members"
              value={`${('enteredMembers' in club ? club.enteredMembers : 0)} Members`}
            />
            <RequestInfoCard
              icon={Clock}
              label="Last Updated"
              value={formatDateTime('updatedAt' in clubRequest ? clubRequest.updatedAt : clubRequest.createdAt)}
            />
          </div>

          <div className="mb-8">
            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-900/60 flex items-center">
                <Info size={20} className="text-purple-300" />
                <h3 className="ml-3 text-lg font-semibold text-purple-100">Club Description</h3>
              </div>
              <div className="p-6">
                <p className="text-purple-200 leading-relaxed">
                  {('clubDescription' in clubRequest ? clubRequest.clubDescription : '') ||
                    ('about' in club ? club.about : '') ||
                    ('description' in club ? club.description : '') ||
                    'No description available'}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gray-900/60 flex items-center">
                <Heart size={20} className="text-purple-300" />
                <h3 className="ml-3 text-lg font-semibold text-purple-100">Why Join</h3>
              </div>
              <div className="p-6">
                <p className="text-purple-200 leading-relaxed">{clubRequest.whyJoin}</p>
              </div>
            </div>
          </div>

          {clubRequest.additionalInfo && (
            <div className="mb-8">
              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-900/60 flex items-center">
                  <DocumentText size={20} className="text-purple-300" />
                  <h3 className="ml-3 text-lg font-semibold text-purple-100">Additional Information</h3>
                </div>
                <div className="p-6">
                  <p className="text-purple-200 leading-relaxed">{clubRequest.additionalInfo}</p>
                </div>
              </div>
            </div>
          )}

          {user && (
            <div className="mb-8">
              <div className="bg-gray-800/80 border border-purple-500/30 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-900/60 flex items-center">
                  <User size={20} className="text-purple-300" />
                  <h3 className="ml-3 text-lg font-semibold text-purple-100">Requester Information</h3>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <RequestInfoCard
                    icon={User}
                    label="Full Name"
                    value={user.name || 'N/A'}
                  />
                  <RequestInfoCard
                    icon={Mail}
                    label="Email Address"
                    value={user.email}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="border-t border-purple-500/30 bg-gray-900/80 p-6">
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
      `}</style>
    </div>
  );
};

export default ClubRequestDetailsModal;