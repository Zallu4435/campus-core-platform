import { IUser, FacultyProps } from "../../../domain/auth/entities/AuthTypes";

export type RegisterRequestDTO = Pick<IUser, "firstName" | "lastName" | "email" | "password">;

export interface LoginRequestDTO {
  email: string;
  password: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface RefreshTokenRequestDTO {
  refreshToken?: string;
  userId?: string;
  email?: string;
  collection?: 'register' | 'admin' | 'user' | 'faculty';
}


export interface LogoutRequestDTO {
  sessionId?: string;
  accessToken?: string;
}


export type RegisterFacultyRequestDTO = Pick<FacultyProps, "fullName" | "email" | "phone" | "department" | "qualification" | "experience" | "aboutMe" | "cvUrl" | "certificatesUrl">;

export interface SendEmailOtpRequestDTO {
  email: string;
}

export interface VerifyEmailOtpRequestDTO {
  email: string;
  otp: string;
}

export interface ResetPasswordRequestDTO {
  resetToken: string;
  newPassword: string;
  email?: string;
}