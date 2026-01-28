export interface MessageProps {
  id: string;
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  reactions: MessageReaction[];
  isEdited: boolean;
  isDeleted: boolean;
  deletedForEveryone: boolean;
  deletedFor: string[];
  createdAt: Date;
  updatedAt: Date;
  attachments?: MessageAttachment[];
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderName: string;
    type: MessageType;
    createdAt: string;
  };
}

export enum MessageType {
  Text = "text",
  Image = "image",
  File = "file",
  Audio = "audio",
  Video = "video",
  Document = "document",
  System = "system"
}

export enum MessageStatus {
  Sending = "sending",
  Sent = "sent",
  Delivered = "delivered",
  Read = "read",
  Error = "error"
}

export interface MessageReaction {
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface MessageAttachment {
  type: MessageType;
  url: string;
  name: string;
  size: number;
  thumbnail?: string;
  duration?: number;
}

export class Message {
  private props: MessageProps;

  constructor(props: MessageProps) {
    this.props = props;
  }

  get id(): string {
    return this.props.id;
  }

  get chatId(): string {
    return this.props.chatId;
  }

  get senderId(): string {
    return this.props.senderId;
  }

  get content(): string {
    return this.props.content;
  }

  get type(): MessageType {
    return this.props.type;
  }

  get status(): MessageStatus {
    return this.props.status;
  }

  get reactions(): MessageReaction[] {
    return this.props.reactions;
  }

  get isEdited(): boolean {
    return this.props.isEdited;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedForEveryone(): boolean {
    return this.props.deletedForEveryone;
  }

  get deletedFor(): string[] {
    return this.props.deletedFor;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  get attachments(): MessageAttachment[] | undefined {
    return this.props.attachments;
  }

  get replyTo(): MessageProps['replyTo'] {
    return this.props.replyTo;
  }

  updateStatus(status: MessageStatus): void {
    this.props.status = status;
    this.props.updatedAt = new Date();
  }

  editContent(newContent: string): void {
    this.props.content = newContent;
    this.props.isEdited = true;
    this.props.updatedAt = new Date();
  }

  delete(userId: string, deleteForEveryone: boolean): void {
    if (deleteForEveryone) {
      this.props.isDeleted = true;
      this.props.deletedForEveryone = true;
      this.props.content = '';
      this.props.attachments = [];
    } else {
      this.props.deletedFor.push(userId);
      this.props.isDeleted = true;
    }
    this.props.updatedAt = new Date();
  }

  addReaction(userId: string, emoji: string): void {
    const existingReaction = this.props.reactions.find(r => r.userId === userId);
    if (existingReaction) {
      existingReaction.emoji = emoji;
      existingReaction.createdAt = new Date();
    } else {
      this.props.reactions.push({
        userId,
        emoji,
        createdAt: new Date()
      });
    }
    this.props.updatedAt = new Date();
  }

  removeReaction(userId: string): void {
    this.props.reactions = this.props.reactions.filter(r => r.userId !== userId);
    this.props.updatedAt = new Date();
  }

  toJSON() {
    return {
      id: this.id,
      chatId: this.chatId,
      senderId: this.senderId,
      content: this.content,
      type: this.type,
      status: this.status,
      reactions: this.reactions,
      isEdited: this.isEdited,
      isDeleted: this.isDeleted,
      deletedForEveryone: this.deletedForEveryone,
      deletedFor: this.deletedFor,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      attachments: this.attachments,
      replyTo: this.replyTo
    };
  }
} 