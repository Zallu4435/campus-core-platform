import {
  RegisterRequestDTO, LoginRequestDTO,
  RegisterFacultyRequestDTO, SendEmailOtpRequestDTO, VerifyEmailOtpRequestDTO, ResetPasswordRequestDTO,
} from "../dtos/AuthRequestDTOs";
import {
  RegisterResponseDTO, LoginResponseDTO, RefreshTokenResponseDTO, LogoutResponseDTO,
  RegisterFacultyResponseDTO, SendEmailOtpResponseDTO, VerifyEmailOtpResponseDTO, ResetPasswordResponseDTO,
  GenericResponseDTO
} from "../dtos/AuthResponseDTOs";
import { AuthCollection, TokenType, AUTH_MESSAGES, AUTH_EXPIRIES } from "../constants/AuthConstants";

import { IAuthRepository } from '../repositories/IAuthRepository';
import { SessionService } from '../../../domain/auth/services/SessionService';

import { IJwtService } from "../service/IJwtService";
import { IOtpService } from '../service/IOtpService';
import { IEmailService } from "../service/IEmailService";
import { IPasswordService } from "../service/IPasswordService";
import { IIdGeneratorService } from "../service/IIdGeneratorService";
import {
  InvalidCredentialsError,
  InvalidTokenError,
  BlockedAccountError,
  AdmissionExistsError,
  EmailNotConfirmedError
} from "../../../domain/auth/errors/AuthErrors";
import {
  IRegisterUseCase,
  ILoginUseCase,
  IRefreshTokenUseCase,
  ILogoutUseCase,
  IRegisterFacultyUseCase,
  ISendEmailOtpUseCase,
  IVerifyEmailOtpUseCase,
  IResetPasswordUseCase,
  ILogoutAllUseCase,
  IConfirmRegistrationUseCase
} from "./IAuthUseCases";

/**
 * Configuration interface for auth-related settings
 */
export interface IAuthConfig {
  frontendUrl: string;
  accessTokenExpiry: string;
  refreshTokenExpiry: string;
}



export class RegisterUseCase implements IRegisterUseCase {
  constructor(
    private authRepository: IAuthRepository,
    private jwtService: IJwtService,
    private emailService: IEmailService,
    private passwordService: IPasswordService,
    private config: IAuthConfig
  ) { }

  async execute(params: RegisterRequestDTO): Promise<RegisterResponseDTO> {
    // Use password service abstraction instead of direct bcrypt
    const hashedPassword = await this.passwordService.hash(params.password);

    // Pass DTO directly to repository (no need for RegisterRequest entity)
    const resultFromRepo = await this.authRepository.register({
      firstName: params.firstName,
      lastName: params.lastName,
      email: params.email,
      password: hashedPassword
    });

    const confirmationToken = this.jwtService.generateToken(
      { email: params.email, type: TokenType.CONFIRMATION },
      AUTH_EXPIRIES.CONFIRMATION_TOKEN
    );

    // Use injected config instead of direct import
    const confirmationUrl = `${this.config.frontendUrl}/confirm-registration?token=${confirmationToken}`;

    await this.emailService.sendRegistrationConfirmationEmail({
      to: params.email,
      name: params.firstName,
      confirmationUrl,
    });

    return {
      message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
      user: {
        firstName: resultFromRepo.user.firstName,
        lastName: resultFromRepo.user.lastName,
        email: resultFromRepo.user.email,
        id: resultFromRepo.user.id,
      },
    };
  }
}

export class LoginUseCase implements ILoginUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService,
    private _passwordService: IPasswordService,
    private _idGeneratorService: IIdGeneratorService
  ) { }

  async execute(params: LoginRequestDTO & { userAgent: string; ipAddress: string }): Promise<LoginResponseDTO> {
    // BUSINESS LOGIC: Find user by email
    const resultFromRepo = await this._authRepository.findUserByEmail(params.email);

    // BUSINESS LOGIC: Validate user exists
    if (!resultFromRepo) {
      throw new InvalidCredentialsError();
    }

    const user = resultFromRepo.user;
    const collection = resultFromRepo.collection;

    // BUSINESS LOGIC: Validate password
    const isPasswordValid = await this._passwordService.compare(params.password, user.password as string);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // BUSINESS LOGIC: Check if account is blocked
    if (user.blocked) {
      throw new BlockedAccountError();
    }

    // BUSINESS LOGIC: For register collection, check admission and email confirmation
    if (collection === AuthCollection.REGISTER) {
      const hasAdmission = await this._authRepository.hasAdmission(user.id);
      if (hasAdmission) {
        throw new AdmissionExistsError();
      }
      if (user.pending) {
        throw new EmailNotConfirmedError();
      }
    }

    const tokenPayload = {
      userId: user.id,
      email: user.email,
      collection,
      type: TokenType.ACCESS
    };

    const accessToken = this._jwtService.generateAccessToken(tokenPayload);
    let sessionId: string;
    let refreshToken: string;
    const now = new Date();
    // Use SessionService for expiry calculation
    const expiresAt = SessionService.calculateExpiryDate(now);

    const existingSession = await this._authRepository.findSessionByUserIdAndDevice(user.id, params.userAgent, params.ipAddress);
    if (existingSession) {
      sessionId = existingSession.sessionId;
      refreshToken = this._jwtService.generateRefreshToken({ ...tokenPayload, sessionId });
      await this._authRepository.updateSessionRefreshToken(sessionId, refreshToken, expiresAt, now);
    } else {
      // Use ID generator service abstraction instead of direct uuid
      sessionId = this._idGeneratorService.generate();
      refreshToken = this._jwtService.generateRefreshToken({ ...tokenPayload, sessionId });
      await this._authRepository.createRefreshSession({
        userId: user.id,
        sessionId,
        refreshToken,
        userAgent: params.userAgent,
        ipAddress: params.ipAddress,
        createdAt: now,
        lastUsedAt: now,
        expiresAt,
      });
    }

    return {
      accessToken,
      refreshToken,
      sessionId,
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        id: user.id,
        profilePicture: user.profilePicture,
        // SECURITY FIX: Never return password in response
        blocked: user.blocked,
      },
      collection,
    };
  }
}

export class RefreshTokenUseCase implements IRefreshTokenUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService
  ) { }

  async execute(params: { refreshToken?: string; userId?: string }): Promise<RefreshTokenResponseDTO> {
    let refreshToken = params.refreshToken;

    // If userId is provided instead of refreshToken, find the latest session
    if (params.userId && !refreshToken) {
      const session = await this._authRepository.findLatestSessionByUserId(params.userId);
      if (!session) {
        throw new InvalidTokenError('No valid refresh session found');
      }
      refreshToken = session.refreshToken;
    }

    if (!refreshToken) {
      throw new InvalidTokenError('No refresh token provided');
    }

    let decoded: { userId: string; email: string; collection: AuthCollection; sessionId: string; type: TokenType };
    try {
      decoded = this._jwtService.verifyToken<{ userId: string; email: string; collection: AuthCollection; sessionId: string; type: TokenType }>(refreshToken, { isRefreshToken: true });
    } catch (err) {
      throw new InvalidTokenError('Invalid or expired refresh token');
    }
    const { userId, email, collection, sessionId } = decoded;
    const session = await this._authRepository.findSessionBySessionIdAndUserId(sessionId, userId);
    if (!session || session.refreshToken !== refreshToken) {
      throw new InvalidTokenError('Session not found or refresh token mismatch');
    }
    const newRefreshToken = this._jwtService.generateRefreshToken({ userId, email, collection, sessionId, type: TokenType.REFRESH });
    // Use SessionService for expiry calculation
    const newExpiresAt = SessionService.calculateExpiryDate();
    const newLastUsedAt = new Date();
    await this._authRepository.updateSessionRefreshToken(sessionId, newRefreshToken, newExpiresAt, newLastUsedAt);
    const tokenPayload = { userId, email, collection, type: TokenType.ACCESS };
    const accessToken = this._jwtService.generateAccessToken(tokenPayload);
    const resultFromRepo = await this._authRepository.refreshToken(userId, collection);
    return {
      accessToken,
      user: {
        firstName: resultFromRepo.user.firstName,
        lastName: resultFromRepo.user.lastName,
        email: resultFromRepo.user.email,
        id: resultFromRepo.user.id || "",
        profilePicture: resultFromRepo.user.profilePicture,
      },
      collection: resultFromRepo.collection,
    };
  }
}

export class LogoutUseCase implements ILogoutUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService
  ) { }

  async execute(params: { sessionId?: string; accessToken?: string }): Promise<LogoutResponseDTO> {
    // If sessionId is provided, delete that specific session
    if (params.sessionId) {
      await this._authRepository.deleteSessionBySessionId(params.sessionId);
      return { message: 'Logged out successfully' };
    }

    // If access token is provided, verify it and delete all sessions for that user
    if (params.accessToken) {
      try {
        const decoded = this._jwtService.verifyToken<{ userId: string }>(params.accessToken);
        await this._authRepository.deleteAllSessionsByUserId(decoded.userId);
      } catch (err) {
        // Token invalid or expired, still return success (logout is idempotent)
      }
    }

    return { message: 'Logged out successfully' };
  }
}

export class LogoutAllUseCase implements ILogoutAllUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService
  ) { }

  async execute(params: { userId?: string; accessToken?: string }): Promise<GenericResponseDTO> {
    let userId = params.userId;

    // If access token is provided, extract userId from it
    if (params.accessToken && !userId) {
      try {
        const decoded = this._jwtService.verifyToken<{ userId: string }>(params.accessToken);
        userId = decoded.userId;
      } catch (err) {
        // Token invalid or expired, still return success (logout is idempotent)
        return { message: 'Logged out from all devices' };
      }
    }

    if (userId) {
      await this._authRepository.deleteAllSessionsByUserId(userId);
    }

    return { message: 'Logged out from all devices' };
  }
}

export class RegisterFacultyUseCase implements IRegisterFacultyUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService
  ) { }

  async execute(params: RegisterFacultyRequestDTO): Promise<RegisterFacultyResponseDTO> {
    // Pass DTO directly to repository (no need for RegisterFacultyRequest entity)
    const resultFromRepo = await this._authRepository.registerFaculty({
      fullName: params.fullName,
      email: params.email,
      phone: params.phone,
      department: params.department,
      qualification: params.qualification,
      experience: params.experience,
      aboutMe: params.aboutMe,
      cvUrl: params.cvUrl,
      certificatesUrl: params.certificatesUrl
    });

    const token = this._jwtService.generateToken(
      { userId: resultFromRepo.user.id, email: resultFromRepo.user.email, collection: resultFromRepo.collection, type: TokenType.ACCESS },
      AUTH_EXPIRIES.ACCESS_TOKEN
    );

    return {
      token,
      user: resultFromRepo.user,
      collection: resultFromRepo.collection,
    };
  }
}

export class SendEmailOtpUseCase implements ISendEmailOtpUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _otpService: IOtpService,
    private _emailService: IEmailService
  ) { }

  async execute(params: SendEmailOtpRequestDTO): Promise<SendEmailOtpResponseDTO> {
    await this._authRepository.sendEmailOtp(params.email);

    const otp = this._otpService.generateOtp();
    this._otpService.storeOtp(params.email, otp);

    await this._emailService.sendPasswordResetOtpEmail({
      to: params.email,
      name: "User",
      otp,
    });

    return { message: AUTH_MESSAGES.OTP_SENT };
  }
}

export class VerifyEmailOtpUseCase implements IVerifyEmailOtpUseCase {
  constructor(
    private _otpService: IOtpService,
    private _jwtService: IJwtService
  ) { }

  async execute(params: VerifyEmailOtpRequestDTO): Promise<VerifyEmailOtpResponseDTO> {
    this._otpService.verifyOtp(params.email, params.otp);

    const resetToken = this._jwtService.generateToken(
      { email: params.email, type: TokenType.PASSWORD_RESET },
      AUTH_EXPIRIES.PASSWORD_RESET_TOKEN
    );

    return { resetToken };
  }
}

export class ResetPasswordUseCase implements IResetPasswordUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService,
    private _passwordService: IPasswordService
  ) { }

  async execute(params: ResetPasswordRequestDTO): Promise<ResetPasswordResponseDTO> {
    let payload: { email: string; type: TokenType };
    payload = this._jwtService.verifyToken<{ email: string; type: TokenType }>(params.resetToken);

    if (payload.type !== TokenType.PASSWORD_RESET) {
      throw new InvalidTokenError("Invalid token type for password reset.");
    }

    // Hash the new password
    const hashedPassword = await this._passwordService.hash(params.newPassword);

    // Update password in repository
    const result = await this._authRepository.resetPassword(payload.email, hashedPassword);

    const token = this._jwtService.generateToken(
      { userId: result.user.id, email: result.user.email, collection: result.collection },
      "1h"
    );

    return {
      token,
      user: {
        id: result.user.id,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        email: result.user.email,
        profilePicture: result.user.profilePicture
      },
      collection: result.collection as AuthCollection,
    };
  }
}

export class ConfirmRegistrationUseCase implements IConfirmRegistrationUseCase {
  constructor(
    private _authRepository: IAuthRepository,
    private _jwtService: IJwtService
  ) { }

  async execute(token: string): Promise<GenericResponseDTO> {
    let payload: { email: string; type: TokenType };
    payload = this._jwtService.verifyToken<{ email: string; type: TokenType }>(token);

    const result = await this._authRepository.confirmRegistration(payload.email);

    return { message: result.message };
  }
}