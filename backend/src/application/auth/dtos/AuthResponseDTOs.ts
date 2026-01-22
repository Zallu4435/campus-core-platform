import { UserDTO, FacultyDTO } from "./UserDTO";

export interface RegisterResponseDTO {
  message: string;
  user: { id: string; firstName: string; lastName: string; email: string };
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  user: UserDTO;
  collection: "register" | "admin" | "user" | "faculty";
  sessionId: string;
}

export interface RefreshTokenResponseDTO {
  accessToken: string;
  user: UserDTO;
  collection: "register" | "admin" | "user" | "faculty";
}

export interface LogoutResponseDTO {
  message: string;
}

export interface RegisterFacultyResponseDTO {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
  };
  collection: "faculty";
}

export interface SendEmailOtpResponseDTO {
  message: string;
}

export interface VerifyEmailOtpResponseDTO {
  resetToken: string;
}

export interface ResetPasswordResponseDTO {
  token: string;
  user: UserDTO;
  collection: "register" | "admin" | "user" | "faculty";
}

export interface GenericResponseDTO {
  message: string;
}