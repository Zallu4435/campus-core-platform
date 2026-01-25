import mongoose, { Schema, Document, Model } from "mongoose";
import { IAdmissionDraft } from "../../../../domain/admission/entities/AdmissionTypes";

interface IAdmissionDraftDocument extends Omit<IAdmissionDraft, 'id'>, Document { }

const AdmissionDraftSchema: Schema = new Schema(
  {
    applicationId: { type: String, required: true, unique: true },
    registerId: { type: Schema.Types.ObjectId, required: true, ref: "Register" },
    personalInfo: { type: Object, default: {} },
    choiceOfStudy: { type: [Schema.Types.Mixed], default: [] },
    education: { type: Object, default: {} },
    achievements: { type: Object, default: {} },
    otherInformation: { type: Object, default: {} },
    documents: { type: Object, default: {} },
    declaration: { type: Object, default: {} },
    completedSteps: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const AdmissionDraft: Model<IAdmissionDraftDocument> =
  mongoose.models.AdmissionDraft || mongoose.model<IAdmissionDraftDocument>("AdmissionDraft", AdmissionDraftSchema);