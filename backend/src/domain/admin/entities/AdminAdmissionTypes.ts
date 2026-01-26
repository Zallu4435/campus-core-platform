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
  preferredMajor?: string;
  [key: string]: unknown;
}

export interface AdminAdmissionPersonal {
  fullName: string;
  emailAddress: string;
  phoneNumber?: string;
  dateOfBirth?: Date | string;
  gender?: string;
  nationality?: string;
  // Extended fields for details view
  salutation?: string;
  familyName?: string;
  givenName?: string;
  maritalStatus?: string;
  mobileCountry?: string;
  mobileArea?: string;
  mobileNumber?: string;
  phoneCountry?: string;
  phoneArea?: string;
  alternativeEmail?: string;
  alternateContactName?: string;
  relationshipWithApplicant?: string;
  occupation?: string;
  altMobileCountry?: string;
  altMobileArea?: string;
  altMobileNumber?: string;
  altPhoneCountry?: string;
  altPhoneArea?: string;
  altPhoneNumber?: string;
  blockNumber?: string;
  streetName?: string;
  buildingName?: string;
  floorNumber?: string;
  unitNumber?: string;
  stateCity?: string;
  country?: string;
  postalCode?: string;
  citizenship?: string;
  residentialStatus?: string;
  race?: string;
  religion?: string;
  passportNumber?: string;
  [key: string]: unknown;
}

export interface AdminAdmissionDocumentItem {
  id: string;
  fileName: string;
  fileType?: string;
  url?: string;
  cloudinaryUrl?: string; // Add explicit cloudinaryUrl support
  path?: string;
  uploadedAt?: Date;
  [key: string]: unknown;
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

export interface FullAdmissionDetails extends AdminAdmission { }
