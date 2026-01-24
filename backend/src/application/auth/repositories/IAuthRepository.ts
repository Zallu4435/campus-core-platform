import {
  RegisterRequestDTO,
  RegisterFacultyRequestDTO
} from "../dtos/AuthRequestDTOs";
import {
  RegisterResult,
  RegisterFacultyResult,
  UserWithCollectionAndPassword,
  UserWithCollection,
  RefreshSessionData,
  UserCollection
} from "./types/AuthRepositoryTypes";
import { User } from "../../../domain/auth/entities/Auth";
import { AuthCollection } from "../constants/AuthConstants";

export interface IAuthRepository {
  register(params: RegisterRequestDTO): Promise<RegisterResult>;

  findUserByEmail(email: string): Promise<UserWithCollectionAndPassword | null>;

  hasAdmission(userId: string): Promise<boolean>;

  refreshToken(userId: string, collection: AuthCollection): Promise<UserWithCollection>;

  registerFaculty(params: RegisterFacultyRequestDTO): Promise<RegisterFacultyResult>;

  sendEmailOtp(email: string): Promise<{ message: string }>;

  resetPassword(email: string, newPassword: string): Promise<UserWithCollection>;

  // Domain Aggregate Methods (Phase 3)
  findUserAggregateByEmail(email: string): Promise<{ user: User; collection: string } | null>;
  save(user: User, collection: string): Promise<void>;

  confirmRegistration(email: string): Promise<{ message: string }>;

  createRefreshSession(params: RefreshSessionData): Promise<void>;

  findSessionBySessionIdAndUserId(sessionId: string, userId: string): Promise<RefreshSessionData | null>;
  findSessionByUserIdAndDevice(userId: string, userAgent: string, ipAddress: string): Promise<RefreshSessionData | null>;
  findLatestSessionByUserId(userId: string): Promise<RefreshSessionData | null>;
  updateSessionRefreshToken(sessionId: string, newRefreshToken: string, newExpiresAt: Date, newLastUsedAt: Date): Promise<void>;
  deleteSessionBySessionId(sessionId: string): Promise<void>;
  deleteAllSessionsByUserId(userId: string): Promise<void>;
  getAllSessions(): Promise<RefreshSessionData[]>;
  findUsersByIds(ids: string[]): Promise<User[]>;
}