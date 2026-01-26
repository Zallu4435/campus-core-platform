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

export interface PaginatedResponseDTO {
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetClubsResponseDTO extends PaginatedResponseDTO {
    clubs: ClubSummaryDTO[];
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

export interface GetClubRequestsResponseDTO extends PaginatedResponseDTO {
    clubRequests: ClubRequestDTO[];
}

export interface CreateClubRequestResponseDTO {
    message: string;
    clubRequest: ClubRequestDTO;
}

export interface ApproveClubRequestResponseDTO {
    message: string;
    clubRequest: ClubRequestDTO;
}

export interface RejectClubRequestResponseDTO {
    message: string;
    clubRequest: ClubRequestDTO;
}

export interface GetClubRequestDetailsResponseDTO {
    clubRequest: ClubRequestDTO;
}
