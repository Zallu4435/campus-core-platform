export interface Message {
  id: string;
  subject: string;
  content: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  recipients: string | any[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  isBroadcast: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'read' | 'unread' | 'delivered' | 'opened';
  recipientsCount: number;
  date?: string;
  time?: string;
}

export interface MessageDetailsModalProps {
  message: Message;
  onReply: () => void;
  onArchive: () => void;
  onDelete: () => void;
  isOpen: boolean;
  onClose: () => void;
  messageType: 'inbox' | 'sent';
}

export type MessageStatus = 'read' | 'unread' | 'delivered' | 'opened';
export type MessageTab = 'inbox' | 'sent' | 'compose';

export interface UserGroup {
  value: string;
  label: string;
}

export interface MessageAction {
  icon: React.ReactNode;
  label: string;
  onClick: (message: Message) => void;
  color: 'blue' | 'green' | 'gray' | 'red';
}

export interface MessageColumn {
  header: string;
  key: string;
  render: (message: Message) => React.ReactNode;
  width?: string;
}

export type RecipientType = '' | 'all_students' | 'all_faculty' | 'all_users' | 'individual_students' | 'individual_faculty';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface ComposeMessageForm {
  to: { value: string; label: string }[];
  subject: string;
  message: string;
  isAdmin?: boolean;
}

export interface ComposeMessageModalProps {
  initialForm: ComposeMessageForm;
  onSend: (form: ComposeMessageForm) => void;
  onCancel: () => void;
  isOpen: boolean;
  userGroups: UserGroup[];
  fetchUsers: (type: RecipientType, search?: string) => Promise<User[]>;
}

export type UserArrayWithUsers = User[] & { users?: User[] };

export type TransformedMessage = {
  id: string;
  subject: string;
  content: string;
  sender?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  recipients: string;
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    size: number;
    type: string;
  }>;
  isBroadcast: boolean;
  createdAt: string;
  updatedAt: string;
  status: 'read' | 'unread' | 'delivered' | 'opened';
  recipientsCount: number;
  date?: string;
  time?: string;
};