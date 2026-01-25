import { Club } from '../../../../domain/campus-life/entities/CampusLife';
import { ClubData, JoinRequestData } from '../../../../domain/campus-life/entities/CampusLifeTypes';
import { ClubStatus, RequestStatus } from '../../../../domain/campus-life/enums/CampusLifeEnums';

/**
 * Club Mapper
 * Handles transformation between persistence (Data), domain (Club), and DTO layers
 */
export class ClubMapper {
    /**
     * Convert raw database club to domain entity
     * @param raw - Raw club from database
     * @param userRequestStatus - Optional user request status to attach
     * @returns Domain Club entity
     */
    static toDomain(raw: ClubData, userRequestStatus?: RequestStatus | null): Club {
        return new Club(
            raw.id,
            raw.name,
            raw.type,
            Array.isArray(raw.members) ? raw.members.length : 0, // Convert array to count
            raw.icon,
            raw.color,
            raw.status as ClubStatus,
            '', // role - ClubData doesn't have this field
            raw.nextMeeting,
            raw.about,
            raw.upcomingEvents || [],
            raw.createdAt.toISOString(),
            raw.updatedAt.toISOString(),
            userRequestStatus ?? null
        );
    }

    /**
     * Convert array of raw clubs to domain entities with user request status
     * @param raws - Array of raw clubs
     * @param requests - Array of join requests for the user
     * @param userId - User ID to check request status
     * @returns Array of domain Club entities
     */
    static toDomainList(
        raws: ClubData[],
        requests: JoinRequestData[],
        userId?: string
    ): Club[] {
        return raws.map(raw => {
            let userRequestStatus: RequestStatus | null = null;

            if (userId && requests.length > 0) {
                const userRequest = requests.find(
                    req => req.clubId === raw.id && req.userId === userId
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
     * @param domain - Domain Club entity
     * @returns Partial raw club for database
     */
    static toPersistence(domain: Club): Partial<ClubData> {
        return {
            name: domain.name,
            type: domain.type,
            icon: domain.icon,
            color: domain.color,
            status: domain.status,
            nextMeeting: domain.nextMeeting,
            about: domain.about,
            upcomingEvents: domain.upcomingEvents,
        };
    }

    /**
     * Convert domain entity to DTO
     * @param domain - Domain Club entity
     * @returns Club DTO
     */
    static toDTO(domain: Club): Club {
        // In this case, the domain entity structure matches the DTO
        return domain;
    }
}
