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

        const club = (typeof data.clubId !== 'string'
            ? data.clubId
            : { id: data.clubId, name: "", type: "", description: "" }) as PopulatedClub;

        const user = (typeof data.userId !== 'string'
            ? data.userId
            : { id: data.userId, email: "", firstName: "", lastName: "" }) as PopulatedUser;

        return {
            id: data.id,
            userId: user.id || "",
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            clubId: club.id || "",
            clubName: club.name || "",
            clubType: club.type || "",
            clubDescription: club.description || club.about || "",
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }

    static toDTOList(dataList: ClubRequestData[]): ClubRequestDTO[] {
        return dataList.map((data) => this.toDTO(data));
    }
}
