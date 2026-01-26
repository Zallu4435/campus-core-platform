import { OrganizerType, EventType, Timeframe, EventStatus, EventProps } from "../../../domain/events/entities/EventTypes";

export interface EventDataDTO extends Omit<EventProps, 'id' | 'createdAt' | 'updatedAt'> {
    status?: EventStatus;
}

export interface EventRequestDataDTO {
    eventId: string;
    userId: string;
    whyJoin: string;
    additionalInfo?: string;
}

export interface RepositoryEventData {
    id: string;
    title: string;
    organizer: string;
    organizerType: string;
    eventType: string;
    date: string;
    time: string;
    location: string;
    timeframe: string;
    icon: string;
    color: string;
    description: string;
    fullTime: boolean;
    additionalInfo: string;
    requirements: string;
    status: string;
    maxParticipants: number;
    registrationRequired: boolean;
    participants: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface EventSummaryDTO {
    id: string;
    title: string;
    organizerType: OrganizerType;
    eventType: EventType;
    location: string;
    timeframe: Timeframe;
    status: EventStatus;
}

export interface EventRequestDTO {
    id: string;
    eventId: string;
    eventName: string;
    description: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: string;
    whyJoin: string;
    additionalInfo: string;
    requestedDate: string;
    proposedDate: string;
    proposedVenue: string;
    type: string;
    expectedParticipants: number;
}
