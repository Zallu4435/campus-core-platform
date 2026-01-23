import { Sport } from "../../../domain/campus-life/entities/CampusLife";
import { SportType, RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";

/**
 * Sport DTOs
 */

export interface GetSportsRequestDTO {
    type?: 'VARSITY SPORTS' | 'INTRAMURAL SPORTS';
    search: string;
    userId?: string;
}

export interface GetSportsResponseDTO {
    sports: Sport[];
    totalItems: number;
}

export interface GetSportByIdRequestDTO {
    sportId: string;
}

export interface GetSportByIdResponseDTO {
    sport: Sport;
}

export interface JoinSportRequestDTO {
    sportId: string;
    studentId: string;
    reason: string;
    additionalInfo?: string;
}

export interface JoinSportResponseDTO {
    requestId: string;
    status: RequestStatus;
    message: string;
}
