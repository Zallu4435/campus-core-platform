import {
    ClubSummaryData,
    ClubRequestSummaryData,
    RepositoryClubData,
    ClubSummaryDTO,
    ClubRequestDTO
} from "./ClubBaseDTOs";
import { ClubData } from "../../../domain/clubs/entities/ClubTypes";

// Re-exporting consolidated DTOs for convenience
export { ClubSummaryDTO, ClubRequestDTO };

export interface PaginatedResponseDTO<T> {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    data: T[];
}

export interface GetClubsResponseDTO {
    clubs: ClubSummaryDTO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetClubByIdResponseDTO {
    club: RepositoryClubData;
}

export interface CreateClubResponseDTO {
    club: RepositoryClubData;
}

export interface UpdateClubResponseDTO {
    club: RepositoryClubData;
}

export interface JoinClubResponseDTO {
    message: string;
    club: ClubData;
}

export interface LeaveClubResponseDTO {
    message: string;
    club: ClubData;
}

export interface GetClubRequestsResponseDTO extends PaginatedResponseDTO<ClubRequestDTO> { }

export interface CreateClubRequestResponseDTO {
    message: string;
    request: ClubRequestDTO;
}

export interface ApproveClubRequestResponseDTO {
    message: string;
    request: ClubRequestDTO;
}

export interface RejectClubRequestResponseDTO {
    message: string;
    request: ClubRequestDTO;
}

export interface GetClubRequestDetailsResponseDTO {
    request: ClubRequestDTO;
}
