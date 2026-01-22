// ProfileUseCases.ts
import {
    GetProfileRequestDTO,
    UpdateProfileRequestDTO,
    ChangePasswordRequestDTO,
    UpdateProfilePictureRequestDTO,
} from "../dtos/ProfileRequestDTOs";
import {
    ProfileResponseDTO,
    UpdateProfileResponseDTO,
    ChangePasswordResponseDTO,
    UpdateProfilePictureResponseDTO,
    ResponseDTO
} from "../dtos/ProfileResponseDTOs";
import { IProfileRepository } from "../repositories/IProfileRepository";
import { IPasswordService } from "../services/IPasswordService";
import {
    IGetProfileUseCase,
    IUpdateProfileUseCase,
    IChangePasswordUseCase,
    IUpdateProfilePictureUseCase
} from "./IProfileUseCases";
import { ProfileRole } from "../../../domain/profile/entities/ProfileTypes";
import {
    ProfileNotFoundError,
    EmailAlreadyInUseError,
    InvalidPasswordError,
    PasswordMismatchError
} from "../../../domain/profile/errors/ProfileErrors";


export class GetProfileUseCase implements IGetProfileUseCase {
    constructor(private _profileRepository: IProfileRepository) { }

    async execute(params: GetProfileRequestDTO): Promise<ResponseDTO<ProfileResponseDTO>> {
        const user = await this._profileRepository.getProfile(params.userId);
        if (!user) {
            throw new ProfileNotFoundError();
        }

        const isFaculty = user.role === ProfileRole.Faculty;

        return {
            data: {
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                profilePicture: user.profilePicture,
                facultyId: isFaculty ? user.id : undefined,
                studentId: !isFaculty ? user.id : undefined,
                passwordChangedAt: user.passwordChangedAt ? user.passwordChangedAt.toISOString() : undefined,
            },
            success: true
        };
    }
}

export class UpdateProfileUseCase implements IUpdateProfileUseCase {
    constructor(private _profileRepository: IProfileRepository) { }

    async execute(params: UpdateProfileRequestDTO): Promise<ResponseDTO<UpdateProfileResponseDTO>> {
        const user = await this._profileRepository.getProfile(params.userId);
        if (!user) {
            throw new ProfileNotFoundError();
        }

        if (params.email && params.email !== user.email) {
            const existing = await this._profileRepository.findByEmail(params.email);
            if (existing && existing.id !== user.id) {
                throw new EmailAlreadyInUseError(params.email);
            }
        }

        user.updatePersonalDetails(params.firstName, params.lastName, params.phone, params.email);
        const updated = await this._profileRepository.save(user);

        return {
            data: {
                firstName: updated.firstName,
                lastName: updated.lastName,
                phone: updated.phone,
                email: updated.email,
            },
            success: true
        };
    }
}

export class ChangePasswordUseCase implements IChangePasswordUseCase {
    constructor(
        private _profileRepository: IProfileRepository,
        private _passwordService: IPasswordService
    ) { }

    async execute(params: ChangePasswordRequestDTO): Promise<ResponseDTO<ChangePasswordResponseDTO>> {
        if (params.newPassword !== params.confirmPassword) {
            throw new PasswordMismatchError();
        }

        const user = await this._profileRepository.getProfile(params.userId);
        if (!user) {
            throw new ProfileNotFoundError();
        }

        if (!user.password) {
            throw new InvalidPasswordError("Password not set for user");
        }

        // Use password service abstraction
        const isPasswordValid = await this._passwordService.compare(params.currentPassword, user.password);
        if (!isPasswordValid) {
            throw new InvalidPasswordError("Current password is incorrect");
        }

        // Validate password strength
        if (!this._passwordService.validateStrength(params.newPassword)) {
            throw new InvalidPasswordError("Password does not meet security requirements");
        }

        // Use password service for hashing
        const hashedPassword = await this._passwordService.hash(params.newPassword);
        user.changePassword(hashedPassword);
        await this._profileRepository.save(user);

        return { data: { message: "Password updated successfully" }, success: true };
    }
}

export class UpdateProfilePictureUseCase implements IUpdateProfilePictureUseCase {
    constructor(private _profileRepository: IProfileRepository) { }

    async execute(params: UpdateProfilePictureRequestDTO): Promise<ResponseDTO<UpdateProfilePictureResponseDTO>> {
        const user = await this._profileRepository.getProfile(params.userId);
        if (!user) {
            throw new ProfileNotFoundError();
        }

        user.updateProfilePicture(params.filePath);
        const updated = await this._profileRepository.save(user);

        return { data: { profilePicture: updated.profilePicture || "" }, success: true };
    }
}