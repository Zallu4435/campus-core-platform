import { ClubRequest } from "../../../../domain/clubs/entities/ClubRequest";
import { ClubRequestDTO } from "../../../../application/clubs/dtos/ClubResponseDTOs";
import { ClubRequestData } from "../../../../domain/clubs/entities/ClubTypes";

interface PopulatedClub {
    id: string;
    name: string;
    type: string;
    description?: string;
    about?: string;
}

interface PopulatedUser {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export class ClubRequestMapper {
    static toDomain(data: ClubRequestData): ClubRequest {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        const clubId = typeof data.clubId === 'string'
            ? data.clubId
            : data.clubId.id;

        const userId = typeof data.userId === 'string'
            ? data.userId
            : data.userId.id;

        return ClubRequest.create({
            id: data.id,
            clubId,
            userId,
            status: data.status,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    static toPersistence(domainEntity: ClubRequest): Record<string, unknown> {
        return {
            clubId: domainEntity.clubId,
            userId: domainEntity.userId,
            status: domainEntity.status,
            whyJoin: domainEntity.whyJoin,
            additionalInfo: domainEntity.additionalInfo,
        };
    }

    static toDTO(data: ClubRequestData): ClubRequestDTO {
        if (!data) {
            throw new Error("Cannot map null data to DTO");
        }

        const club = typeof data.clubId !== 'string'
            ? {
                id: data.clubId.id || data.clubId._id?.toString() || "",
                name: data.clubId.name || "",
                type: data.clubId.type || "",
                description: data.clubId.description || data.clubId.about || ""
            } as PopulatedClub
            : { id: data.clubId || "", name: "", type: "", description: "" } as PopulatedClub;

        const user = typeof data.userId !== 'string'
            ? {
                id: data.userId.id || data.userId._id?.toString() || "",
                email: data.userId.email || "",
                firstName: data.userId.firstName || "",
                lastName: data.userId.lastName || ""
            }
            : { id: data.userId || "", email: "", firstName: "", lastName: "" };

        return {
            id: data.id || data._id?.toString() || "",
            _id: data.id || data._id?.toString() || "",
            userId: user.id || "",
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            requestedBy: user.firstName ? `${user.firstName} ${user.lastName}` : user.email || "",
            clubId: club.id || "",
            clubName: club.name || "",
            name: club.name || "",
            clubType: club.type || "",
            type: club.type || "",
            clubDescription: club.description || club.about || "",
            status: data.status,
            createdAt: data.createdAt,
            requestedAt: data.createdAt,
            updatedAt: data.updatedAt,
            requestedId: data.id,
            whyJoin: data.whyJoin,
            additionalInfo: data.additionalInfo,
        };
    }

    static toDTOList(dataList: ClubRequestData[]): ClubRequestDTO[] {
        return dataList.map((data) => this.toDTO(data));
    }
}
