// Base for all entities with id and timestamps
export interface IBase {
  id?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Enums
export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
}

export enum PaymentMethod {
  CREDIT_CARD = "credit_card",
  STRIPE = "stripe",
}

export enum AdmissionStatus {
  PENDING = "pending",
  OFFERED = "offered",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum RejectedBy {
  ADMIN = "admin",
  USER = "user"
}

// Base for admission draft with common fields
export interface IAdmissionDraftBase extends IBase {
  applicationId: string;
  registerId: string; // Use string instead of ObjectId
  personal: Record<string, unknown>;
  choiceOfStudy: Record<string, unknown>[];
  education: Record<string, unknown>;
  achievements: Record<string, unknown>;
  otherInformation: Record<string, unknown>;
  documents: Record<string, unknown>;
  declaration: Record<string, unknown>;
  completedSteps: string[];
}

// Admission draft props for domain entity
export interface AdmissionDraftProps {
  id?: string;
  applicationId: string;
  registerId: string;
  personal?: Record<string, unknown>;
  choiceOfStudy?: Record<string, unknown>[];
  education?: Record<string, unknown>;
  achievements?: Record<string, unknown>;
  otherInformation?: Record<string, unknown>;
  documents?: Record<string, unknown>;
  declaration?: Record<string, unknown>;
  completedSteps?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Admission props extending draft props
export interface AdmissionProps extends AdmissionDraftProps {
  paymentId: string;
  status?: AdmissionStatus;
  rejectedBy?: RejectedBy | null;
  confirmationToken?: string | null;
  tokenExpiry?: Date | null;
}

// Shared admission model types (refactored to pure TypeScript)
export interface IAdmissionDraft extends IAdmissionDraftBase { }

export interface IAdmission extends IAdmissionDraftBase {
  paymentId: string;
  status: AdmissionStatus;
  rejectedBy: RejectedBy | null;
  confirmationToken: string | null;
  tokenExpiry: Date | null;
}

// Document types
export interface IDocument {
  id?: string;
  applicationId: string;
  documentType: string;
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
  createdAt: Date;
  updatedAt: Date;
} 