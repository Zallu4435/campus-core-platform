import { Message, MessageType } from "../../../domain/chat/entities/Message";
import { Chat } from "../../../domain/chat/entities/Chat";

export interface PaginatedResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ChatDetails {
  chat: Chat;
  messages: Message[];
  participants: { id: string; firstName: string; lastName: string; email: string; avatar?: string }[];
  unreadCount: number;
}

export interface CreatedChatSummary {
  id: string;
  type: string;
  name: string;
  avatar?: string;
  participants: { id: string; firstName: string; lastName: string; email: string; avatar?: string; isOnline: boolean }[];
  unreadCount: number;
  updatedAt: Date;
}

export interface IChatRepository {
  getChats(params: { userId: string; page: number; limit: number }): Promise<PaginatedResult<Chat>>;
  searchChats(params: { userId: string; query: string; page: number; limit: number }): Promise<PaginatedResult<Chat> & { matchingUserIds: string[] }>;
  getChatMessages(params: { chatId: string; userId: string; page: number; limit: number; before?: string }): Promise<PaginatedResult<Message>>;
  sendMessage(params: { chatId: string; senderId: string; content: string; type: MessageType; attachments?: Array<{ type: MessageType; url: string; name: string; size: number; thumbnail?: string; duration?: number }> }): Promise<void>;
  markMessagesAsRead(params: { chatId: string; userId: string }): Promise<void>;
  addReaction(params: { messageId: string; userId: string; emoji: string }): Promise<void>;
  removeReaction(params: { messageId: string; userId: string }): Promise<void>;
  getChatDetails(chatId: string, userId: string): Promise<ChatDetails | null>;
  searchUsers(params: { userId: string; query: string; page: number; limit: number }): Promise<PaginatedResult<{ id: string; firstName: string; lastName: string; email: string; avatar?: string; type: 'user' }>>;
  createChat(params: { creatorId: string; participantId: string; type: string; name?: string; avatar?: string }): Promise<CreatedChatSummary>;
  createGroupChat(params: { name: string; description?: string; participants: string[]; creatorId: string; settings?: Record<string, unknown>; avatar?: string }): Promise<CreatedChatSummary>;
  addGroupMember(params: { chatId: string; userId: string; addedBy: string }): Promise<void>;
  removeGroupMember(params: { chatId: string; userId: string; removedBy: string }): Promise<void>;
  updateGroupAdmin(params: { chatId: string; userId: string; isAdmin: boolean; updatedBy: string }): Promise<void>;
  updateGroupSettings(params: { chatId: string; settings: Record<string, unknown>; updatedBy: string }): Promise<void>;
  updateGroupInfo(params: { chatId: string; name?: string; description?: string; avatar?: string; updatedBy: string }): Promise<void>;
  leaveGroup(params: { chatId: string; userId: string }): Promise<void>;
  editMessage(params: { chatId: string; messageId: string; content: string; userId: string }): Promise<void>;
  deleteMessage(params: { messageId: string; userId: string; deleteForEveryone?: boolean }): Promise<void>;
  replyToMessage(params: { chatId: string; messageId: string; content: string; userId: string }): Promise<void>;
  deleteChat(params: { chatId: string; userId: string }): Promise<void>;
  blockChat(params: { chatId: string; userId: string }): Promise<void>;
  updateMessageStatus(messageId: string, status: string): Promise<void>;
  clearChat(params: { chatId: string; userId: string }): Promise<void>;

  // Helper methods
  getUnreadCountForChat(params: { chatId: string; userId: string }): Promise<number>;
  getLastMessageForChat(params: { chatId: string; userId: string }): Promise<Message | null>;
  getUsersByIds(ids: string[]): Promise<Array<{ id: string; firstName: string; lastName: string; email: string; avatar?: string }>>;
} 