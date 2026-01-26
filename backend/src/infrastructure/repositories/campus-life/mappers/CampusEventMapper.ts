import { CampusEvent } from '../../../../domain/campus-life/entities/CampusLife';
import { CampusEventData, JoinRequestData } from '../../../../domain/campus-life/entities/CampusLifeTypes';
import { RequestStatus } from '../../../../domain/campus-life/enums/CampusLifeEnums';
import { safelyConvertIdToString } from '../../../../shared/utils/IdUtils';

/**
 * Campus Event Mapper
 * Handles transformation between persistence (Data), domain (CampusEvent), and DTO layers
 */
export class CampusEventMapper {
    /**
     * Convert raw database event to domain entity
     * @param raw - Raw event from database
     * @param userRequestStatus - Optional user request status to attach
     * @returns Domain CampusEvent entity
     */
    static toDomain(raw: CampusEventData, userRequestStatus?: RequestStatus | null): CampusEvent {
        return new CampusEvent(
            raw.id,
            raw.title,
            raw.date,
            raw.time,
            raw.location,
            raw.organizer,
            raw.timeframe,
            raw.icon,
            raw.color,
            raw.description,
            raw.fullTime ? 'Yes' : 'No',
            raw.additionalInfo,
            raw.requirements,
            raw.status || '',
            raw.maxParticipants || 0,
            raw.registrationRequired ?? false,
            raw.participants || 0,
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
        raws: CampusEventData[],
        requests: JoinRequestData[],
        userId?: string
    ): CampusEvent[] {
        return raws.map(raw => {
            let userRequestStatus: RequestStatus | null = null;

            if (userId && requests.length > 0) {
                const userRequest = requests.find(req => {
                    const reqEventId = safelyConvertIdToString(req.eventId);
                    const reqUserId = safelyConvertIdToString(req.userId);

                    return reqEventId === raw.id && reqUserId === userId;
                });

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
    static toPersistence(domain: CampusEvent): Partial<CampusEventData> {
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
