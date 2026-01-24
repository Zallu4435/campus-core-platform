import { Sport } from "../../../../domain/sports/entities/Sport";
import {
    RepositorySportData,
    SportSummaryDTO
} from "../../../../application/sports/dtos/SportBaseDTOs";
import { SportDoc, SportStatus } from "../../../../domain/sports/entities/SportTypes";

interface LegacySportDoc {
    _id?: { toString(): string };
    title: string;
    type: string;
    category?: string;
    organizer?: string;
    organizerType?: string;
    icon?: string;
    color?: string;
    division?: string;
    headCoach?: string;
    homeGames?: number;
    record?: string;
    upcomingGames?: { date: string; description: string }[];
    participants?: number;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
    logo?: string;
}

export class SportMapper {
    static toDomain(mongooseDoc: SportDoc): Sport {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return new Sport({
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            type: mongooseDoc.type,
            category: mongooseDoc.category,
            organizer: mongooseDoc.organizer,
            organizerType: mongooseDoc.organizerType,
            icon: mongooseDoc.icon,
            color: mongooseDoc.color,
            division: mongooseDoc.division,
            headCoach: mongooseDoc.headCoach,
            homeGames: mongooseDoc.homeGames,
            record: mongooseDoc.record,
            upcomingGames: mongooseDoc.upcomingGames,
            participants: mongooseDoc.participants,
            status: mongooseDoc.status,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
            logo: mongooseDoc.logo,
        });
    }

    static toDomainList(mongooseDocs: LegacySportDoc[], requests: unknown[] = [], userId?: string): Sport[] {
        return mongooseDocs.map(doc => {
            // Flexible mapping for legacy RawSport data
            return new Sport({
                id: doc._id?.toString(),
                title: doc.title,
                type: doc.type,
                category: doc.category || "",
                organizer: doc.organizer || "",
                organizerType: doc.organizerType || "",
                icon: doc.icon || "",
                color: doc.color || "",
                division: doc.division || "",
                headCoach: doc.headCoach || "",
                homeGames: doc.homeGames || 0,
                record: doc.record || "",
                upcomingGames: doc.upcomingGames || [],
                participants: doc.participants || 0,
                status: (doc.status as SportStatus) || SportStatus.Active,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                logo: doc.logo
            });
        });
    }

    static toPersistence(domainEntity: Sport): Record<string, unknown> {
        return {
            title: domainEntity.title,
            type: domainEntity.type,
            category: domainEntity.category,
            organizer: domainEntity.organizer,
            organizerType: domainEntity.organizerType,
            icon: domainEntity.icon,
            color: domainEntity.color,
            division: domainEntity.division,
            headCoach: domainEntity.headCoach,
            homeGames: domainEntity.homeGames,
            record: domainEntity.record,
            upcomingGames: domainEntity.upcomingGames,
            participants: domainEntity.participants,
            status: domainEntity.status,
            logo: domainEntity.logo,
        };
    }

    static toRepositoryDTO(mongooseDoc: SportDoc): RepositorySportData {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Repository DTO");
        }

        return {
            _id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            type: mongooseDoc.type,
            category: mongooseDoc.category,
            organizer: mongooseDoc.organizer,
            organizerType: mongooseDoc.organizerType,
            icon: mongooseDoc.icon,
            color: mongooseDoc.color,
            division: mongooseDoc.division,
            headCoach: mongooseDoc.headCoach,
            homeGames: mongooseDoc.homeGames,
            record: mongooseDoc.record,
            upcomingGames: mongooseDoc.upcomingGames,
            participants: mongooseDoc.participants,
            status: mongooseDoc.status,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
            logo: mongooseDoc.logo,
        };
    }

    static toSummaryDTO(mongooseDoc: SportDoc): SportSummaryDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Summary DTO");
        }

        return {
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            type: mongooseDoc.type,
            headCoach: mongooseDoc.headCoach,
            playerCount: mongooseDoc.participants || 0,
            status: mongooseDoc.status,
            formedOn: mongooseDoc.createdAt ? mongooseDoc.createdAt.toISOString() : undefined,
            logo: mongooseDoc.logo || "",
            division: mongooseDoc.division || "",
            participants: mongooseDoc.participants || 0,
            icon: mongooseDoc.icon,
            color: mongooseDoc.color,
            createdAt: mongooseDoc.createdAt ? mongooseDoc.createdAt.toISOString() : undefined
        };
    }

    static toSummaryDTOList(mongooseDocs: SportDoc[]): SportSummaryDTO[] {
        return mongooseDocs.map((doc) => this.toSummaryDTO(doc));
    }
}
