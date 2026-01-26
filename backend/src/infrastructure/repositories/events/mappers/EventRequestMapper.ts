import { EventRequest } from "../../../../domain/events/entities/EventRequest";
import { EventRequestDTO } from "../../../../application/events/dtos/EventBaseDTOs";
import { EventRequestData } from "../../../../domain/events/entities/EventTypes";

interface PopulatedEvent {
    id?: string;
    _id?: string;
    title: string;
    description: string;
    eventType: string;
    date: string;
    location: string;
    participants: number;
}

interface PopulatedUser {
    id?: string;
    _id?: string;
    firstName: string;
    lastName: string;
    email: string;
}

export class EventRequestMapper {
    static toDomain(data: EventRequestData): EventRequest {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        return new EventRequest({
            id: data.id,
            eventId: typeof data.eventId === 'string' ? data.eventId : data.eventId.id,
            userId: typeof data.userId === 'string' ? data.userId : data.userId.id,
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    static toPersistence(domainEntity: EventRequest): Record<string, unknown> {
        const eventId = typeof domainEntity.eventId === 'string'
            ? domainEntity.eventId
            : (domainEntity.eventId as { id: string }).id;

        const userId = typeof domainEntity.userId === 'string'
            ? domainEntity.userId
            : (domainEntity.userId as { id: string }).id;

        return {
            eventId,
            userId,
            status: domainEntity.status,
            whyJoin: domainEntity.whyJoin,
            additionalInfo: domainEntity.additionalInfo,
        };
    }

    static toDTO(data: EventRequestData): EventRequestDTO {
        if (!data) {
            throw new Error("Cannot map null data to DTO");
        }

        const event = (data.eventId && typeof data.eventId !== 'string')
            ? data.eventId as unknown as PopulatedEvent
            : { id: (data.eventId as string) || "", title: "", description: "", eventType: "", date: "", location: "", participants: 0 };

        const user = (data.userId && typeof data.userId !== 'string')
            ? data.userId as unknown as PopulatedUser
            : { id: (data.userId as string) || "", firstName: "", lastName: "", email: "" };

        return {
            id: data.id,
            eventId: event.id || (event._id ? event._id.toString() : "") || "",
            eventName: event.title || "",
            userId: user.id || (user._id ? user._id.toString() : "") || "",
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo || "",
            requestedDate: data.createdAt ? data.createdAt.toISOString() : "",
            proposedDate: event.date ? new Date(event.date).toISOString() : "",
            proposedVenue: event.location || "",
            type: event.eventType || "",
            description: event.description || "",
            expectedParticipants: event.participants || 0,
        };
    }

    static toDTOList(dataList: EventRequestData[]): EventRequestDTO[] {
        return dataList.map((data) => this.toDTO(data));
    }
}
