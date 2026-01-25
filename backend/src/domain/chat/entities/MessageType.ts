export enum MessageType {
  Text = 'text',
  Image = 'image',
  File = 'file',
  Audio = 'audio',
  Video = 'video',
  Location = 'location'
}

export type RepositoryChat = {
  id: string;
  type: string;
  name?: string;
  avatar?: string;
  description?: string;
  participants: string[];
  admins?: string[];
  settings?: Record<string, unknown>;
  lastMessage?: {
    id: string;
    content: string;
    type: string;
    senderId: string;
    status: string;
    attachments?: unknown;
    createdAt: Date;
  } | null;
  blockedUsers?: { blocker: string; blocked: string }[];
  updatedAt: Date;
};

export type RepositoryReaction = {
  userId: string;
  emoji: string;
  createdAt: Date;
};

export type RepositoryAttachment = {
  type: string;
  url: string;
  name?: string;
  size?: number;
  mimetype?: string;
  thumbnail?: string;
  duration?: number;
};

export type RepositoryReplyTo = {
  messageId: string;
  content: string;
  senderId: string;
  type?: string;
};

export type RepositoryForwardedFrom = {
  messageId: string;
  chatId: string;
  senderId: string;
};

export type RepositoryMessage = {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  status: string;
  reactions?: RepositoryReaction[];
  attachments?: RepositoryAttachment[];
  replyTo?: RepositoryReplyTo;
  forwardedFrom?: RepositoryForwardedFrom;
  createdAt: Date;
  updatedAt: Date;
  isDeleted?: boolean;
  deletedForEveryone?: boolean;
  deletedFor?: string[];
};

export type RepositoryUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
};

export type GetChatsRepoResult = {
  chats: RepositoryChat[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export type SearchChatsRepoResult = GetChatsRepoResult & {
  matchingUserIds: string[];
};

export type GetChatMessagesRepoResult = {
  messages: RepositoryMessage[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export type SearchUsersRepoResponse = {
  data: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar?: string;
    type: 'user';
  }>;
  totalItems: number;
  totalPages: number;
  currentPage: number;
};

export type CreatedChatParticipantSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
};

export type CreatedChatSummary = {
  id: string;
  type: string;
  name: string;
  avatar?: string;
  participants: CreatedChatParticipantSummary[];
  unreadCount: number;
  updatedAt: Date;
};
