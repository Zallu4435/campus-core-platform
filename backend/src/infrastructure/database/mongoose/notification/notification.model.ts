import mongoose, { Schema, Document } from "mongoose";
import { NotificationRecipientType, NotificationStatus } from "../../../../domain/notifications/entities/NotificationTypes";

export interface NotificationDoc extends Document {
  title: string;
  message: string;
  recipientType: NotificationRecipientType;
  recipientId?: string;
  recipientName?: string;
  createdBy: string;
  createdAt: Date;
  status: NotificationStatus;
  readBy: string[];
}

const NotificationSchema = new Schema<NotificationDoc>({
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipientType: {
    type: String,
    enum: Object.values(NotificationRecipientType),
    required: true,
  },
  recipientId: { type: String, required: false },
  recipientName: { type: String, required: false },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, required: true },
  status: { type: String, enum: Object.values(NotificationStatus), required: true },
  readBy: { type: [String], default: [] },
}, { timestamps: true });

NotificationSchema.index({ recipientId: 1, createdAt: -1 });
NotificationSchema.index({ recipientType: 1, createdAt: -1 });
NotificationSchema.index({ createdBy: 1, createdAt: -1 });
NotificationSchema.index({ readBy: 1 });

export const NotificationModel = mongoose.model<NotificationDoc>(
  "Notification",
  NotificationSchema
);
