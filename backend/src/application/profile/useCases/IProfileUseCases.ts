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

export interface IGetProfileUseCase {
    execute(params: GetProfileRequestDTO): Promise<ResponseDTO<ProfileResponseDTO>>;
}

export interface IUpdateProfileUseCase {
    execute(params: UpdateProfileRequestDTO): Promise<ResponseDTO<UpdateProfileResponseDTO>>;
}

export interface IChangePasswordUseCase {
    execute(params: ChangePasswordRequestDTO): Promise<ResponseDTO<ChangePasswordResponseDTO>>;
}

export interface IUpdateProfilePictureUseCase {
    execute(params: UpdateProfilePictureRequestDTO): Promise<ResponseDTO<UpdateProfilePictureResponseDTO>>;
}
