import mongoose, { Schema, Document } from "mongoose";
import { EnquiryStatus } from "../../../../domain/enquiry/entities/EnquiryTypes";

export interface IEnquiryPersistence extends Document {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: EnquiryStatus;
  createdAt: Date;
  updatedAt: Date;
}

const enquirySchema = new Schema<IEnquiryPersistence>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: String,
      enum: Object.values(EnquiryStatus),
      default: EnquiryStatus.PENDING,
    },
  },
  {
    timestamps: true,
  }
);

enquirySchema.index({ status: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ email: 1 });
enquirySchema.index({ subject: "text", message: "text" });

export const Enquiry = mongoose.model<IEnquiryPersistence>("Enquiry", enquirySchema);