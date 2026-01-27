import React, { useRef, useEffect } from 'react';
import { FaMicrophoneSlash, FaHandPaper, FaUserTie, FaChalkboardTeacher } from 'react-icons/fa';
import { VideoGridProps } from '../../../domain/types/videoConference';

const getOptimalLayout = (participantCount: number, screenWidth: number) => {

  if (screenWidth < 768) {
    if (participantCount === 1) {
      return {
        gridClass: 'grid grid-cols-1 gap-3 p-4',
        maxVisible: 1,
        aspectRatio: 'aspect-[4/3]'
      };
    } else {
      return {
        gridClass: 'grid grid-cols-2 gap-2 p-3',
        maxVisible: 4,
        aspectRatio: 'aspect-[4/3]'
      };
    }
  }

  if (screenWidth < 1024) {
    if (participantCount === 1) {
      return {
        gridClass: 'grid grid-cols-1 gap-4 p-6 place-items-center',
        maxVisible: 1,
        aspectRatio: 'aspect-video max-w-2xl'
      };
    } else if (participantCount <= 4) {
      return {
        gridClass: 'grid grid-cols-2 gap-3 p-4',
        maxVisible: 4,
        aspectRatio: 'aspect-video'
      };
    } else {
      return {
        gridClass: 'grid grid-cols-3 gap-2 p-3',
        maxVisible: 9,
        aspectRatio: 'aspect-[4/3]'
      };
    }
  }

  if (screenWidth < 1440) {
    if (participantCount === 1) {
      return {
        gridClass: 'grid grid-cols-1 gap-6 p-8 place-items-center',
        maxVisible: 1,
        aspectRatio: 'aspect-video max-w-4xl'
      };
    } else if (participantCount <= 4) {
      return {
        gridClass: 'grid grid-cols-2 gap-4 p-6',
        maxVisible: 4,
        aspectRatio: 'aspect-video'
      };
    } else if (participantCount <= 9) {
      return {
        gridClass: 'grid grid-cols-3 gap-3 p-4',
        maxVisible: 9,
        aspectRatio: 'aspect-video'
      };
    } else {
      return {
        gridClass: 'grid grid-cols-4 gap-2 p-3',
        maxVisible: 12,
        aspectRatio: 'aspect-[4/3]'
      };
    }
  }

  if (participantCount === 1) {
    return {
      gridClass: 'grid grid-cols-1 gap-6 p-8 place-items-center',
      maxVisible: 1,
      aspectRatio: 'aspect-video max-w-4xl'
    };
  } else if (participantCount <= 4) {
    return {
      gridClass: 'grid grid-cols-2 gap-4 p-6',
      maxVisible: 4,
      aspectRatio: 'aspect-video'
    };
  } else if (participantCount <= 9) {
    return {
      gridClass: 'grid grid-cols-3 gap-3 p-4',
      maxVisible: 9,
      aspectRatio: 'aspect-video'
    };
  } else {
    return {
      gridClass: 'grid grid-cols-4 gap-3 p-4',
      maxVisible: 12,
      aspectRatio: 'aspect-video'
    };
  }
};

export const VideoGrid: React.FC<VideoGridProps> = ({
  participants,
  maxVisible = 25,
  localParticipantId,
  localStream
}) => {
  const [dimensions, setDimensions] = React.useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  useEffect(() => {
    const handleResize = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const layout = getOptimalLayout(participants.length, dimensions.width);
  const effectiveMaxVisible = Math.min(layout.maxVisible, maxVisible);
  const visibleParticipants = participants.slice(0, effectiveMaxVisible);

  useEffect(() => {
    visibleParticipants.forEach((participant, idx) => {
      const ref = videoRefs.current[idx];
      if (ref) {
        if (participant.id === localParticipantId) {
          if (ref.srcObject !== localStream) ref.srcObject = localStream || null;
        } else if (participant.mediaStream) {
          if (ref.srcObject !== participant.mediaStream) ref.srcObject = participant.mediaStream;
        }
      }
    });
  }, [visibleParticipants, localParticipantId, localStream]);

  return (
    <div className="flex-1 flex items-center justify-center min-h-0 w-full h-full overflow-hidden">
      <div className={`${layout.gridClass} w-full h-full max-h-full auto-rows-fr`}>
        {visibleParticipants.map((participant, idx) => {
          if (!participant) return null;
          return (
            <div
              key={participant.id}
              className={`
                relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg overflow-hidden 
                transition-all duration-300 hover:shadow-xl
                ${participant.isPresenting ? 'ring-2 ring-blue-400 ring-opacity-75' : ''}
                ${layout.aspectRatio}
                min-h-[100px] min-w-[140px] w-full h-full
              `}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                {participant.videoOn ? (
                  (participant.id === localParticipantId && localStream) || participant.mediaStream ? (
                    <video
                      autoPlay
                      playsInline
                      muted={participant.id === localParticipantId}
                      className="w-full h-full object-cover rounded-xl"
                      ref={el => { videoRefs.current[idx] = el; }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center relative">
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                      <div className="absolute inset-0 bg-black bg-opacity-10" />
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center h-full p-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">
                      {(participant.name ? participant.name.charAt(0).toUpperCase() : '?')}
                    </div>
                    <span className="text-white text-xs sm:text-sm mt-2 opacity-90 text-center font-medium">
                      {participant.name || 'Unknown'}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badges */}
              <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                {participant.isHost && (
                  <div className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                    <FaUserTie className="w-2 h-2" />
                    <span className="hidden sm:inline">Host</span>
                  </div>
                )}
                {participant.isPresenting && (
                  <div className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 shadow-md">
                    <FaChalkboardTeacher className="w-2 h-2" />
                    <span className="hidden sm:inline">Presenting</span>
                  </div>
                )}
              </div>

              <div className="absolute top-2 right-2 flex gap-1">
                {!participant.audioOn && (
                  <div className="bg-red-500 p-1.5 rounded-full shadow-md">
                    <FaMicrophoneSlash className="w-3 h-3 text-white" />
                  </div>
                )}
                {participant.handRaised && (
                  <div className="bg-yellow-500 p-1.5 rounded-full animate-bounce shadow-md">
                    <FaHandPaper className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {participant.reaction && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl sm:text-4xl animate-bounce z-10">
                  {participant.reaction}
                </div>
              )}

              {participant.videoOn && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium text-xs sm:text-sm truncate">
                      {participant.name}
                    </span>
                    <div className="flex items-center gap-1">
                      {participant.audioOn ? (
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      ) : (
                        <FaMicrophoneSlash className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="absolute bottom-2 right-2">
                <div className="flex gap-0.5">
                  <div className="w-1 h-2 bg-green-400 rounded-sm"></div>
                  <div className="w-1 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-1 h-4 bg-green-400 rounded-sm opacity-60"></div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};