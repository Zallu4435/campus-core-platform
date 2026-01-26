import { SportRequest } from "../../../../domain/sports/entities/SportRequest";
import { SportRequestDTO } from "../../../../application/sports/dtos/SportBaseDTOs";
import { SportRequestData } from "../../../../domain/sports/entities/SportTypes";

interface PopulatedSport {
    _id?: string;
    id?: string;
    title: string;
    type: string;
    headCoach?: string;
    participants?: number;
    division?: string;
}

interface PopulatedUser {
    _id?: string;
    id?: string;
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
            : (data.sportId.id || data.sportId._id?.toString() || "");

        const userId = typeof data.userId === 'string'
            ? data.userId
            : (data.userId.id || data.userId._id?.toString() || "");

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
            ? {
                id: data.sportId.id || data.sportId._id?.toString() || "",
                title: data.sportId.title || "",
                type: data.sportId.type || "",
                headCoach: data.sportId.headCoach,
                participants: data.sportId.participants,
                division: data.sportId.division
            } as PopulatedSport
            : { id: data.sportId || "", title: "", type: "" } as PopulatedSport;

        const user = typeof data.userId !== 'string'
            ? {
                id: data.userId.id || data.userId._id?.toString() || "",
                email: data.userId.email || "",
                firstName: data.userId.firstName,
                lastName: data.userId.lastName
            } as PopulatedUser
            : { id: data.userId || "", email: "" } as PopulatedUser;

        return {
            id: data.id,
            sportId: sport.id || sport._id || "",
            sportTitle: sport.title || "",
            userId: user.id || user._id || "",
            userName: user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.email || ""),
            userEmail: user.email || "",
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo || "",
            requestedDate: data.createdAt ? data.createdAt.toISOString() : "",
            updatedAt: data.updatedAt ? data.updatedAt.toISOString() : "",
            type: sport.type || "",
            headCoach: sport.headCoach || "",
            playerCount: sport.participants || 0,
            division: sport.division || "",
        };
    }

    static toDTOList(dataList: SportRequestData[]): SportRequestDTO[] {
        return dataList.map((data) => this.toDTO(data));
    }
}
