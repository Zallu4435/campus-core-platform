import { Sport } from "../../../../domain/sports/entities/Sport";
import {
    RepositorySportData,
    SportSummaryDTO
} from "../../../../application/sports/dtos/SportBaseDTOs";
import { SportData, SportStatus } from "../../../../domain/sports/entities/SportTypes";

export class SportMapper {
    static toDomain(data: SportData): Sport {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        return new Sport({
            id: data.id,
            title: data.title,
            type: data.type,
            category: data.category,
            organizer: data.organizer,
            organizerType: data.organizerType,
            icon: data.icon,
            color: data.color,
            division: data.division,
            headCoach: data.headCoach,
            homeGames: data.homeGames,
            record: data.record,
            upcomingGames: data.upcomingGames,
            participants: data.participants,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            logo: data.logo,
        });
    }

    static toDomainList(dataList: any[], requests: unknown[] = [], userId?: string): Sport[] {
        return dataList.map(doc => {
            // Flexible mapping for legacy/mixed data
            const id = doc.id || doc._id?.toString();
            return new Sport({
                id,
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

    static toRepositoryDTO(data: SportData): RepositorySportData {
        if (!data) {
            throw new Error("Cannot map null data to Repository DTO");
        }

        return {
            id: data.id,
            title: data.title,
            type: data.type,
            category: data.category,
            organizer: data.organizer,
            organizerType: data.organizerType,
            icon: data.icon,
            color: data.color,
            division: data.division,
            headCoach: data.headCoach,
            homeGames: data.homeGames,
            record: data.record,
            upcomingGames: data.upcomingGames,
            participants: data.participants,
            status: data.status,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
            logo: data.logo,
        };
    }

    static toSummaryDTO(data: SportData | Sport): SportSummaryDTO {
        if (!data) {
            throw new Error("Cannot map null data to Summary DTO");
        }

        return {
            id: data.id || "",
            title: data.title,
            type: data.type,
            headCoach: data.headCoach,
            playerCount: data.participants || 0,
            status: data.status,
            formedOn: data.createdAt ? data.createdAt.toISOString() : undefined,
            logo: data.logo || "",
            division: data.division || "",
            participants: data.participants || 0,
            icon: data.icon,
            color: data.color,
            createdAt: data.createdAt ? data.createdAt.toISOString() : undefined
        };
    }

    static toSummaryDTOList(dataList: (SportData | Sport)[]): SportSummaryDTO[] {
        return dataList.map((data) => this.toSummaryDTO(data));
    }
}
