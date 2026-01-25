import { Club } from "../../../domain/campus-life/entities/CampusLife";
import { RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";

/**
 * Club DTOs
 */

export interface GetClubsRequestDTO {
    search: string;
    type?: string;
    status: 'active' | 'inactive' | 'all';
    userId?: string;
}

export interface GetClubsResponseDTO {
    clubs: Club[];
    totalItems: number;
}

export interface GetClubByIdRequestDTO {
    clubId: string;
}

export interface GetClubByIdResponseDTO {
    club: Club;
}

export interface JoinClubRequestDTO {
    clubId: string;
    studentId: string;
    reason: string;
    additionalInfo?: string;
}

export interface JoinClubResponseDTO {
    requestId: string;
    status: RequestStatus;
    message: string;
}
