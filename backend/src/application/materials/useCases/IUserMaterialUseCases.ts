
import {
    GetUserMaterialsRequestDTO,
    GetUserMaterialByIdRequestDTO,
    ToggleBookmarkRequestDTO,
    ToggleLikeRequestDTO,
    DownloadMaterialRequestDTO,
} from '../dtos/UserMaterialRequestDTOs';
import { GetUserMaterialsResponseDTO, GetUserMaterialByIdResponseDTO } from '../dtos/UserMaterialResponseDTOs';


export interface IGetUserMaterialsUseCase {
    execute(params: GetUserMaterialsRequestDTO): Promise<GetUserMaterialsResponseDTO>;
}

export interface IGetUserMaterialByIdUseCase {
    execute(params: GetUserMaterialByIdRequestDTO): Promise<GetUserMaterialByIdResponseDTO>;
}

export interface IToggleBookmarkUseCase {
    execute(params: ToggleBookmarkRequestDTO): Promise<void>;
}

export interface IToggleLikeUseCase {
    execute(params: ToggleLikeRequestDTO): Promise<void>;
}

export interface IDownloadMaterialUseCase {
    execute(params: DownloadMaterialRequestDTO): Promise<string>;
}