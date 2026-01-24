import { Event } from "../../../../domain/events/entities/Event";
import {
    RepositoryEventData,
    EventSummaryDTO
} from "../../../../application/events/dtos/EventBaseDTOs";
import { EventDoc } from "../../../../domain/events/entities/EventTypes";
import { EVENT_CONSTANTS } from "../../../../application/events/constants/EventsConstants";

export class EventMapper {
    static toDomain(mongooseDoc: EventDoc): Event {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return new Event({
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            organizer: mongooseDoc.organizer,
            organizerType: mongooseDoc.organizerType,
            eventType: mongooseDoc.eventType,
            date: mongooseDoc.date,
            time: mongooseDoc.time,
            location: mongooseDoc.location,
            timeframe: mongooseDoc.timeframe,
            status: mongooseDoc.status,
            icon: mongooseDoc.icon,
            color: mongooseDoc.color,
            description: mongooseDoc.description,
            fullTime: mongooseDoc.fullTime,
            additionalInfo: mongooseDoc.additionalInfo,
            requirements: mongooseDoc.requirements,
            maxParticipants: mongooseDoc.maxParticipants,
            registrationRequired: mongooseDoc.registrationRequired,
            participants: mongooseDoc.participants,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        });
    }

    static toPersistence(domainEntity: Event): Record<string, unknown> {
        return {
            title: domainEntity.title,
            organizer: domainEntity.organizer,
            organizerType: domainEntity.organizerType,
            eventType: domainEntity.eventType,
            date: domainEntity.date,
            time: domainEntity.time,
            location: domainEntity.location,
            timeframe: domainEntity.timeframe,
            status: domainEntity.status,
            icon: domainEntity.icon,
            color: domainEntity.color,
            description: domainEntity.description,
            fullTime: domainEntity.fullTime,
            additionalInfo: domainEntity.additionalInfo,
            requirements: domainEntity.requirements,
            maxParticipants: domainEntity.maxParticipants,
            registrationRequired: domainEntity.registrationRequired,
            participants: domainEntity.participants,
        };
    }

    static toRepositoryDTO(mongooseDoc: EventDoc): RepositoryEventData {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Repository DTO");
        }

        return {
            _id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            organizer: mongooseDoc.organizer,
            organizerType: mongooseDoc.organizerType.toString(),
            eventType: mongooseDoc.eventType.toString(),
            date: mongooseDoc.date,
            time: mongooseDoc.time,
            location: mongooseDoc.location,
            timeframe: mongooseDoc.timeframe.toString(),
            icon: mongooseDoc.icon,
            color: mongooseDoc.color,
            description: mongooseDoc.description,
            fullTime: mongooseDoc.fullTime,
            additionalInfo: mongooseDoc.additionalInfo,
            requirements: mongooseDoc.requirements,
            status: mongooseDoc.status.toString(),
            maxParticipants: mongooseDoc.maxParticipants,
            registrationRequired: mongooseDoc.registrationRequired,
            participants: mongooseDoc.participants,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        };
    }

    static toSummaryDTO(mongooseDoc: EventDoc): EventSummaryDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Summary DTO");
        }

        return {
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            organizerType: mongooseDoc.organizerType,
            eventType: mongooseDoc.eventType,
            location: mongooseDoc.location,
            timeframe: mongooseDoc.timeframe,
            status: mongooseDoc.status,
        };
    }

    static toSummaryDTOList(mongooseDocs: EventDoc[]): EventSummaryDTO[] {
        return mongooseDocs.map((doc) => this.toSummaryDTO(doc));
    }
}
