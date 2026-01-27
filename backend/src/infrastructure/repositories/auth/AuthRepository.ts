
import {
    UserAlreadyExistsError,
    EmailNotFoundError,
    FacultyAlreadyExistsError,
    UserNotFoundError,
    AlreadyConfirmedError
} from "../../../domain/auth/errors/AuthErrors";
import { RefreshSession } from '../../database/mongoose/auth/refreshToken.model';

import { IAuthRepository } from "../../../application/auth/repositories/IAuthRepository";
import { RegisterRequestDTO, RegisterFacultyRequestDTO } from "../../../application/auth/dtos/AuthRequestDTOs";
import { UserDTO, UserDTOWithPassword, FacultyDTO } from "../../../application/auth/dtos/UserDTO";

import { Register } from "../../database/mongoose/auth/register.model";
import { Admin } from "../../database/mongoose/auth/admin.model";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { FacultyUserModel as FacultyModel } from "../../database/mongoose/faculty/faculty.model";
import { FacultyRegisterModel as FacultyRegister } from "../../database/mongoose/faculty/facultyRegister.model";
import { Admission } from "../../database/mongoose/admission/AdmissionModel";
import { RefreshSessionData, UserCollection, RegisterFacultyResult } from "../../../application/auth/repositories/types/AuthRepositoryTypes";
import { AuthCollection, AUTH_MESSAGES } from "../../../application/auth/constants/AuthConstants";
import { IAuthUserSource, IFacultySource, IRegisterSource, IUserSource } from "./infraTypes";


export class AuthRepository implements IAuthRepository {

    private async findUserByEmailAcrossCollections(
        email: string
    ): Promise<{ user: IAuthUserSource; collection: AuthCollection } | null> {
        let user: IAuthUserSource | null;

        user = await Admin.findOne({ email }).lean() as unknown as IAuthUserSource;
        if (user) return { user, collection: AuthCollection.ADMIN };

        user = await UserModel.findOne({ email }).lean() as unknown as IAuthUserSource;
        if (user) return { user, collection: AuthCollection.USER };

        user = await FacultyModel.findOne({ email }).lean() as unknown as IAuthUserSource;
        if (user) return { user, collection: AuthCollection.FACULTY };

        user = await Register.findOne({ email }).lean() as unknown as IAuthUserSource;
        if (user) return { user, collection: AuthCollection.REGISTER };

        return null;
    }

    private async findUserByIdAcrossCollections(
        userId: string,
        collectionType: AuthCollection
    ): Promise<{ user: IAuthUserSource; collection: AuthCollection } | null> {
        let user: IAuthUserSource | null;
        switch (collectionType) {
            case AuthCollection.REGISTER:
                user = await Register.findById(userId).lean() as unknown as IAuthUserSource;
                break;
            case AuthCollection.ADMIN:
                user = await Admin.findById(userId).lean() as unknown as IAuthUserSource;
                break;
            case AuthCollection.USER:
                user = await UserModel.findById(userId).lean() as unknown as IAuthUserSource;
                break;
            case AuthCollection.FACULTY:
                user = await FacultyModel.findById(userId).lean() as unknown as IAuthUserSource;
                break;
            default:
                return null;
        }
        if (user) return { user, collection: collectionType };
        return null;
    }

    async register(params: RegisterRequestDTO) {
        const existingUser = await Register.findOne({ email: params.email });
        if (existingUser) {
            throw new UserAlreadyExistsError(params.email);
        }

        const user = new Register({
            firstName: params.firstName,
            lastName: params.lastName,
            email: params.email,
            password: params.password,
            pending: true,
        });

        const savedUser = await user.save();
        // Convert to source manually or cast
        const source = savedUser.toObject() as unknown as IRegisterSource;

        return {
            message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
            user: this.toUserDTO(source)
        };
    }

    /**
     * Find user by email - pure data access, no business logic
     * Returns null if user not found (instead of throwing error)
     */
    async findUserByEmail(email: string) {
        const userResult = await this.findUserByEmailAcrossCollections(email);

        if (!userResult) {
            return null;
        }

        const { user, collection } = userResult;

        return {
            user: this.toUserDTOWithPassword(user),
            collection,
        };
    }

    /**
     * Check if a user has an admission record
     * Pure data access - returns boolean, no business logic
     */
    async hasAdmission(userId: string): Promise<boolean> {
        const admission = await Admission.findOne({ registerId: userId });
        return !!admission;
    }

    async refreshToken(userId: string, collection: AuthCollection) {
        const userResult = await this.findUserByIdAcrossCollections(
            userId,
            collection
        );

        if (!userResult) {
            throw new UserNotFoundError("User linked to token not found or email mismatch.");
        }

        const { user, collection: userCollection } = userResult;

        return {
            user: this.toUserDTO(user),
            collection: userCollection,
        };
    }

    async registerFaculty(params: RegisterFacultyRequestDTO): Promise<RegisterFacultyResult> {
        const existingFaculty = await FacultyRegister.findOne({ email: params.email });
        if (existingFaculty) {
            throw new FacultyAlreadyExistsError(params.email);
        }

        const faculty = new FacultyRegister({
            fullName: params.fullName,
            email: params.email,
            phone: params.phone,
            department: params.department,
            qualification: params.qualification,
            experience: params.experience,
            aboutMe: params.aboutMe,
            cvUrl: params.cvUrl,
            certificatesUrl: params.certificatesUrl,
        });

        const saved = await faculty.save();
        const source = saved.toObject() as unknown as IFacultySource;

        return {
            user: this.toFacultyDTO(source),
            collection: AuthCollection.FACULTY,
        };
    }

    async sendEmailOtp(email: string) {
        const userResult = await this.findUserByEmailAcrossCollections(email);

        if (!userResult) {
            throw new EmailNotFoundError();
        }
        return { message: "User found for OTP." };
    }

    async resetPassword(email: string, newPassword: string) {
        const userResult = await this.findUserByEmailAcrossCollections(email);

        if (!userResult) {
            throw new UserNotFoundError();
        }

        const { user, collection } = userResult;
        let Model;

        switch (collection) {
            case AuthCollection.ADMIN: Model = Admin; break;
            case AuthCollection.USER: Model = UserModel; break;
            case AuthCollection.FACULTY: Model = FacultyModel; break;
            case AuthCollection.REGISTER: Model = Register; break;
            default: throw new Error("Invalid user collection type.");
        }

        await Model.updateOne({ email: email }, { password: newPassword });

        return {
            user: this.toUserDTO(user),
            collection,
        };
    }

    async confirmRegistration(email: string): Promise<{ message: string }> {
        const userResult = await this.findUserByEmailAcrossCollections(email);

        if (!userResult) {
            throw new UserNotFoundError("User for confirmation not found.");
        }

        const { user, collection } = userResult;

        if (!(user as unknown as IUserSource).pending) {
            throw new AlreadyConfirmedError(AUTH_MESSAGES.ALREADY_CONFIRMED);
        }

        let Model;
        switch (collection) {
            case AuthCollection.ADMIN: Model = Admin; break;
            case AuthCollection.USER: Model = UserModel; break;
            case AuthCollection.FACULTY: Model = FacultyModel; break;
            case AuthCollection.REGISTER: Model = Register; break;
            default: throw new Error("Invalid user collection type.");
        }

        await Model.updateOne({ email: user.email }, { pending: false });

        return { message: AUTH_MESSAGES.EMAIL_CONFIRMED };
    }

    async createRefreshSession(params: RefreshSessionData): Promise<void> {
        await RefreshSession.create(params);
    }

    async findSessionBySessionIdAndUserId(sessionId: string, userId: string): Promise<RefreshSessionData | null> {
        return await RefreshSession.findOne({ sessionId, userId });
    }
    async updateSessionRefreshToken(sessionId: string, newRefreshToken: string, newExpiresAt: Date, newLastUsedAt: Date): Promise<void> {
        await RefreshSession.updateOne(
            { sessionId },
            { $set: { refreshToken: newRefreshToken, expiresAt: newExpiresAt, lastUsedAt: newLastUsedAt } }
        );
    }
    async deleteSessionBySessionId(sessionId: string): Promise<void> {
        await RefreshSession.deleteOne({ sessionId });
    }
    async deleteAllSessionsByUserId(userId: string): Promise<void> {
        await RefreshSession.deleteMany({ userId });
    }

    async findSessionByUserIdAndDevice(userId: string, userAgent: string, ipAddress: string): Promise<RefreshSessionData | null> {
        const session = await RefreshSession.findOne({ userId, userAgent, ipAddress });
        return session;
    }

    async findLatestSessionByUserId(userId: string): Promise<RefreshSessionData | null> {
        return await RefreshSession.findOne({ userId }).sort({ lastUsedAt: -1 });
    }

    async getAllSessions(): Promise<RefreshSessionData[]> {
        return await RefreshSession.find({});
    }

    async findUsersByIds(ids: string[]): Promise<UserDTO[]> {
        const docs = await UserModel.find({ _id: { $in: ids } }).lean() as unknown as IUserSource[];
        return docs.map(doc => this.toUserDTO(doc));
    }

    // Helper methods to convert Mongoose documents to DTOs
    // Accepted generic source
    private toUserDTO(source: IAuthUserSource): UserDTO {
        return {
            id: source._id.toString(),
            firstName: (source as IUserSource).firstName || (source as IFacultySource).fullName?.split(' ')[0] || '',
            lastName: (source as IUserSource).lastName || (source as IFacultySource).fullName?.split(' ').slice(1).join(' ') || '',
            email: source.email,
            profilePicture: (source as IUserSource).profilePicture || undefined,
            blocked: (source as IUserSource).blocked || false,
            pending: (source as IUserSource).pending || false
        };
    }

    private toUserDTOWithPassword(source: IAuthUserSource): UserDTOWithPassword {
        return {
            id: source._id.toString(),
            firstName: (source as IUserSource).firstName || (source as IFacultySource).fullName?.split(' ')[0] || '',
            lastName: (source as IUserSource).lastName || (source as IFacultySource).fullName?.split(' ').slice(1).join(' ') || '',
            email: source.email || '',
            profilePicture: (source as IUserSource).profilePicture || '',
            password: source.password || '',
            blocked: (source as IUserSource).blocked || false,
            pending: (source as IUserSource).pending || false
        };
    }

    private toFacultyDTO(source: IFacultySource): FacultyDTO {
        return {
            id: source._id.toString(),
            fullName: source.fullName || '',
            email: source.email,
            phone: source.phone,
            department: source.department,
            qualification: source.qualification,
            experience: source.experience,
            aboutMe: source.aboutMe,
            cvUrl: source.cvUrl,
            certificatesUrl: source.certificatesUrl as unknown as string[]
        };
    }
}