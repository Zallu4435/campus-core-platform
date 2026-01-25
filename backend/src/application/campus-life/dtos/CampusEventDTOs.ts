import { CampusEvent } from "../../../domain/campus-life/entities/CampusLife";
import { RequestStatus } from "../../../domain/campus-life/enums/CampusLifeEnums";

/**
 * Campus Event DTOs
 */

export interface GetEventsRequestDTO {
    page: number;
    limit: number;
    search: string;
    status: 'upcoming' | 'past' | 'all';
    userId?: string;
}

export interface GetEventsResponseDTO {
    events: CampusEvent[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetEventByIdRequestDTO {
    eventId: string;
}

export interface GetEventByIdResponseDTO {
    event: CampusEvent;
}

export interface JoinEventRequestDTO {
    eventId: string;
    studentId: string;
    reason: string;
    additionalInfo?: string;
}

export interface JoinEventResponseDTO {
    requestId: string;
    status: RequestStatus;
    message: string;
}
