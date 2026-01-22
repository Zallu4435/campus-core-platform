export interface IBase {
  id?: string;
  createdAt: Date;
}

export interface IPerson extends IBase {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  profilePicture?: string;
  blocked?: boolean;
  pending?: boolean;
}

export interface FacultyProps {
  id?: string;
  fullName: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experience: string;
  aboutMe: string;
  cvUrl?: string;
  certificatesUrl?: string[];
}

export interface IUser extends IPerson {
  phone?: string;
  profilePicture?: string;
  passwordChangedAt?: Date;
  fcmTokens: string[];
  blocked?: boolean;
}

export interface IAdmin extends IPerson { }

export interface IFaculty extends IPerson {
  phone?: string;
  profilePicture?: string;
  passwordChangedAt?: Date;
  fcmTokens: string[];
  blocked?: boolean;
}

export interface IRegister extends IPerson {
  pending: boolean;
}

export interface IRefreshSession {
  userId: string;
  sessionId: string;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  createdAt: Date;
  lastUsedAt: Date;
  expiresAt: Date;
}

export type FacultyStatus = "pending" | "approved" | "rejected" | "offered";
export type FacultyRejectedBy = "admin" | "user" | null;

export interface IFacultyRegister {
  fullName: string;
  email: string;
  phone: string;
  department: string;
  qualification: string;
  experience: string;
  aboutMe: string;
  password?: string;
  cvUrl?: string;
  certificatesUrl?: string[];
  rejectedBy: FacultyRejectedBy;
  status: FacultyStatus;
  blocked?: boolean;
  confirmationToken: string | null;
  tokenExpiry: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}