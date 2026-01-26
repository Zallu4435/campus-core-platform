import { Club } from "../../../../domain/clubs/entities/Club";
import {
    RepositoryClubData,
    ClubSummaryDTO
} from "../../../../application/clubs/dtos/ClubBaseDTOs";
import { ClubData } from "../../../../domain/clubs/entities/ClubTypes";
import { CLUB_DEFAULTS } from "../../../../application/clubs/constants/ClubsConstants";

export class ClubMapper {
    static toDomain(data: ClubData): Club {
        if (!data) {
            throw new Error("Cannot map null data to domain entity");
        }

        return Club.create({
            id: data.id,
            name: data.name,
            type: data.type,
            createdBy: data.createdBy,
            status: data.status,
            description: data.description,
            members: data.members,
            color: data.color,
            icon: data.icon,
            nextMeeting: data.nextMeeting,
            about: data.about,
            enteredMembers: data.enteredMembers,
            upcomingEvents: data.upcomingEvents,
            role: data.role,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        });
    }

    static toPersistence(domainEntity: Club): Record<string, unknown> {
        return {
            name: domainEntity.getName(),
            type: domainEntity.getType(),
            createdBy: domainEntity.getCreatedBy(),
            status: domainEntity.getStatus(),
            description: domainEntity.getDescription(),
            members: domainEntity.getMembers(),
            color: domainEntity.getColor(),
            icon: domainEntity.getIcon(),
            nextMeeting: domainEntity.getNextMeeting(),
            about: domainEntity.getAbout(),
            enteredMembers: domainEntity.getEnteredMembers(),
            upcomingEvents: domainEntity.getUpcomingEvents(),
            role: domainEntity.getRole(),
        };
    }

    static toRepositoryDTO(data: ClubData): RepositoryClubData {
        if (!data) {
            throw new Error("Cannot map null data to Repository DTO");
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type,
            status: data.status,
            createdBy: data.createdBy,
            description: data.description,
            members: data.members,
            color: data.color,
            icon: data.icon,
            nextMeeting: data.nextMeeting,
            about: data.about,
            enteredMembers: data.enteredMembers,
            upcomingEvents: data.upcomingEvents,
            role: data.role,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt,
        };
    }

    static toSummaryDTO(data: ClubData): ClubSummaryDTO {
        if (!data) {
            throw new Error("Cannot map null data to Summary DTO");
        }

        return {
            id: data.id,
            name: data.name,
            type: data.type,
            members: data.members || [],
            color: data.color || CLUB_DEFAULTS.COLOR,
            icon: data.icon || CLUB_DEFAULTS.ICON,
            status: data.status,
            memberCount: data.enteredMembers || data.members?.length || 0,
            createdBy: data.createdBy,
            createdAt: data.createdAt,
        };
    }

    static toSummaryDTOList(dataList: ClubData[]): ClubSummaryDTO[] {
        return dataList.map((data) => this.toSummaryDTO(data));
    }
}
