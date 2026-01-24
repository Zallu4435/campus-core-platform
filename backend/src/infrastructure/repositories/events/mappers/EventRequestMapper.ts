import { EventRequest } from "../../../../domain/events/entities/EventRequest";
import { EventRequestDTO } from "../../../../application/events/dtos/EventBaseDTOs";
import { EventRequestDoc, EventDoc } from "../../../../domain/events/entities/EventTypes";

interface PopulatedEvent {
    _id: string;
    title: string;
    eventType: string;
    date: string;
}

interface PopulatedUser {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
}

export class EventRequestMapper {
    static toDomain(mongooseDoc: EventRequestDoc): EventRequest {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return new EventRequest({
            id: mongooseDoc._id.toString(),
            eventId: typeof mongooseDoc.eventId === 'string' ? mongooseDoc.eventId : mongooseDoc.eventId._id.toString(),
            userId: typeof mongooseDoc.userId === 'string' ? mongooseDoc.userId : mongooseDoc.userId._id.toString(),
            status: mongooseDoc.status,
            whyJoin: mongooseDoc.whyJoin,
            additionalInfo: mongooseDoc.additionalInfo,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        });
    }

    static toPersistence(domainEntity: EventRequest): Record<string, unknown> {
        const eventId = typeof domainEntity.eventId === 'string'
            ? domainEntity.eventId
            : (domainEntity.eventId as { _id: string })._id;

        const userId = typeof domainEntity.userId === 'string'
            ? domainEntity.userId
            : (domainEntity.userId as { _id: string })._id;

        return {
            eventId,
            userId,
            status: domainEntity.status,
            whyJoin: domainEntity.whyJoin,
            additionalInfo: domainEntity.additionalInfo,
        };
    }

    static toDTO(mongooseDoc: EventRequestDoc): EventRequestDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to DTO");
        }

        const event = typeof mongooseDoc.eventId !== 'string'
            ? mongooseDoc.eventId as unknown as PopulatedEvent
            : { _id: mongooseDoc.eventId, title: "", eventType: "", date: "" };

        const user = typeof mongooseDoc.userId !== 'string'
            ? mongooseDoc.userId as unknown as PopulatedUser
            : { _id: mongooseDoc.userId, firstName: "", lastName: "", email: "" };

        return {
            id: mongooseDoc._id.toString(),
            eventId: event._id.toString(),
            eventName: event.title || "",
            userId: user._id.toString(),
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            status: mongooseDoc.status,
            whyJoin: mongooseDoc.whyJoin,
            additionalInfo: mongooseDoc.additionalInfo || "",
            requestedDate: mongooseDoc.createdAt ? mongooseDoc.createdAt.toISOString() : "",
            proposedDate: event.date ? new Date(event.date).toISOString() : "",
            type: event.eventType || "",
        };
    }

    static toDTOList(mongooseDocs: EventRequestDoc[]): EventRequestDTO[] {
        return mongooseDocs.map((doc) => this.toDTO(doc));
    }
}
