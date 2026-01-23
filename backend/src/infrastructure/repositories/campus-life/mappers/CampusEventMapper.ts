import { CampusEvent } from '../../../../domain/campus-life/entities/CampusLife';
import { RawCampusEvent, RawJoinRequest } from '../../../../domain/campus-life/entities/CampusLifeTypes';
import { RequestStatus } from '../../../../domain/campus-life/enums/CampusLifeEnums';

/**
 * Campus Event Mapper
 * Handles transformation between persistence (Raw), domain (CampusEvent), and DTO layers
 */
export class CampusEventMapper {
    /**
     * Convert raw database event to domain entity
     * @param raw - Raw event from database
     * @param userRequestStatus - Optional user request status to attach
     * @returns Domain CampusEvent entity
     */
    static toDomain(raw: RawCampusEvent, userRequestStatus?: RequestStatus | null): CampusEvent {
        return new CampusEvent(
            raw._id,
            raw.title,
            raw.date,
            raw.time,
            raw.location,
            raw.organizer,
            raw.timeframe,
            raw.icon,
            raw.color,
            raw.description,
            raw.fullTime ? 'Yes' : 'No', // Convert boolean to string
            raw.additionalInfo,
            raw.requirements,
            raw.createdAt.toISOString(),
            raw.updatedAt.toISOString(),
            userRequestStatus ?? null
        );
    }

    /**
     * Convert array of raw events to domain entities with user request status
     * @param raws - Array of raw events
     * @param requests - Array of join requests for the user
     * @param userId - User ID to check request status
     * @returns Array of domain CampusEvent entities
     */
    static toDomainList(
        raws: RawCampusEvent[],
        requests: RawJoinRequest[],
        userId?: string
    ): CampusEvent[] {
        return raws.map(raw => {
            let userRequestStatus: RequestStatus | null = null;

            if (userId && requests.length > 0) {
                const userRequest = requests.find(
                    req => req.eventId === raw._id && req.userId === userId
                );
                if (userRequest) {
                    userRequestStatus = userRequest.status as RequestStatus;
                }
            }

            return this.toDomain(raw, userRequestStatus);
        });
    }

    /**
     * Convert domain entity to persistence format
     * @param domain - Domain CampusEvent entity
     * @returns Partial raw event for database
     */
    static toPersistence(domain: CampusEvent): Partial<RawCampusEvent> {
        return {
            title: domain.title,
            date: domain.date,
            time: domain.time,
            location: domain.location,
            organizer: domain.organizer,
            timeframe: domain.timeframe,
            icon: domain.icon,
            color: domain.color,
            description: domain.description,
            fullTime: domain.fullTime === 'Yes', // Convert string back to boolean
            additionalInfo: domain.additionalInfo,
            requirements: domain.requirements,
        };
    }

    /**
     * Convert domain entity to DTO
     * @param domain - Domain CampusEvent entity
     * @returns Event DTO
     */
    static toDTO(domain: CampusEvent): CampusEvent {
        // In this case, the domain entity structure matches the DTO
        // If they differ, create a separate DTO transformation here
        return domain;
    }
}
