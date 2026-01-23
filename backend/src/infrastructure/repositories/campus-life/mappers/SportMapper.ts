import { Sport } from '../../../../domain/campus-life/entities/CampusLife';
import { RawSport, RawJoinRequest } from '../../../../domain/campus-life/entities/CampusLifeTypes';
import { SportType, RequestStatus } from '../../../../domain/campus-life/enums/CampusLifeEnums';

/**
 * Sport Mapper
 * Handles transformation between persistence (Raw), domain (Sport), and DTO layers
 */
export class SportMapper {
    /**
     * Convert raw database sport to domain entity
     * @param raw - Raw sport from database
     * @param userRequestStatus - Optional user request status to attach
     * @returns Domain Sport entity
     */
    static toDomain(raw: RawSport, userRequestStatus?: RequestStatus | null): Sport {
        // Note: RawSport has different fields than Sport entity expects
        // We need to map the available fields appropriately
        return new Sport(
            raw._id,
            raw.title,
            raw.type as SportType,
            [], // teams - RawSport doesn't have this, using empty array
            raw.icon,
            raw.color,
            raw.division,
            raw.headCoach,
            [], // homeGames - RawSport doesn't have this field
            '', // record - RawSport doesn't have this field
            [], // upcomingGames - RawSport doesn't have this field
            raw.createdAt.toISOString(),
            raw.updatedAt.toISOString(),
            userRequestStatus ?? null
        );
    }

    /**
     * Convert array of raw sports to domain entities with user request status
     * @param raws - Array of raw sports
     * @param requests - Array of join requests for the user
     * @param userId - User ID to check request status
     * @returns Array of domain Sport entities
     */
    static toDomainList(
        raws: RawSport[],
        requests: RawJoinRequest[],
        userId?: string
    ): Sport[] {
        return raws.map(raw => {
            let userRequestStatus: RequestStatus | null = null;

            if (userId && requests.length > 0) {
                const userRequest = requests.find(
                    req => req.sportId === raw._id && req.userId === userId
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
     * @param domain - Domain Sport entity
     * @returns Partial raw sport for database
     */
    static toPersistence(domain: Sport): Partial<RawSport> {
        return {
            title: domain.title,
            type: domain.type,
            headCoach: domain.headCoach,
            division: domain.division,
            icon: domain.icon,
            color: domain.color,
        };
    }

    /**
     * Convert domain entity to DTO
     * @param domain - Domain Sport entity
     * @returns Sport DTO
     */
    static toDTO(domain: Sport): Sport {
        // In this case, the domain entity structure matches the DTO
        return domain;
    }
}
