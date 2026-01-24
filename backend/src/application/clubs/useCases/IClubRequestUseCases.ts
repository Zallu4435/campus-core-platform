import {
    GetClubRequestsRequestDTO,
    ApproveClubRequestRequestDTO,
    RejectClubRequestRequestDTO,
    GetClubRequestDetailsRequestDTO,
} from "../dtos/ClubRequestDTOs";
import {
    GetClubRequestsResponseDTO,
    GetClubRequestDetailsResponseDTO,
} from "../dtos/ClubResponseDTOs";

export interface IGetClubRequestsUseCase {
    execute(params: GetClubRequestsRequestDTO): Promise<GetClubRequestsResponseDTO>;
}

export interface IApproveClubRequestUseCase {
    execute(params: ApproveClubRequestRequestDTO): Promise<{ message: string }>;
}

export interface IRejectClubRequestUseCase {
    execute(params: RejectClubRequestRequestDTO): Promise<{ message: string }>;
}

export interface IGetClubRequestDetailsUseCase {
    execute(params: GetClubRequestDetailsRequestDTO): Promise<GetClubRequestDetailsResponseDTO>;
}