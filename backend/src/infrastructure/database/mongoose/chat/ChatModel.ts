import mongoose, { Schema, Document } from "mongoose";
import { ChatType } from "../../../../domain/chat/entities/Chat";

export interface IChat extends Document {
  type: ChatType;
  name: string;
  avatar?: string;
  description?: string;
  participants: string[];
  admins: string[];
  createdBy: string;
  lastMessage?: {
    id: string;
    content: string;
    type: string;
    senderId: string;
    status: string;
    createdAt: Date;
  };
  settings: {
    onlyAdminsCanPost: boolean;
    onlyAdminsCanAddMembers: boolean;
    onlyAdminsCanChangeInfo: boolean;
  };
  blockedUsers: { blocker: string; blocked: string }[];
  userChatMeta: {
    userId: string;
    clearedAt?: Date; // timestamp for when the user cleared chat
    isDeleted?: boolean; // if user is removed or deleted
    isMuted?: boolean; // if user has muted notifications
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<IChat>(
  {
    type: {
      type: String,
      required: true,
      enum: Object.values(ChatType)
    },
    name: { type: String, required: true },
    avatar: { type: String },
    description: { type: String },
    participants: [{ type: String, required: true }],
    admins: [{ type: String }],
    createdBy: { type: String, required: true },
    lastMessage: {
      id: { type: String },
      content: { type: String },
      type: { type: String },
      senderId: { type: String },
      status: { type: String },
      createdAt: { type: Date }
    },
    settings: {
      onlyAdminsCanPost: { type: Boolean, default: false },
      onlyAdminsCanAddMembers: { type: Boolean, default: false },
      onlyAdminsCanChangeInfo: { type: Boolean, default: false }
    },
    blockedUsers: [
      {
        blocker: { type: String, required: true },
        blocked: { type: String, required: true }
      }
    ],
    userChatMeta: [
      {
        userId: { type: String, required: true },
        clearedAt: { type: Date, default: null },
        isDeleted: { type: Boolean, default: false },
        isMuted: { type: Boolean, default: false }
      }
    ]
  },
  {
    timestamps: true
  }
);

// Indexes (define separately if using `createIndexes`)
chatSchema.index({ participants: 1 });
chatSchema.index({ type: 1, participants: 1 });
chatSchema.index({ updatedAt: -1 });

export const ChatModel = mongoose.model<IChat>("Chat", chatSchema);
