import { SportRequest } from "../../../../domain/sports/entities/SportRequest";
import { SportRequestDTO } from "../../../../application/sports/dtos/SportBaseDTOs";
import { SportRequestData } from "../../../../domain/sports/entities/SportTypes";

interface PopulatedSport {
    id: string;
    title: string;
    type: string;
}

interface PopulatedUser {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
}

export class SportRequestMapper {
    static toDomain(data: SportRequestData): SportRequest {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        const sportId = typeof data.sportId === 'string'
            ? data.sportId
            : data.sportId.id;

        const userId = typeof data.userId === 'string'
            ? data.userId
            : data.userId.id;

        return new SportRequest({
            id: data.id,
            sportId,
            userId,
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    static toPersistence(domainEntity: SportRequest): Record<string, unknown> {
        const sportId = typeof domainEntity.sportId === 'string'
            ? domainEntity.sportId
            : (domainEntity.sportId as { id: string }).id;

        const userId = typeof domainEntity.userId === 'string'
            ? domainEntity.userId
            : (domainEntity.userId as { id: string }).id;

        return {
            sportId,
            userId,
            status: domainEntity.status,
            whyJoin: domainEntity.whyJoin,
            additionalInfo: domainEntity.additionalInfo,
        };
    }

    static toDTO(data: SportRequestData): SportRequestDTO {
        if (!data) {
            throw new Error("Cannot map null data to DTO");
        }

        const sport = typeof data.sportId !== 'string'
            ? data.sportId as unknown as PopulatedSport
            : { id: data.sportId, title: "", type: "" };

        const user = typeof data.userId !== 'string'
            ? data.userId as unknown as PopulatedUser
            : { id: data.userId, email: "" };

        return {
            id: data.id,
            sportId: sport.id || "",
            sportTitle: sport.title || "",
            userId: user.id || "",
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo || "",
            requestedDate: data.createdAt ? data.createdAt.toISOString() : "",
            type: sport.type || "",
        };
    }

    static toDTOList(dataList: SportRequestData[]): SportRequestDTO[] {
        return dataList.map((data) => this.toDTO(data));
    }
}
