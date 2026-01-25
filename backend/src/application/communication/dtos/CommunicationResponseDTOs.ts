import { UserInfo } from "../../../domain/communication/entities/Communication";
import { UserRole, MessageStatus } from "../../../domain/communication/enums/CommunicationEnums";

export interface MessageSummaryDTO {
  id: string;
  subject: string;
  content: string;
  sender: UserInfo;
  recipients: UserInfo[];
  isBroadcast: boolean;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
  }>;
  createdAt: string | Date;
  updatedAt: string | Date;
  status?: string;
  to?: string;
  recipientsCount?: number;
}

export interface GetInboxMessagesResponseDTO {
  messages: MessageSummaryDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetSentMessagesResponseDTO {
  messages: AdminSentMessageResponseDTO[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SendMessageResponseDTO {
  id: string;
  subject: string;
  content: string;
  sender: UserInfo;
  recipients: UserInfo[];
  recipientCount: number;
  isBroadcast: boolean;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface MarkMessageAsReadResponseDTO {
  success: boolean;
  message: string;
}

export interface DeleteMessageResponseDTO {
  success: boolean;
  message: string;
}

export interface GetMessageDetailsResponseDTO {
  id: string;
  subject: string;
  content: string;
  sender: UserInfo;
  recipients: UserInfo[];
  recipientCount: number;
  isBroadcast: boolean;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminSentMessageResponseDTO {
  id: string;
  subject: string;
  content: string;
  recipients: string;
  recipientCount: number;
  isBroadcast: boolean;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface GetAllAdminsResponseDTO {
  admins: UserInfo[];
}

export interface FetchUsersResponseDTO {
  users: Array<{
    id: string;
    email: string;
    name: string;
  }>;
}
