import { Document } from "mongoose";
import { Club } from "../../../../domain/clubs/entities/Club";
import {
    RepositoryClubData,
    ClubSummaryDTO
} from "../../../../application/clubs/dtos/ClubBaseDTOs";
import { Club as ClubDoc } from "../../../../domain/clubs/entities/ClubTypes";
import { CLUB_DEFAULTS } from "../../../../application/clubs/constants/ClubsConstants";

export class ClubMapper {
    static toDomain(mongooseDoc: ClubDoc): Club {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return Club.create({
            id: mongooseDoc._id.toString(),
            name: mongooseDoc.name,
            type: mongooseDoc.type,
            createdBy: mongooseDoc.createdBy,
            status: mongooseDoc.status,
            description: mongooseDoc.description,
            members: mongooseDoc.members,
            color: mongooseDoc.color,
            icon: mongooseDoc.icon,
            nextMeeting: mongooseDoc.nextMeeting,
            about: mongooseDoc.about,
            enteredMembers: mongooseDoc.enteredMembers,
            upcomingEvents: mongooseDoc.upcomingEvents,
            role: mongooseDoc.role,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
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

    static toRepositoryDTO(mongooseDoc: ClubDoc): RepositoryClubData {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Repository DTO");
        }

        return {
            _id: mongooseDoc._id.toString(),
            name: mongooseDoc.name,
            type: mongooseDoc.type,
            status: mongooseDoc.status,
            createdBy: mongooseDoc.createdBy,
            description: mongooseDoc.description,
            members: mongooseDoc.members,
            color: mongooseDoc.color,
            icon: mongooseDoc.icon,
            nextMeeting: mongooseDoc.nextMeeting,
            about: mongooseDoc.about,
            enteredMembers: mongooseDoc.enteredMembers,
            upcomingEvents: mongooseDoc.upcomingEvents,
            role: mongooseDoc.role,
            createdAt: mongooseDoc.createdAt,
            updatedAt: mongooseDoc.updatedAt,
        };
    }

    static toSummaryDTO(mongooseDoc: ClubDoc): ClubSummaryDTO {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to Summary DTO");
        }

        return {
            id: mongooseDoc._id.toString(),
            name: mongooseDoc.name,
            type: mongooseDoc.type,
            members: mongooseDoc.members || [],
            color: mongooseDoc.color || CLUB_DEFAULTS.COLOR,
            icon: mongooseDoc.icon || CLUB_DEFAULTS.ICON,
            status: mongooseDoc.status,
            memberCount: mongooseDoc.members?.length || 0,
        };
    }

    static toSummaryDTOList(mongooseDocs: ClubDoc[]): ClubSummaryDTO[] {
        return mongooseDocs.map((doc) => this.toSummaryDTO(doc));
    }
}
