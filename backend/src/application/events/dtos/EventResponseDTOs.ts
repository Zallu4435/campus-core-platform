import { EventSummaryDTO, EventRequestDTO, RepositoryEventData } from "./EventBaseDTOs";

export interface PaginatedResponseDTO<T> {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    data: T[];
}

export interface GetEventsResponseDTO {
    events: EventSummaryDTO[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
}

export interface GetEventByIdResponseDTO {
    event: RepositoryEventData;
}

export interface CreateEventResponseDTO {
    event: RepositoryEventData;
}

export interface UpdateEventResponseDTO {
    event: RepositoryEventData;
}

export interface GetEventRequestsResponseDTO extends PaginatedResponseDTO<EventRequestDTO> { }

export interface GetEventRequestDetailsResponseDTO {
    eventRequest: EventRequestDTO;
}

export interface ApproveEventRequestResponseDTO {
    message: string;
}

export interface RejectEventRequestResponseDTO {
    message: string;
}
