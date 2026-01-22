
import {
    UserAlreadyExistsError,
    EmailNotFoundError,
    FacultyAlreadyExistsError,
    UserNotFoundError,
    AlreadyConfirmedError
} from "../../../domain/auth/errors/AuthErrors";
import { RefreshSession } from '../../database/mongoose/auth/refreshToken.model';

import { IAuthRepository } from "../../../application/auth/repositories/IAuthRepository";
import { User } from "../../../domain/auth/entities/Auth";
import { RegisterRequestDTO, RegisterFacultyRequestDTO } from "../../../application/auth/dtos/AuthRequestDTOs";

import { Register } from "../../database/mongoose/auth/register.model";
import { Admin } from "../../database/mongoose/auth/admin.model";
import { User as UserModel } from "../../database/mongoose/auth/user.model";
import { Faculty as FacultyModel } from "../../database/mongoose/auth/faculty.model";
import { FacultyRegister } from "../../database/mongoose/auth/facultyRegister.model";
import { Admission } from "../../database/mongoose/admission/AdmissionModel";
import { UserMapper } from "./mappers/UserMapper";
import { FacultyMapper } from "./mappers/FacultyMapper";
import { RefreshSessionData, UserCollection, RegisterFacultyResult } from "../../../application/auth/repositories/types/AuthRepositoryTypes";
import { AuthCollection, AUTH_MESSAGES } from "../../../application/auth/constants/AuthConstants";
import { Document } from "mongoose";


export class AuthRepository implements IAuthRepository {

    private async findUserByEmailAcrossCollections(
        email: string
    ): Promise<{ user: Document; collection: AuthCollection } | null> {
        let user: Document | null;

        user = await Admin.findOne({ email });
        if (user) return { user, collection: AuthCollection.ADMIN };

        user = await UserModel.findOne({ email });
        if (user) return { user, collection: AuthCollection.USER };

        user = await FacultyModel.findOne({ email });
        if (user) return { user, collection: AuthCollection.FACULTY };

        user = await Register.findOne({ email });
        if (user) return { user, collection: AuthCollection.REGISTER };

        return null;
    }

    private async findUserByIdAcrossCollections(
        userId: string,
        collectionType: AuthCollection
    ): Promise<{ user: Document; collection: AuthCollection } | null> {
        let user: Document | null;
        switch (collectionType) {
            case AuthCollection.REGISTER:
                user = await Register.findById(userId);
                break;
            case AuthCollection.ADMIN:
                user = await Admin.findById(userId);
                break;
            case AuthCollection.USER:
                user = await UserModel.findById(userId);
                break;
            case AuthCollection.FACULTY:
                user = await FacultyModel.findById(userId);
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

        await user.save();

        // Use Mapper to return consistent DTO
        return {
            message: AUTH_MESSAGES.REGISTRATION_SUCCESS,
            user: UserMapper.toDTO(user)
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
            user: UserMapper.toDTOWithPassword(user),
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
            user: UserMapper.toDTO(user),
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

        await faculty.save();

        return {
            user: FacultyMapper.toDTO(faculty),
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

        // Use findUserAggregate to return proper entity if needed, but for legacy support:
        // We really should return void or the entity.
        // Given internal usage, sticking to Mapper is safe as long as password is not leaked.
        // UserMapper.toDTO does NOT include password.
        return {
            user: UserMapper.toDTO(user),
            collection,
        };
    }

    /**
     * DOMAIN AGGREGATE METHOD (Phase 3)
     * Returns a full User Aggregate Root (Entity) instead of a DTO
     * This allows us to use domain methods and events
     */
    async findUserAggregateByEmail(email: string): Promise<{ user: User; collection: string } | null> {
        const userResult = await this.findUserByEmailAcrossCollections(email);

        if (!userResult) {
            return null;
        }

        const { user, collection } = userResult;

        // Use Mapper to reconstitute the Entity from the Mongoose Document
        const userEntity = UserMapper.toDomain(user);

        return {
            user: userEntity,
            collection,
        };
    }

    /**
     * DOMAIN AGGREGATE METHOD (Phase 3)
     * Persists changes made to a User Aggregate Root
     */
    async save(user: User, collection: string): Promise<void> {
        let Model;
        switch (collection) {
            case AuthCollection.ADMIN: Model = Admin; break;
            case AuthCollection.USER: Model = UserModel; break;
            case AuthCollection.FACULTY: Model = FacultyModel; break;
            case AuthCollection.REGISTER: Model = Register; break;
            default: throw new Error("Invalid user collection type.");
        }

        const persistenceObject = UserMapper.toPersistence(user);

        // Determine the ID to update
        const id = user.id; // Assuming ID is available on the entity

        if (id) {
            await Model.findByIdAndUpdate(id, persistenceObject);
        } else {
            // New user (should be handled by register, but fine to support)
            await new Model(persistenceObject).save();
        }
    }

    async confirmRegistration(email: string): Promise<{ message: string }> {
        const aggregate = await this.findUserAggregateByEmail(email);

        if (!aggregate) {
            throw new UserNotFoundError("User for confirmation not found.");
        }

        const { user, collection } = aggregate;

        if (!user.isPending()) {
            throw new AlreadyConfirmedError(AUTH_MESSAGES.ALREADY_CONFIRMED);
        }

        user.confirm();

        await this.save(user, collection);

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
}