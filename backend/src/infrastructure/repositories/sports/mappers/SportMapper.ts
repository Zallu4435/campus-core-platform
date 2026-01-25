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

    static toDomainList(dataList: unknown[], requests: unknown[] = [], userId?: string): Sport[] {
        return dataList.map(item => {
            const doc = item as Record<string, unknown>;
            // Flexible mapping for legacy/mixed data
            const id = (doc.id || (doc._id ? String(doc._id) : '')) as string;
            return new Sport({
                id,
                title: (doc.title as string) || "",
                type: (doc.type as string) || "",
                category: (doc.category as string) || "",
                organizer: (doc.organizer as string) || "",
                organizerType: (doc.organizerType as string) || "",
                icon: (doc.icon as string) || "",
                color: (doc.color as string) || "",
                division: (doc.division as string) || "",
                headCoach: (doc.headCoach as string) || "",
                homeGames: (doc.homeGames as number) || 0,
                record: (doc.record as string) || "",
                upcomingGames: (doc.upcomingGames as { date: string; description: string }[]) || [],
                participants: (doc.participants as number) || 0,
                status: (doc.status as SportStatus) || SportStatus.Active,
                createdAt: doc.createdAt as Date,
                updatedAt: doc.updatedAt as Date,
                logo: doc.logo as string
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
