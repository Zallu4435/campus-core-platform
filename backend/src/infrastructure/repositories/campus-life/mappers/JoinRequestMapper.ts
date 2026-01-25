import { JoinRequest } from '../../../../domain/campus-life/entities/CampusLife';
import { JoinRequestData } from '../../../../domain/campus-life/entities/CampusLifeTypes';
import { RequestStatus } from '../../../../domain/campus-life/enums/CampusLifeEnums';

/**
 * Join Request Mapper
 * Handles transformation between persistence (Data) and domain (JoinRequest) layers
 */
export class JoinRequestMapper {
    /**
     * Convert raw database join request to domain entity
     * @param raw - Raw join request from database
     * @returns Domain JoinRequest entity
     */
    static toDomain(raw: JoinRequestData): JoinRequest {
        return new JoinRequest(
            raw.id,
            raw.userId,
            raw.status as RequestStatus,
            raw.whyJoin,
            raw.additionalInfo,
            raw.createdAt.toISOString(),
            raw.updatedAt.toISOString()
        );
    }

    /**
     * Convert array of raw join requests to domain entities
     * @param raws - Array of raw join requests
     * @returns Array of domain JoinRequest entities
     */
    static toDomainList(raws: JoinRequestData[]): JoinRequest[] {
        return raws.map(raw => this.toDomain(raw));
    }

    /**
     * Convert domain entity to persistence format
     * @param domain - Domain JoinRequest entity
     * @returns Partial raw join request for database
     */
    static toPersistence(domain: JoinRequest): Partial<JoinRequestData> {
        return {
            userId: domain.userId,
            status: domain.status,
            whyJoin: domain.whyJoin,
            additionalInfo: domain.additionalInfo,
        };
    }

    /**
     * Convert domain entity to DTO
     * @param domain - Domain JoinRequest entity
     * @returns JoinRequest DTO
     */
    static toDTO(domain: JoinRequest): JoinRequest {
        // In this case, the domain entity structure matches the DTO
        return domain;
    }
}
