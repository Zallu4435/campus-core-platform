export interface GetInboxMessagesRequestDTO {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: 'read' | 'unread';
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}

export interface GetSentMessagesRequestDTO {
  userId: string;
  page: number;
  limit: number;
  search?: string;
  status?: 'read' | 'unread' | 'delivered' | 'opened';
  from?: string;
  to?: string;
  startDate?: string;
  endDate?: string;
}

export interface SendMessageRequestDTO {
  senderId: string;
  senderRole: string;
  to: Array<{ value: string; label: string }>;
  subject: string;
  content: string;
  attachments?: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
  }>;
}

export interface MarkMessageAsReadRequestDTO {
  messageId: string;
  userId: string;
}

export interface DeleteMessageRequestDTO {
  messageId: string;
  userId: string;
}

export interface GetMessageDetailsRequestDTO {
  messageId: string;
  userId: string;
}

export interface GetAllAdminsRequestDTO {
  search?: string;
}



export interface FetchUsersRequestDTO {
  type: 'all' | 'students' | 'faculty' | 'staff';
  search?: string;
  requesterId: string;
} 