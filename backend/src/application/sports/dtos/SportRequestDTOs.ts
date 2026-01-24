import { SportDataDTO, SportRequestDataDTO } from "./SportBaseDTOs";

export interface GetSportsRequestDTO {
    page: number;
    limit: number;
    sportType?: string;
    status?: string;
    coach?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string; // Added for campus-life
}

export interface GetSportByIdRequestDTO {
    id: string;
    sportId?: string; // Alias for campus-life compatibility
}

export interface CreateSportRequestDTO extends SportDataDTO { }

export interface UpdateSportRequestDTO extends Partial<SportDataDTO> {
    id: string;
}

export interface DeleteSportRequestDTO {
    id: string;
}

export interface GetSportRequestsRequestDTO {
    page: number;
    limit: number;
    status: string;
    type: string;
    startDate: string;
    endDate: string;
    search: string;
}

export interface ApproveSportRequestRequestDTO {
    id: string;
}

export interface RejectSportRequestRequestDTO {
    id: string;
}

export interface GetSportRequestDetailsRequestDTO {
    id: string;
}

export interface JoinSportRequestDTO extends SportRequestDataDTO {
    studentId?: string; // Alias for campus-life Compatibility
    reason?: string; // Alias for campus-life Compatibility
}
