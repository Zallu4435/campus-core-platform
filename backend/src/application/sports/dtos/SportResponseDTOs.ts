import { SportSummaryDTO, SportRequestDTO, RepositorySportData } from "./SportBaseDTOs";

export interface GetSportsResponseDTO {
    data: SportSummaryDTO[];
    sports: SportSummaryDTO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetSportByIdResponseDTO {
    sport: RepositorySportData;
}

export interface CreateSportResponseDTO {
    sport: RepositorySportData;
}

export interface UpdateSportResponseDTO {
    sport: RepositorySportData;
}

export interface GetSportRequestsResponseDTO {
    data: SportRequestDTO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetSportRequestDetailsResponseDTO {
    sportRequest: SportRequestDTO;
}

export interface ApproveSportRequestResponseDTO {
    message: string;
}

export interface RejectSportRequestResponseDTO {
    message: string;
}

// Compatibility DTOs for CampusLife
export interface JoinSportResponseDTO {
    requestId: string;
    status: string;
    message: string;
}
