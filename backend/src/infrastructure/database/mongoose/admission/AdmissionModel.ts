import mongoose, { Schema, Document, Model } from "mongoose";
import { IAdmission, AdmissionStatus, RejectedBy } from "../../../../domain/admission/entities/AdmissionTypes";

interface IAdmissionDocument extends Omit<IAdmission, 'id'>, Document { }

const AdmissionSchema = new Schema<IAdmissionDocument>(
  {
    applicationId: { type: String, required: true, unique: true },
    registerId: { type: String, required: true, ref: "Register" },
    personal: { type: Object, default: {} },
    choiceOfStudy: { type: [Object], default: [] },
    education: { type: Object, default: {} },
    achievements: { type: Object, default: {} },
    otherInformation: { type: Object, default: {} },
    documents: { type: Object, default: {} },
    declaration: { type: Object, default: {} },
    paymentId: { type: String, required: true },
    rejectedBy: {
      type: String,
      enum: [...Object.values(RejectedBy), null],
      default: null
    },
    status: {
      type: String,
      enum: Object.values(AdmissionStatus),
      default: AdmissionStatus.PENDING
    },
    confirmationToken: { type: String, default: null },
    tokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Admission: Model<IAdmissionDocument> =
  mongoose.models.Admission || mongoose.model<IAdmissionDocument>("Admission", AdmissionSchema);