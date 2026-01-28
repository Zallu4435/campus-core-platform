import { Server as SocketIOServer, Namespace } from "socket.io";
import { ChatRepository } from "../../repositories/chat/ChatRepository";
import { MessageStatus } from "../../../domain/chat/entities/Message";
import jwt from "jsonwebtoken";
import { config } from "../../../config/config";

interface AuthenticatedSocket {
  userId: string;
  collection: string;
}

interface SocketMessage {
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  id: string;
}

interface MessageStatusData {
  messageId: string;
  status: MessageStatus;
}

interface ReactionData {
  messageId: string;
  userId: string;
  chatId: string;
}

interface DeleteMessageData {
  messageId: string;
  chatId: string;
}

export class SocketService {
  private io: SocketIOServer;
  private chatNamespace: Namespace;
  private chatRepository: ChatRepository;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.chatNamespace = this.io.of('/chat');
    this.chatRepository = new ChatRepository();

    this.setupErrorHandlers();
    this.setupSocketHandlers();
  }

  private setupErrorHandlers() {
    this.io.on('error', (error) => {
      console.error('[Socket.IO] Server Error:', error);
    });

    this.chatNamespace.on('error', (error) => {
      console.error('[Socket.IO] Chat Namespace Error:', error);
    });
  }

  private setupSocketHandlers() {
    this.chatNamespace.use(this.authenticateSocket.bind(this));

    this.chatNamespace.on("connection_error", (err) => {
      console.error('[Socket.IO] Namespace connection error:', err);
    });

    this.chatNamespace.on("connect_error", (err) => {
      console.error('[Socket.IO] Namespace connect error:', err);
    });

    this.chatNamespace.on("connection", this.handleConnection.bind(this));
  }

  private authenticateSocket(socket, next: (err?: Error) => void) {
    try {
      const token = this.extractToken(socket);

      if (!token) {
        return next(new Error("Authentication error: No access_token cookie provided"));
      }

      const jwtSecret = config.jwt.secret as jwt.Secret;

      try {
        const decoded = jwt.verify(token, jwtSecret) as { userId: string; collection: string };
        socket.data.user = {
          userId: decoded.userId,
          collection: decoded.collection,
        } as AuthenticatedSocket;

        next();
      } catch (jwtError) {
        next(new Error("Authentication error: Invalid access_token"));
      }
    } catch (err) {
      next(new Error("Authentication error: " + (err instanceof Error ? err.message : "Unknown error")));
    }
  }

  private extractToken(socket): string | null {
    if (socket.handshake.headers?.cookie) {
      const cookieStr = socket.handshake.headers.cookie;
      const accessTokenMatch = cookieStr.match(/access_token=([^;]+)/);
      if (accessTokenMatch) {
        return decodeURIComponent(accessTokenMatch[1]);
      }
    }
    return null;
  }

  private handleConnection(socket) {
    const userId = socket.data.user.userId;

    // Add socket to user's set
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
      this.broadcastUserStatus(userId, "online");
    }
    this.userSockets.get(userId)?.add(socket.id);

    // Send initial list of online users
    socket.emit("onlineUsers", Array.from(this.userSockets.keys()));

    this.joinUserChats(userId, socket);

    this.setupEventListeners(socket, userId);
  }

  private setupEventListeners(socket, userId: string) {
    socket.on("joinChat", (data: { chatId: string }) => {
      socket.join(data.chatId);
    });

    socket.on("leaveChat", (data: { chatId: string }) => {
      socket.leave(data.chatId);
    });

    socket.on("typing", (data: { chatId: string; isTyping: boolean }) => {
      socket.to(data.chatId).emit("typing", {
        userId,
        chatId: data.chatId,
        isTyping: data.isTyping
      });
    });

    socket.on("message", async (message: SocketMessage) => {
      if (!message.chatId) {
        return;
      }
      try {
        await this.handleNewMessage(message);
      } catch (error) { }
    });

    socket.on("messageStatus", async (data: MessageStatusData) => {
      try {
        await this.chatRepository.updateMessageStatus(data.messageId, data.status);
        socket.to(data.messageId).emit("messageStatus", data);
      } catch (error) { }
    });

    socket.on("removeReaction", (data: ReactionData) => {
      this.chatNamespace.to(data.chatId).emit("messageReactionRemoved", {
        messageId: data.messageId,
        userId: data.userId,
      });
    });

    socket.on("deleteMessage", (data: DeleteMessageData) => {
      this.chatNamespace.to(data.chatId).emit("messageDeleted", {
        messageId: data.messageId,
        chatId: data.chatId,
      });
    });

    socket.on("disconnect", (reason: string) => {
      this.handleDisconnect(socket, reason);
    });
  }

  private handleDisconnect(socket, reason: string) {
    const userId = socket.data.user?.userId;
    if (userId && this.userSockets.has(userId)) {
      const sockets = this.userSockets.get(userId);
      sockets?.delete(socket.id);

      if (sockets?.size === 0) {
        this.userSockets.delete(userId);
        this.broadcastUserStatus(userId, "offline");
      }
    }
  }

  private broadcastUserStatus(userId: string, status: "online" | "offline") {
    this.chatNamespace.emit("userStatus", { userId, status });
  }

  private async joinUserChats(userId: string, socket) {
    try {
      const response = await this.chatRepository.getChats({ userId, page: 1, limit: 100 });
      response.data.forEach((chat) => {
        socket.join(chat.id);
      });
    } catch (error) {
    }
  }

  private getUserIdBySocketId(socketId: string): string | undefined {
    for (const [userId, sockets] of this.userSockets.entries()) {
      if (sockets.has(socketId)) return userId;
    }
    return undefined;
  }

  public async handleNewMessage(message: SocketMessage) {
    const chatId = message.chatId;

    this.chatNamespace.to(chatId).emit("message", message);

    try {
      const participants = await this.chatRepository.getChatParticipants(chatId);
      if (participants.length > 0) {
        participants.forEach((participant) => {
          if (participant.id !== message.senderId) {
            const socketIds = this.userSockets.get(participant.id);
            if (socketIds) {
              socketIds.forEach(socketId => {
                this.chatNamespace.to(socketId).emit("messageStatus", {
                  messageId: message.id,
                  status: "delivered"
                });
              });
            }
          }
        });
      }
    } catch (error) {
    }
  }

  public async handleUpdatedChat(chat: any) {
    if (!chat || !chat.id) return;
    this.chatNamespace.to(chat.id).emit('chat', chat);
  }

  public async handleDeletedChat(chatId: string) {
    this.chatNamespace.to(chatId).emit('chatDeleted', { chatId });
  }

  public emitToUser(userId: string, event: string, data: any) {
    const socketIds = this.userSockets.get(userId);
    if (socketIds) {
      socketIds.forEach(socketId => {
        this.chatNamespace.to(socketId).emit(event, data);
      });
    }
  }
} 