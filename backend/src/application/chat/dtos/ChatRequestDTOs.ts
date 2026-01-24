export interface GetChatsRequestDTO {
  userId: string;
  page: number;
  limit: number;
}

export interface SearchChatsRequestDTO {
  userId: string;
  query: string;
  page: number;
  limit: number;
}

export interface GetChatMessagesRequestDTO {
  chatId: string;
  userId: string;
  page?: number;
  limit?: number;
  before?: string;
}

export interface SendMessageRequestDTO {
  chatId: string;
  senderId: string;
  content: string;
  type: string;
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
  };
  attachments?: {
    type: string;
    url: string;
    name: string;
    size: number;
    thumbnail?: string;
    duration?: number;
  }[];
}

export interface MarkMessagesAsReadRequestDTO {
  chatId: string;
  userId: string;
}

export interface AddReactionRequestDTO {
  messageId: string;
  userId: string;
  emoji: string;
}

export interface RemoveReactionRequestDTO {
  messageId: string;
  userId: string;
}

export interface SearchUsersRequestDTO {
  userId: string;
  query: string;
  page: number;
  limit: number;
}

export interface CreateChatRequestDTO {
  creatorId: string;
  participantId: string;
  type: 'direct' | 'group';
  name?: string;
  avatar?: string;
}

export interface EditMessageRequestDTO {
  chatId: string;
  messageId: string;
  content: string;
  userId: string;
}

export interface DeleteMessageRequestDTO {
  messageId: string;
  userId: string;
  deleteForEveryone: boolean;
}

export interface ForwardMessageRequestDTO {
  messageId: string;
  targetChatId: string;
  forwardedBy: string;
}

export interface ReplyToMessageRequestDTO {
  chatId: string;
  messageId: string;
  content: string;
  userId: string;
}

export interface AddGroupMemberRequestDTO {
  chatId: string;
  userId: string;
  addedBy: string;
}

export interface RemoveGroupMemberRequestDTO {
  chatId: string;
  userId: string;
  removedBy: string;
}

export interface UpdateGroupAdminRequestDTO {
  chatId: string;
  userId: string;
  isAdmin: boolean;
  updatedBy: string;
}

export interface UpdateGroupSettingsRequestDTO {
  chatId: string;
  settings: {
    onlyAdminsCanPost?: boolean;
    onlyAdminsCanAddMembers?: boolean;
    onlyAdminsCanChangeInfo?: boolean;
  };
  updatedBy: string;
}

export interface UpdateGroupInfoRequestDTO {
  chatId: string;
  name?: string;
  description?: string;
  avatar?: string;
  updatedBy: string;
}

export interface LeaveGroupRequestDTO {
  chatId: string;
  userId: string;
}

export interface CreateGroupChatRequestDTO {
  name: string;
  description?: string;
  participants: string[];
  creatorId: string;
  settings?: {
    onlyAdminsCanPost?: boolean;
    onlyAdminsCanAddMembers?: boolean;
    onlyAdminsCanChangeInfo?: boolean;
  };
  avatar?: string;
}

export interface DeleteChatRequestDTO {
  chatId: string;
  userId: string;
}

export interface BlockChatRequestDTO {
  chatId: string;
  userId: string;
}

export interface ClearChatRequestDTO {
  chatId: string;
  userId: string;
} 