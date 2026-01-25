import { Types } from "mongoose";

export interface IAdmissionDraftSource {
    _id: Types.ObjectId | string;
    id?: string;
    applicationId: string;
    registerId: string;
    personalInfo?: Record<string, unknown>;
    choiceOfStudy?: Array<{ programme: string; degree: string; catalogYear: string }>;
    education?: Record<string, unknown>;
    achievements?: Record<string, unknown>;
    otherInformation?: Record<string, unknown>;
    documents?: Record<string, unknown>;
    declaration?: Record<string, unknown>;
    completedSteps?: string[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface IAdmissionSource extends IAdmissionDraftSource {
    paymentId?: Types.ObjectId | string;
    status: string;
    rejectedBy?: string;
    confirmationToken?: string;
    tokenExpiry?: Date;
}
