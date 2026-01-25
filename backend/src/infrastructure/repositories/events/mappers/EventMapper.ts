import { Event } from "../../../../domain/events/entities/Event";
import {
    RepositoryEventData,
    EventSummaryDTO
} from "../../../../application/events/dtos/EventBaseDTOs";
import { EventData } from "../../../../domain/events/entities/EventTypes";
import { EVENT_CONSTANTS } from "../../../../application/events/constants/EventsConstants";

export class EventMapper {
    static toDomain(data: EventData): Event {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        return new Event({
            id: data.id,
            title: data.title,
            organizer: data.organizer,
            organizerType: data.organizerType,
            eventType: data.eventType,
            date: data.date,
            time: data.time,
            location: data.location,
            timeframe: data.timeframe,
            status: data.status,
            icon: data.icon,
            color: data.color,
            description: data.description,
            fullTime: data.fullTime,
            additionalInfo: data.additionalInfo,
            requirements: data.requirements,
            maxParticipants: data.maxParticipants,
            registrationRequired: data.registrationRequired,
            participants: data.participants,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
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

    static toRepositoryDTO(data: EventData): RepositoryEventData {
        if (!data) {
            throw new Error("Cannot map null data to Repository DTO");
        }

        return {
            id: data.id,
            title: data.title,
            organizer: data.organizer,
            organizerType: data.organizerType.toString(),
            eventType: data.eventType.toString(),
            date: data.date,
            time: data.time,
            location: data.location,
            timeframe: data.timeframe.toString(),
            icon: data.icon,
            color: data.color,
            description: data.description,
            fullTime: data.fullTime,
            additionalInfo: data.additionalInfo,
            requirements: data.requirements,
            status: data.status.toString(),
            maxParticipants: data.maxParticipants,
            registrationRequired: data.registrationRequired,
            participants: data.participants,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }

    static toSummaryDTO(data: EventData): EventSummaryDTO {
        if (!data) {
            throw new Error("Cannot map null data to Summary DTO");
        }

        return {
            id: data.id,
            title: data.title,
            organizerType: data.organizerType,
            eventType: data.eventType,
            location: data.location,
            timeframe: data.timeframe,
            status: data.status,
        };
    }

    static toSummaryDTOList(dataList: EventData[]): EventSummaryDTO[] {
        return dataList.map((data) => this.toSummaryDTO(data));
    }
}
