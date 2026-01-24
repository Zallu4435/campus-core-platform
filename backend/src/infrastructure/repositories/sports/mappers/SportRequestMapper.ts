import { SportRequest } from "../../../../domain/sports/entities/SportRequest";
import { SportRequestDTO } from "../../../../application/sports/dtos/SportBaseDTOs";
import { SportRequestDoc } from "../../../../domain/sports/entities/SportTypes";

interface PopulatedSport {
    _id: string;
    title: string;
    type: string;
}

interface PopulatedUser {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
}

export class SportRequestMapper {
    static toDomain(mongooseDoc: SportRequestDoc): SportRequest {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        const sportId = typeof mongooseDoc.sportId === 'string'
            ? mongooseDoc.sportId
            : mongooseDoc.sportId._id.toString();

        const userId = typeof mongooseDoc.userId === 'string'
            ? mongooseDoc.userId
            : mongooseDoc.userId._id.toString();

        return new SportRequest({
            id: mongooseDoc._id.toString(),
            sportId,
            userId,
            status: mongooseDoc.status,
            whyJoin: mongooseDoc.whyJoin,
            additionalInfo: mongooseDoc.additionalInfo,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        });
    }

    static toPersistence(domainEntity: SportRequest): Record<string, unknown> {
        const sportId = typeof domainEntity.sportId === 'string'
            ? domainEntity.sportId
            : (domainEntity.sportId as { _id: string })._id;

        const userId = typeof domainEntity.userId === 'string'
            ? domainEntity.userId
            : (domainEntity.userId as { _id: string })._id;

        return {
            sportId,
            userId,
            status: domainEntity.status,
            whyJoin: domainEntity.whyJoin,
            additionalInfo: domainEntity.additionalInfo,
        };
    }

    static toDTO(mongooseDoc: SportRequestDoc): SportRequestDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to DTO");
        }

        const sport = typeof mongooseDoc.sportId !== 'string'
            ? mongooseDoc.sportId as unknown as PopulatedSport
            : { _id: mongooseDoc.sportId, title: "", type: "" };

        const user = typeof mongooseDoc.userId !== 'string'
            ? mongooseDoc.userId as unknown as PopulatedUser
            : { _id: mongooseDoc.userId, email: "" };

        return {
            id: mongooseDoc._id.toString(),
            sportId: sport._id.toString(),
            sportTitle: sport.title || "",
            userId: user._id.toString(),
            userName: user.firstName ? `${user.firstName} ${user.lastName}` : "",
            userEmail: user.email || "",
            status: mongooseDoc.status,
            whyJoin: mongooseDoc.whyJoin,
            additionalInfo: mongooseDoc.additionalInfo || "",
            requestedDate: mongooseDoc.createdAt ? mongooseDoc.createdAt.toISOString() : "",
            type: sport.type || "",
        };
    }

    static toDTOList(mongooseDocs: SportRequestDoc[]): SportRequestDTO[] {
        return mongooseDocs.map((doc) => this.toDTO(doc));
    }
}
