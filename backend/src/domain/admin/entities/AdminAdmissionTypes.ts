// AdminAdmissionTypes.ts

export enum AdminAdmissionStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
  Offered = "offered"
}

export interface AdminAdmissionChoiceOfStudy {
  programme: string;
  degree?: string;
  catalogYear?: string;
}

export interface AdminAdmissionPersonal {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  nationality?: string;
}

export interface AdminAdmissionDocumentItem {
  id: string;
  fileName: string;
  fileType?: string;
  url?: string;
  cloudinaryUrl?: string;
  path?: string;
  uploadedAt?: Date;
}

export interface AdminAdmissionDocuments {
  documents: AdminAdmissionDocumentItem[];
  [key: string]: unknown;
}

export interface AdminAdmissionEducation {
  [key: string]: unknown;
}

export interface AdminAdmissionAchievements {
  [key: string]: unknown;
}

/**
 * Core Domain Entity for Admission
 * Represents the pure business logic entity without persistence or presentation concerns
 */
export interface AdminAdmission {
  id: string; // Required - unique identifier
  registerId: string;
  applicationId: string;
  personal: AdminAdmissionPersonal;
  choiceOfStudy: AdminAdmissionChoiceOfStudy[];
  education: AdminAdmissionEducation;
  achievements: AdminAdmissionAchievements;
  otherInformation: Record<string, unknown>;
  documents: AdminAdmissionDocuments;
  declaration: Record<string, unknown>;
  paymentId: string;
  status: AdminAdmissionStatus;
  confirmationToken?: string;
  tokenExpiry?: Date;
  rejectedBy?: string;
  createdAt: Date; // Required
  updatedAt?: Date;
}

/**
 * Extended type for full admission details
 * Used when all fields are needed (e.g., detail views)
 */
export interface FullAdmissionDetails extends AdminAdmission { }

/**
 * Persistence type for database operations
 * Includes _id for MongoDB compatibility
 */
export interface AdminAdmissionPersistence extends Omit<AdminAdmission, 'id'> {
  _id?: string;
}
