import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ControlBar } from './ControlBar';
import { ChatPanel } from './ChatPanel';
import { TopBar } from './TopBar';
import { useLocation } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { RootState } from '../../../appStore/store';
import { useSessionManagement } from '../../../application/hooks/useSessionManagement';
import { Message, Participant, Reaction } from '../../../domain/types/videoConference';
import { VideoGrid } from './VideoGrid';
import { Faculty, Session } from '../../../domain/types/canvas/session';


export const VideoConferencePage: React.FC = () => {
  const location = useLocation();
  const { session, faculty, isHost } = (location.state || {}) as {
    session?: Session;
    faculty?: Faculty;
    isHost?: boolean;
  };

  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [handRaised, setHandRaised] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [mediaReady, setMediaReady] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [meetingSeconds, setMeetingSeconds] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [othersOpen, setOthersOpen] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const peerConnections = useRef<{ [userId: string]: RTCPeerConnection }>({});
  const localStreamRef = useRef<MediaStream | null>(null);
  const myIdRef = useRef(faculty?.id || faculty?._id);

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  const upsertParticipant = (user: Partial<Participant> & { id: string }) => {
    setParticipants((prev) => {
      const idx = prev.findIndex((p) => p.id === user.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...user };
        return updated;
      } else {
        return [...prev, user as Participant];
      }
    });
  };

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        localStreamRef.current = stream;
        setLocalStream(stream);
        setMediaReady(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        setMediaReady(false);
      }
    };

    initializeMedia();
  }, []);

  useEffect(() => {
    if (!userId || !mediaReady || isConnected) {
      return;
    }

    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    const SOCKET_URL = apiBaseUrl.replace('/api', '');
    const socket = io(SOCKET_URL, {
      transports: ['websocket'],
      auth: { userId }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);

      const myId = faculty?.id || faculty?._id || '';
      myIdRef.current = myId;
      const myName = faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : '');

      socket.emit('join-room', session?.id || session?._id, {
        userId: myId,
        username: myName,
        isHost: isHost
      });

      upsertParticipant({
        id: myId,
        name: myName,
        videoOn: cameraOn,
        audioOn: micOn,
        handRaised: false,
        isHost: isHost,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
      setJoinError(error.message || 'Failed to join session');
    });

    socket.on('participant-list', (list: Array<{
      userId: string;
      name: string;
      isHost: boolean;
      cameraOn: boolean;
      micOn: boolean;
      handRaised: boolean;
      isPresenting?: boolean;
    }>) => {
      setParticipants(list.map((p) => ({
        id: p.userId,
        name: p.name,
        isHost: p.isHost,
        videoOn: p.cameraOn,
        audioOn: p.micOn,
        handRaised: p.handRaised,
        isPresenting: p.isPresenting || false
      })));
    });

    socket.on('user-joined', (user) => {
      setParticipants(prev => {
        if (prev.some(p => p.id === user.id)) return prev;
        return [...prev, {
          id: user.id,
          name: user.name,
          isHost: user.isHost,
          videoOn: user.cameraOn,
          audioOn: user.micOn,
          handRaised: user.handRaised,
          isPresenting: false
        }];
      });

      if (user.id !== myIdRef.current) {
        createPeerConnectionAndOffer(user.id);
      }
    });

    socket.on('user-left', ({ userId }) => {
      setParticipants(prev => prev.filter(p => p.id !== userId));
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
    });

    socket.on('media-state-changed', (data) => {
      upsertParticipant({
        id: data.userId,
        audioOn: data.micOn,
        videoOn: data.cameraOn,
      });
    });

    socket.on('hand-raise-changed', (data) => {
      upsertParticipant({
        id: data.userId,
        handRaised: data.handRaised,
      });
    });

    socket.on('reaction-received', (data) => {
      const newReaction: Reaction = {
        id: data.id,
        emoji: data.emoji,
        sender: data.userName,
        timestamp: data.timestamp
      };
      setReactions(prev => [...prev, newReaction]);
    });

    socket.on('message-received', (data) => {
      const newMessage: Message = {
        id: data.id,
        user: data.userName,
        text: data.text ?? data.message,
        timestamp: new Date(data.timestamp).toLocaleTimeString().slice(0, 5)
      };
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on('screen-share-started', (data) => {
      upsertParticipant({
        id: data.userId,
        isPresenting: true,
      });
    });

    socket.on('screen-share-stopped', (data) => {
      upsertParticipant({
        id: data.userId,
        isPresenting: false,
      });
    });

    socket.on('video-offer', async (data) => {
      if (data.to !== myIdRef.current) return;

      const pc = createPeerConnection(data.from);
      await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('video-answer', {
        sessionId: session?.id || session?._id,
        from: myIdRef.current,
        to: data.from,
        answer,
      });
    });

    socket.on('video-answer', async (data) => {
      if (data.to !== myIdRef.current) return;

      const pc = peerConnections.current[data.from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
      }
    });

    socket.on('ice-candidate', async (data) => {
      if (data.to !== myIdRef.current) return;

      const pc = peerConnections.current[data.from];
      if (pc && data.candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        } catch (err) {
          console.error('[WebRTC] Error adding ICE candidate:', err);
        }
      }
    });

    socket.on('error', (error) => {
      console.error('[Socket] Error:', error);
    });

    return () => {
      socket.disconnect();
      Object.values(peerConnections.current).forEach(pc => pc.close());
      peerConnections.current = {};
      setIsConnected(false);
    };
  }, [userId, mediaReady, session, faculty, isHost]);

  const createPeerConnection = (remoteUserId: string): RTCPeerConnection => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnections.current[remoteUserId] = pc;

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          sessionId: session?.id || session?._id,
          from: myIdRef.current,
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      upsertParticipant({
        id: remoteUserId,
        mediaStream: event.streams[0],
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WebRTC] Connection state with ${remoteUserId}:`, pc.connectionState);
    };

    return pc;
  };

  const createPeerConnectionAndOffer = async (remoteUserId: string) => {
    const pc = createPeerConnection(remoteUserId);

    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socketRef.current?.emit('video-offer', {
        sessionId: session?.id || session?._id,
        from: myIdRef.current,
        to: remoteUserId,
        offer,
      });
    } catch (err) {
      console.error('[WebRTC] Error creating offer:', err);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => setMeetingSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setReactions(prev => prev.filter(reaction => now - reaction.timestamp < 3000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const meetingTimer = useMemo(() => {
    const m = Math.floor(meetingSeconds / 60).toString().padStart(2, '0');
    const s = (meetingSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, [meetingSeconds]);

  const handleToggleMic = () => {
    setMicOn((prev) => {
      const newState = !prev;
      if (localStream) {
        localStream.getAudioTracks().forEach((track) => {
          track.enabled = newState;
        });
      }

      if (socketRef.current) {
        socketRef.current.emit('media-state-changed', {
          sessionId: session?.id || session?._id,
          userId: myIdRef.current,
          micOn: newState,
          cameraOn,
        });
      }
      return newState;
    });
  };

  const handleToggleCamera = () => {
    setCameraOn((prev) => {
      const newState = !prev;
      if (localStream) {
        localStream.getVideoTracks().forEach((track) => {
          track.enabled = newState;
        });
      }

      if (socketRef.current) {
        socketRef.current.emit('media-state-changed', {
          sessionId: session?.id || session?._id,
          userId: myIdRef.current,
          micOn,
          cameraOn: newState,
        });
      }
      return newState;
    });
  };

  const handleToggleHand = () => {
    setHandRaised((prev) => {
      const newState = !prev;
      if (socketRef.current) {
        socketRef.current.emit('hand-raise-changed', {
          sessionId: session?.id || session?._id,
          userId: myIdRef.current,
          userName: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
          handRaised: newState,
        });
      }
      return newState;
    });
  };

  const handleSendReaction = (emoji: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send-reaction', {
        sessionId: session?.id || session?._id,
        userId: myIdRef.current,
        userName: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
        emoji,
      });
    }
  };

  const handleLeave = async () => {
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    Object.values(peerConnections.current).forEach(pc => pc.close());
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    if (session?._id || session?.id) {
      const sessionId = session._id || session.id || '';
      try {
        await attendanceLeave(sessionId);
      } catch (err) {
        console.error('Error calling attendanceLeave:', err);
      }
    }
    window.location.href = '/';
  };

  const handleShareScreen = async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      if (socketRef.current) {
        socketRef.current.emit('screen-share-started', {
          sessionId: session?.id || session?._id,
          userId: myIdRef.current,
          userName: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
        });
      }

      Object.values(peerConnections.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });

      screenStream.getVideoTracks()[0].onended = () => {
        if (socketRef.current) {
          socketRef.current.emit('screen-share-stopped', {
            sessionId: session?.id || session?._id,
            userId: myIdRef.current,
            userName: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
          });
        }

        if (localStream) {
          Object.values(peerConnections.current).forEach(pc => {
            const sender = pc.getSenders().find(s => s.track?.kind === 'video');
            if (sender) {
              sender.replaceTrack(localStream.getVideoTracks()[0]);
            }
          });
        }
      };

    } catch (err) {
      console.error('Error sharing screen:', err);
    }
  };

  const handleSendMessage = (message: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        sessionId: session?.id || session?._id,
        userId: myIdRef.current,
        userName: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
        message,
      });
    }
  };

  useEffect(() => {
    const myId = faculty?.id || faculty?._id || '';
    upsertParticipant({
      id: myId,
      name: faculty?.firstName + (faculty?.lastName ? ' ' + faculty.lastName : ''),
      videoOn: cameraOn,
      audioOn: micOn,
      handRaised: handRaised,
      isHost: isHost,
    });
  }, [micOn, cameraOn, handRaised, faculty, isHost]);

  const { attendanceJoin, attendanceLeave } = useSessionManagement();

  useEffect(() => {
    if (!session?._id && !session?.id) return;

    const sessionId = session._id || session.id || '';

    attendanceJoin(sessionId).then(result => {
      if (result.success) {
        console.log('[VideoConference] Successfully joined attendance for session:', sessionId);
      } else {
        console.error('[VideoConference] Failed to join attendance:', result.error);
      }
    }).catch(error => {
      console.error('[VideoConference] Error calling attendanceJoin:', error);
    });

    return () => {
      attendanceLeave(sessionId).then(result => {
        if (result.success) {
          console.log('[VideoConference] Successfully left attendance for session:', sessionId);
        } else {
          console.error('[VideoConference] Failed to leave attendance:', result.error);
        }
      }).catch(error => {
        console.error('[VideoConference] Error calling attendanceLeave:', error);
      });
    };
  }, [session?._id, session?.id]);

  return (
    <div className="w-screen h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Error Modal */}
      {joinError && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Cannot Join Session</h2>
            </div>
            <p className="text-gray-600 mb-6">{joinError}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
      
      <TopBar sessionName={session?.name || "Video Conference"} meetingTimer={meetingTimer} />

      {!mediaReady && (
        <div className="absolute top-20 left-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm z-50">
          Setting up media...
        </div>
      )}
      {mediaReady && !isConnected && (
        <div className="absolute top-20 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm z-50">
          Connecting...
        </div>
      )}
      {isConnected && (
        <div className="absolute top-20 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm z-50">
          Connected
        </div>
      )}

      <div className="fixed inset-0 pointer-events-none z-40 flex flex-col gap-2 items-start px-8 pb-32 justify-end">
        {reactions.map((reaction, index) => (
          <div
            key={reaction.id}
            className="animate-reaction-flow"
            style={{
              animationDelay: `${index * 0.1}s`,
              animationDuration: '3s',
            }}
          >
            <div className="flex items-center space-x-2">
              <div className="text-4xl animate-bounce">{reaction.emoji}</div>
              <div className="text-white text-sm font-medium bg-black/50 px-2 py-1 rounded-full backdrop-blur-sm">
                {reaction.sender}
              </div>
            </div>
          </div>
        ))}
      </div>



      <div className="flex-1 flex flex-col min-h-0 relative pt-20 pb-24">
        <VideoGrid
          participants={participants}
          localParticipantId={myIdRef.current}
          localStream={localStream}
        />

        {participants.length > 1 && (
          <button
            onClick={() => setOthersOpen(true)}
            className="absolute bottom-28 right-4 px-4 py-2 bg-gray-800/90 backdrop-blur-sm text-white rounded-full shadow-lg z-30 hover:bg-gray-700 transition-all duration-200 border border-gray-600/50 font-medium"
          >
            +{participants.length - 1} others
          </button>
        )}

        {othersOpen && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Participants ({participants.length})
                </h2>
                <button
                  onClick={() => setOthersOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="overflow-y-auto max-h-96 p-4">
                <ul className="space-y-3">
                  {participants.map((participant) => (
                    <li key={participant.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                        {participant.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 truncate">
                          {participant.name} {participant.id === myIdRef.current && '(You)'}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {participant.isHost && (
                            <span className="text-xs text-orange-600 font-medium bg-orange-100 px-2 py-0.5 rounded-full">
                              Host
                            </span>
                          )}
                          {participant.isPresenting && (
                            <span className="text-xs text-blue-600 font-medium bg-blue-100 px-2 py-0.5 rounded-full">
                              Presenting
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {!participant.audioOn && <span className="text-red-500 text-xs">🔇 Muted</span>}
                          {participant.handRaised && <span className="text-yellow-500 text-xs">✋ Hand raised</span>}
                          {participant.audioOn && !participant.handRaised && (
                            <span className="text-green-500 text-xs">🎤 Active</span>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChatPanel
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        messages={messages}
        onSend={handleSendMessage}
      />

      <ControlBar
        onToggleMic={handleToggleMic}
        onToggleCamera={handleToggleCamera}
        onToggleHand={handleToggleHand}
        onSendReaction={handleSendReaction}
        onLeave={handleLeave}
        onShareScreen={handleShareScreen}
        onToggleChat={() => setChatOpen(!chatOpen)}
        onToggleOthers={() => setOthersOpen(true)}
        micOn={micOn}
        cameraOn={cameraOn}
        handRaised={handRaised}
      />

      <style>{`
        @keyframes reaction-flow {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          50% {
            transform: translateY(-50px) scale(1.2);
            opacity: 0.8;
          }
          100% {
            transform: translateY(-100px) scale(0.8);
            opacity: 0;
          }
        }
        
        .animate-reaction-flow {
          animation: reaction-flow 3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};