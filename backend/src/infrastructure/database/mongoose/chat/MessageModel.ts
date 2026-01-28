import mongoose, { Schema, Document } from "mongoose";
import { MessageType, MessageStatus } from "../../../../domain/chat/entities/Message";

export interface IMessage extends Document {
  chatId: string;
  senderId: string;
  content: string;
  type: MessageType;
  status: MessageStatus;
  isDeleted: boolean;
  isEdited: boolean;
  deletedFor: string[]; // Array of user IDs for whom the message is deleted
  deletedForEveryone: boolean;
  reactions: {
    userId: string;
    emoji: string;
    createdAt: Date;
  }[];
  attachments?: {
    type: MessageType;
    url: string;
    name: string;
    size: number;
    thumbnail?: string;
    duration?: number; // For audio/video messages
  }[];
  replyTo?: {
    messageId: string;
    content: string;
    senderId: string;
    senderName?: string;
    type?: MessageType;
  };
  forwardedFrom?: {
    messageId: string;
    chatId: string;
    senderId: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    chatId: { type: String, required: true, index: true },
    senderId: { type: String, required: true, index: true },
    content: { type: String },
    type: {
      type: String,
      required: true,
      enum: Object.values(MessageType)
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(MessageStatus),
      default: MessageStatus.Sent
    },
    isDeleted: { type: Boolean, default: false },
    isEdited: { type: Boolean, default: false },
    deletedFor: [{ type: String }],
    deletedForEveryone: { type: Boolean, default: false },
    reactions: [{
      userId: { type: String, required: true },
      emoji: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }],
    attachments: [{
      type: {
        type: String,
        enum: Object.values(MessageType)
      },
      url: { type: String, required: true },
      name: { type: String, required: true },
      size: { type: Number, required: true },
      thumbnail: { type: String },
      duration: { type: Number }
    }],
    replyTo: {
      messageId: { type: String },
      content: { type: String },
      senderId: { type: String },
      senderName: { type: String },
      type: { type: String, enum: Object.values(MessageType) }
    },
    forwardedFrom: {
      messageId: { type: String },
      chatId: { type: String },
      senderId: { type: String }
    }
  },
  {
    timestamps: true
  }
);

// Define indexes separately
messageSchema.index({ chatId: 1, createdAt: -1 }); // For efficient chat message retrieval
messageSchema.index({ senderId: 1, createdAt: -1 }); // For user's message history
messageSchema.index({ "reactions.userId": 1 }); // For reaction queries
messageSchema.index({ deletedFor: 1 }); // For deleted message queries

export const MessageModel = mongoose.model<IMessage>("ChatMessage", messageSchema); 