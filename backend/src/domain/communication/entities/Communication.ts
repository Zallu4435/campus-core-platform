import { UserRole, MessageStatus } from '../enums/CommunicationEnums';

export interface UserInfo {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  status?: MessageStatus;
  firstName?: string;
  lastName?: string;
}

export interface Attachment {
  filename: string;
  path: string;
  contentType: string;
  size: number;
}

export class Message {
  constructor(
    public readonly _id: string,
    public readonly subject: string,
    public readonly content: string,
    public readonly sender: UserInfo,
    public readonly recipients: UserInfo[],
    public readonly isBroadcast: boolean,
    public readonly attachments: Attachment[],
    public readonly createdAt: string,
    public readonly updatedAt: string
  ) { }

  markAsRead(userId: string): void {
    const recipient = this.recipients.find(r => r._id.toString() === userId);
    if (recipient) {
      recipient.status = MessageStatus.Read;
    }
  }

  isRecipient(userId: string): boolean {
    return this.recipients.some(r => r._id.toString() === userId);
  }

  isSender(userId: string): boolean {
    return this.sender._id.toString() === userId;
  }

  canAccess(userId: string): boolean {
    return this.isSender(userId) || this.isRecipient(userId);
  }
}