import { EventDataDTO, EventRequestDataDTO } from "./EventBaseDTOs";

export interface GetEventsRequestDTO {
    page: number;
    limit: number;
    type?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    organizerType?: string;
    dateRange?: string;
}

export interface GetEventByIdRequestDTO {
    id: string;
}

export interface CreateEventRequestDTO extends EventDataDTO { }

export interface UpdateEventRequestDTO extends Partial<EventDataDTO> {
    id: string;
}

export interface DeleteEventRequestDTO {
    id: string;
}

export interface GetEventRequestsRequestDTO {
    page: number;
    limit: number;
    status: string;
    type?: string;
    startDate?: Date;
    endDate?: Date;
    search?: string;
    organizerType?: string;
    dateRange?: string;
}

export interface ApproveEventRequestRequestDTO {
    id: string;
}

export interface RejectEventRequestRequestDTO {
    id: string;
}

export interface GetEventRequestDetailsRequestDTO {
    id: string;
}

export interface JoinEventRequestDTO extends EventRequestDataDTO { }
