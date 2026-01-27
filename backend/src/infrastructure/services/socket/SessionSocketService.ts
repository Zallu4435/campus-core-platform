import { Server } from 'socket.io';
import { VideoSessionModel } from '../../database/mongoose/session/session.model';

interface SessionParticipant {
  userId: string;
  name: string;
  isHost: boolean;
  socketId: string;
  micOn: boolean;
  cameraOn: boolean;
  handRaised: boolean;
}

const sessionParticipants: Record<string, SessionParticipant[]> = {};

declare module 'socket.io' {
  interface Socket {
    userId?: string;
  }
}

interface SessionUser {
  userId: string;
  username: string;
  isHost?: boolean;
}

interface MediaStateData {
  sessionId: string;
  userId: string;
  micOn: boolean;
  cameraOn: boolean;
}

interface HandRaiseData {
  sessionId: string;
  userId: string;
  userName: string;
  handRaised: boolean;
}

interface ReactionData {
  sessionId: string;
  userId: string;
  userName: string;
  emoji: string;
}

interface MessageData {
  sessionId: string;
  userId: string;
  userName: string;
  message: string;
}

export const setupSessionSocketHandlers = (io: Server) => {

  io.on('connection', (socket) => {
    let currentUserId: string | null = null;
    let currentSessionId: string | null = null;

    socket.on('join-room', async (sessionId: string, user: SessionUser) => {
      try {
        // Check session status before allowing join
        const session = await VideoSessionModel.findById(sessionId);
        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        // Check if session is ended or cancelled
        if (session.status === 'Ended' || session.status === 'Cancelled') {
          socket.emit('error', { message: 'Cannot join session: Session has ended or been cancelled' });
          return;
        }

        // Only allow joining if session is live (ongoing)
        if (session.status !== 'Ongoing') {
          socket.emit('error', { message: 'Cannot join session: Session is not live' });
          return;
        }

        currentUserId = user.userId;
        currentSessionId = sessionId;
        socket.userId = currentUserId;

        socket.join(sessionId);

        if (!sessionParticipants[sessionId]) {
          sessionParticipants[sessionId] = [];
        }

        const existingParticipantIndex = sessionParticipants[sessionId].findIndex(p => p.userId === user.userId);
        if (existingParticipantIndex === -1) {
          sessionParticipants[sessionId].push({
            userId: user.userId,
            name: user.username,
            isHost: !!user.isHost,
            socketId: socket.id,
            micOn: true,
            cameraOn: true,
            handRaised: false
          });
        } else {
          sessionParticipants[sessionId][existingParticipantIndex].socketId = socket.id;
        }

        socket.emit('participant-list', sessionParticipants[sessionId]);

        socket.to(sessionId).emit('user-joined', {
          id: user.userId,
          name: user.username,
          isHost: !!user.isHost,
          micOn: true,
          cameraOn: true,
          handRaised: false
        });

        await updateSessionInDatabase(sessionId, user.userId);

      } catch (error) {
        console.error('[SessionSocketService] Error in join-room:', error);
        socket.emit('error', { message: 'Error joining room' });
      }
    });

    socket.on('video-offer', (data) => {
      relayToTargetUser(io, data, 'video-offer');
    });

    socket.on('video-answer', (data) => {
      relayToTargetUser(io, data, 'video-answer');
    });

    socket.on('ice-candidate', (data) => {
      relayToTargetUser(io, data, 'ice-candidate');
    });

    socket.on('media-state-changed', (data: MediaStateData) => {
      updateParticipantMediaState(data);
      socket.to(data.sessionId).emit('media-state-changed', data);
    });

    socket.on('hand-raise-changed', (data: HandRaiseData) => {
      updateParticipantHandRaise(data);
      socket.to(data.sessionId).emit('hand-raise-changed', data);
    });

    socket.on('send-reaction', (data: ReactionData) => {
      io.to(data.sessionId).emit('reaction-received', {
        id: Date.now().toString() + Math.random(),
        emoji: data.emoji,
        userId: data.userId,
        userName: data.userName,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('send-message', (data: MessageData) => {
      io.to(data.sessionId).emit('message-received', {
        id: Date.now().toString() + Math.random(),
        userId: data.userId,
        userName: data.userName,
        message: data.message,
        timestamp: new Date().toISOString()
      });
    });

    socket.on('screen-share-started', (data) => {
      socket.to(data.sessionId).emit('screen-share-started', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('screen-share-stopped', (data) => {
      socket.to(data.sessionId).emit('screen-share-stopped', {
        userId: data.userId,
        userName: data.userName
      });
    });

    socket.on('leave-room', (data) => {
      const { sessionId, userId } = data;
      removeParticipantFromSession(sessionId, userId);
      socket.to(sessionId).emit('user-left', { userId });

      // If the leaving user was the main socket user, we might want to clean up references,
      // but if it's a ghost user (screen share), we just remove them from the list.
    });

    socket.on('disconnect', (reason: string) => {
      if (currentUserId && currentSessionId) {
        removeParticipantFromSession(currentSessionId, currentUserId);
        socket.to(currentSessionId).emit('user-left', {
          userId: currentUserId
        });
      }
    });
  });
};

async function updateSessionInDatabase(sessionId: string, userId: string) {
  try {
    const session = await VideoSessionModel.findById(sessionId);
    if (!session) {
      throw new Error(`Session not found: ${sessionId}`);
    }

    if (!session.participants.includes(userId)) {
      session.participants.push(userId);
      await session.save();
    }
  } catch (error) {
    console.error('[SessionSocketService] Database update error:', error);
  }
}

function relayToTargetUser(io: Server, data, eventType: string) {
  if (data.to) {
    const targetSocketId = getSocketIdForUser(data.sessionId, data.to);
    if (targetSocketId) {
      io.to(targetSocketId).emit(eventType, data);
    }
  } else {
    io.to(data.sessionId).emit(eventType, data);
  }
}

function updateParticipantMediaState(data: MediaStateData) {
  if (sessionParticipants[data.sessionId]) {
    const participant = sessionParticipants[data.sessionId].find(p => p.userId === data.userId);
    if (participant) {
      participant.micOn = data.micOn;
      participant.cameraOn = data.cameraOn;
    }
  }
}

function updateParticipantHandRaise(data: HandRaiseData) {
  if (sessionParticipants[data.sessionId]) {
    const participant = sessionParticipants[data.sessionId].find(p => p.userId === data.userId);
    if (participant) {
      participant.handRaised = data.handRaised;
    }
  }
}

function removeParticipantFromSession(sessionId: string, userId: string) {
  if (sessionParticipants[sessionId]) {
    sessionParticipants[sessionId] = sessionParticipants[sessionId].filter(p => p.userId !== userId);

    if (sessionParticipants[sessionId].length === 0) {
      delete sessionParticipants[sessionId];
    }
  }
}

function getSocketIdForUser(sessionId: string, userId: string): string | null {
  if (sessionParticipants[sessionId]) {
    const participant = sessionParticipants[sessionId].find(p => p.userId === userId);
    return participant?.socketId || null;
  }
  return null;
}