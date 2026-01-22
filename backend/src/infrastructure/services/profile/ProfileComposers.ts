// ProfileComposers.ts
import { IProfileRepository } from '../../../application/profile/repositories/IProfileRepository';
import { IPasswordService } from '../../../application/profile/services/IPasswordService';
import {
    GetProfileUseCase,
    UpdateProfileUseCase,
    ChangePasswordUseCase,
    UpdateProfilePictureUseCase
} from '../../../application/profile/useCases/ProfileUseCases';
import {
    IGetProfileUseCase,
    IUpdateProfileUseCase,
    IChangePasswordUseCase,
    IUpdateProfilePictureUseCase,
} from '../../../application/profile/useCases/IProfileUseCases';
import { ProfileRepository } from '../../repositories/profile/ProfileRepository';
import { ProfileMapper } from '../../repositories/profile/ProfileMapper';
import { PasswordService } from '../profile/PasswordService';
import { ProfileController } from '../../../presentation/http/profile/ProfileController';
import { IProfileController } from '../../../presentation/http/IHttp';

export function getProfileComposer(): IProfileController {
    // Infrastructure dependencies
    const mapper = new ProfileMapper();
    const repository: IProfileRepository = new ProfileRepository(mapper);
    const passwordService: IPasswordService = new PasswordService();

    // Use Cases
    const getProfileUseCase: IGetProfileUseCase = new GetProfileUseCase(repository);
    const updateProfileUseCase: IUpdateProfileUseCase = new UpdateProfileUseCase(repository);
    const changePasswordUseCase: IChangePasswordUseCase = new ChangePasswordUseCase(repository, passwordService);
    const updateProfilePictureUseCase: IUpdateProfilePictureUseCase = new UpdateProfilePictureUseCase(repository);

    // Controller
    return new ProfileController(
        getProfileUseCase,
        updateProfileUseCase,
        changePasswordUseCase,
        updateProfilePictureUseCase
    );
}