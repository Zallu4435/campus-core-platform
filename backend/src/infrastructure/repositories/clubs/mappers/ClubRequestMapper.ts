import { ClubRequest } from "../../../../domain/clubs/entities/ClubRequest";
import { ClubRequestDTO } from "../../../../application/clubs/dtos/ClubResponseDTOs";
import { ClubRequest as ClubRequestDoc } from "../../../../domain/clubs/entities/ClubTypes";

interface PopulatedClub {
    _id: string;
    name: string;
    type: string;
    description?: string;
    about?: string;
}

interface PopulatedUser {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
}

export class ClubRequestMapper {
    static toDomain(mongooseDoc: ClubRequestDoc): ClubRequest {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        const clubId = typeof mongooseDoc.clubId === 'string'
            ? mongooseDoc.clubId
            : mongooseDoc.clubId._id.toString();

        const userId = typeof mongooseDoc.userId === 'string'
            ? mongooseDoc.userId
            : mongooseDoc.userId._id.toString();

        return ClubRequest.create({
            id: mongooseDoc._id.toString(),
            clubId,
            userId,
            status: mongooseDoc.status,
            whyJoin: mongooseDoc.whyJoin,
            additionalInfo: mongooseDoc.additionalInfo,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
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

    static toDTO(mongooseDoc: ClubRequestDoc): ClubRequestDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to DTO");
        }

        const club = (typeof mongooseDoc.clubId !== 'string'
            ? mongooseDoc.clubId
            : { _id: mongooseDoc.clubId, name: "", type: "", description: "" }) as PopulatedClub;

        const user = (typeof mongooseDoc.userId !== 'string'
            ? mongooseDoc.userId
            : { _id: mongooseDoc.userId, email: "", firstName: "", lastName: "" }) as PopulatedUser;

        return {
            id: mongooseDoc._id.toString(),
            userId: user._id.toString(),
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            clubId: club._id.toString(),
            clubName: club.name || "",
            clubType: club.type || "",
            clubDescription: club.description || club.about || "",
            status: mongooseDoc.status,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        };
    }

    static toDTOList(mongooseDocs: ClubRequestDoc[]): ClubRequestDTO[] {
        return mongooseDocs.map((doc) => this.toDTO(doc));
    }
}
