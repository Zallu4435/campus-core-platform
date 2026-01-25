import { IEmailService } from '../../../application/auth/service/IEmailService';
import { IPasswordService } from '../../../application/auth/service/IPasswordService';
import { IIdGeneratorService } from '../../../application/auth/service/IIdGeneratorService';
import {
    IRegisterUseCase,
    ILoginUseCase,
    IRefreshTokenUseCase,
    ILogoutUseCase,
    IRegisterFacultyUseCase,
    ISendEmailOtpUseCase,
    IVerifyEmailOtpUseCase,
    IResetPasswordUseCase,
    IConfirmRegistrationUseCase
} from '../../../application/auth/useCases/IAuthUseCases';
import {
    LogoutAllUseCase,
    RegisterUseCase,
    LoginUseCase,
    RefreshTokenUseCase,
    LogoutUseCase,
    RegisterFacultyUseCase,
    SendEmailOtpUseCase,
    VerifyEmailOtpUseCase,
    ResetPasswordUseCase,
    ConfirmRegistrationUseCase,
    IAuthConfig
} from '../../../application/auth/useCases/AuthUseCases';
import { AuthRepository } from '../../../infrastructure/repositories/auth/AuthRepository';
import { AuthController } from '../../../presentation/http/auth/AuthController';
import { IAuthController } from '../../../presentation/http/IHttp';

import { IJwtService } from '../../../application/auth/service/IJwtService';
import { JwtService } from '../../services/auth/JwtService';
import { IOtpService } from '../../../application/auth/service/IOtpService';
import { OtpService } from '../../services/auth/OtpService';
import { passwordService } from '../../services/auth/PasswordService';
import { idGeneratorService } from '../../services/auth/IdGeneratorService';
import { emailService } from '../../services/email.service';
import { otpStorage } from "../../services/otpStorage";
import { config } from '../../../config/config';

export function getAuthComposer(): IAuthController {
    const repository: AuthRepository = new AuthRepository();

    const jwtService: IJwtService = new JwtService();
    const otpService: IOtpService = new OtpService(otpStorage);
    const emailsvc: IEmailService = emailService;
    const passwordSvc: IPasswordService = passwordService;
    const idGeneratorSvc: IIdGeneratorService = idGeneratorService;

    // Create auth config from environment config
    const authConfig: IAuthConfig = {
        frontendUrl: config.frontendUrl,
        accessTokenExpiry: '10m',
        refreshTokenExpiry: '30d'
    };

    const registerUseCase: IRegisterUseCase = new RegisterUseCase(
        repository,
        jwtService,
        emailsvc,
        passwordSvc,
        authConfig
    );
    const loginUseCase: ILoginUseCase = new LoginUseCase(
        repository,
        jwtService,
        passwordSvc,
        idGeneratorSvc
    );
    const refreshTokenUseCase: IRefreshTokenUseCase = new RefreshTokenUseCase(repository, jwtService);
    const logoutUseCase: ILogoutUseCase = new LogoutUseCase(repository, jwtService);
    const registerFacultyUseCase: IRegisterFacultyUseCase = new RegisterFacultyUseCase(repository, jwtService);
    const sendEmailOtpUseCase: ISendEmailOtpUseCase = new SendEmailOtpUseCase(repository, otpService, emailsvc);
    const verifyEmailOtpUseCase: IVerifyEmailOtpUseCase = new VerifyEmailOtpUseCase(otpService, jwtService);
    const resetPasswordUseCase: IResetPasswordUseCase = new ResetPasswordUseCase(
        repository,
        jwtService,
        passwordSvc
    );
    const confirmRegistrationUseCase: IConfirmRegistrationUseCase = new ConfirmRegistrationUseCase(repository, jwtService);
    const logoutAllUseCase: LogoutAllUseCase = new LogoutAllUseCase(repository, jwtService);

    return new AuthController(
        registerUseCase,
        loginUseCase,
        refreshTokenUseCase,
        logoutUseCase,
        registerFacultyUseCase,
        sendEmailOtpUseCase,
        verifyEmailOtpUseCase,
        resetPasswordUseCase,
        confirmRegistrationUseCase,
        logoutAllUseCase
    );
}