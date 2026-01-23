import mongoose, { Schema, Document } from 'mongoose';
import { UserRole, MessageStatus } from '../../../../domain/communication/enums/CommunicationEnums';

export interface IMessage extends Document {
  subject: string;
  content: string;
  sender: {
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: UserRole;
  };
  recipients: Array<{
    _id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    role: UserRole;
    status: MessageStatus;
  }>;
  isBroadcast: boolean;
  attachments: Array<{
    filename: string;
    path: string;
    contentType: string;
    size: number;
    public_id: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  subject: { type: String, required: true, trim: true },
  content: { type: String, required: true, trim: true },
  sender: {
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: Object.values(UserRole) },
  },
  recipients: [{
    _id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    role: { type: String, required: true, enum: Object.values(UserRole) },
    status: { type: String, enum: Object.values(MessageStatus), default: MessageStatus.Unread },
  }],
  isBroadcast: { type: Boolean, default: false },
  attachments: [{
    filename: { type: String, required: true },
    path: { type: String, required: true }, // Cloudinary URL
    contentType: { type: String, required: true },
    size: { type: Number, required: true },
    public_id: { type: String, required: true }, // Cloudinary public_id for file management
  }],
}, { timestamps: true });

MessageSchema.index({ 'sender._id': 1, createdAt: -1 });
MessageSchema.index({ 'recipients._id': 1, 'recipients.status': 1, createdAt: -1 });

export const MessageModel = mongoose.models.Message || mongoose.model<IMessage>('Message', MessageSchema);