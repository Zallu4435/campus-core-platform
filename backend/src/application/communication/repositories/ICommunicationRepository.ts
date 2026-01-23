import { Message, UserInfo, Attachment } from "../../../domain/communication/entities/Communication";

export interface ICommunicationRepository {
  getInboxMessages(userId: string, page: number, limit: number, search?: string, status?: string): Promise<{
    messages: Message[];
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
    userId: string;
    status?: string;
    search?: string;
  }>;
  getSentMessages(userId: string, page: number, limit: number, search?: string, status?: string): Promise<{
    messages: Message[];
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
    userId: string;
    search?: string;
  }>;
  sendMessage(
    senderId: string,
    senderRole: string,
    to: Array<{ value: string; label: string }>,
    subject: string,
    content: string,
    attachments?: Attachment[]
  ): Promise<Message>;

  sendUserMessage(
    senderId: string,
    senderRole: string,
    to: Array<{ value: string; label: string }>,
    subject: string,
    content: string,
    attachments?: Attachment[]
  ): Promise<Message>;

  deleteMessage(messageId: string, userId: string): Promise<void>;
  getMessageDetails(messageId: string): Promise<Message | null>;
  markMessageAsRead(messageId: string, userId: string): Promise<void>;
  getAllAdmins(search?: string): Promise<UserInfo[]>;
  fetchUsers(type: string, search?: string): Promise<UserInfo[]>;
}