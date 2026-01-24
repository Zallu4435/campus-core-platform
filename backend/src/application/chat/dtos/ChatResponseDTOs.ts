import { Chat } from "../../../domain/chat/entities/Chat";
import { Message } from "../../../domain/chat/entities/Message";

export interface GetChatsResponseDTO {
  data: ChatSummaryDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ChatSummaryDTO {
  id: string;
  type: string;
  name: string;
  avatar?: string;
  description?: string;
  lastMessage?: {
    id: string;
    content: string;
    type: string;
    senderId: string;
    status: string;
    createdAt: Date;
  };
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    isOnline: boolean;
  }[];
  admins?: string[];
  isAdmin?: boolean;
  settings?: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanChangeInfo: boolean;
  };
  unreadCount: number;
  updatedAt: Date;
  blockedUsers?: { blocker: string; blocked: string }[];
}

export interface MessageSummaryDTO {
  id: string;
  content: string;
  type: string;
  senderId: string;
  status: string;
  createdAt: Date;
}

export interface GetChatMessagesResponseDTO {
  data: MessageDTO[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  hasMore: boolean;
  oldestMessageTimestamp: string | null;
}

export interface MessageDTO {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  status: string;
  reactions: {
    userId: string;
    emoji: string;
    createdAt: Date;
  }[];
  attachments?: {
    type: string;
    url: string;
    name: string;
    size: number;
    thumbnail?: string;
    duration?: number;
  }[];
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  forwardedFrom?: {
    messageId: string;
    chatId: string;
    senderId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatDetailsResponseDTO {
  chat: ChatSummaryDTO;
  messages: MessageDTO[];
  participants: {
    id: string;
    name: string;
    avatar?: string;
    status: string;
    isAdmin?: boolean;
  }[];
  settings?: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanChangeInfo: boolean;
  };
}

export interface SearchUsersResponseDTO {
  data: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
  }[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
} 