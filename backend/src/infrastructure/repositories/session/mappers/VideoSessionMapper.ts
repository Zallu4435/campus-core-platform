import { VideoSession } from "../../../../domain/session/entities/VideoSession";
import {
    VideoSessionResponseDTO,
    SessionListResponseDTO
} from "../../../../application/session/dtos/VideoSessionResponseDTOs";
import { VideoSessionStatus } from "../../../../domain/session/enums/VideoSessionStatus";
import { IVideoSessionSource } from "../infraTypes";

export class VideoSessionMapper {
    static toDomain(mongooseDoc: IVideoSessionSource): VideoSession {
        if (!mongooseDoc) {
            throw new Error("Cannot map null document to domain entity");
        }

        return new VideoSession({
            id: mongooseDoc._id.toString(),
            title: mongooseDoc.title,
            hostId: mongooseDoc.hostId,
            participants: mongooseDoc.participants,
            startTime: mongooseDoc.startTime instanceof Date ? mongooseDoc.startTime : new Date(mongooseDoc.startTime),
            endTime: mongooseDoc.endTime ? (mongooseDoc.endTime instanceof Date ? mongooseDoc.endTime : new Date(mongooseDoc.endTime)) : null,
            status: mongooseDoc.status as VideoSessionStatus,
            description: mongooseDoc.description,
            instructor: mongooseDoc.instructor,
            course: mongooseDoc.course,
            duration: mongooseDoc.duration,
            maxAttendees: mongooseDoc.maxAttendees,
            tags: mongooseDoc.tags,
            difficulty: mongooseDoc.difficulty as 'beginner' | 'intermediate' | 'advanced',
            isLive: mongooseDoc.isLive,
            hasRecording: mongooseDoc.hasRecording,
            recordingUrl: mongooseDoc.recordingUrl,
            attendees: mongooseDoc.attendees,
            attendeeList: mongooseDoc.attendeeList,
            attendance: mongooseDoc.attendance ? mongooseDoc.attendance.map(a => ({
                userId: a.userId,
                status: a.status,
                intervals: a.intervals.map(i => ({
                    joinedAt: i.joinedAt instanceof Date ? i.joinedAt : new Date(i.joinedAt),
                    leftAt: i.leftAt ? (i.leftAt instanceof Date ? i.leftAt : new Date(i.leftAt)) : undefined
                }))
            })) : undefined,
            joinUrl: mongooseDoc.joinUrl,
        });
    }

    static toPersistence(domainEntity: VideoSession): Partial<IVideoSessionSource> {
        return {
            title: domainEntity.title,
            hostId: domainEntity.hostId,
            participants: domainEntity.participants,
            startTime: domainEntity.startTime,
            endTime: domainEntity.endTime,
            status: domainEntity.status,
            description: domainEntity.description,
            instructor: domainEntity.instructor,
            course: domainEntity.course,
            duration: domainEntity.duration,
            maxAttendees: domainEntity.maxAttendees,
            tags: domainEntity.tags,
            difficulty: domainEntity.difficulty,
            isLive: domainEntity.isLive,
            hasRecording: domainEntity.hasRecording,
            recordingUrl: domainEntity.recordingUrl,
            attendees: domainEntity.attendees,
            attendeeList: domainEntity.attendeeList,
            attendance: domainEntity.attendance,
            joinUrl: domainEntity.joinUrl,
        };
    }

    static toDomainList(mongooseDocs: IVideoSessionSource[]): VideoSession[] {
        return mongooseDocs.map((doc) => this.toDomain(doc));
    }

    static toResponseDTO(domainEntity: VideoSession): VideoSessionResponseDTO {
        return {
            id: domainEntity.id,
            title: domainEntity.title,
            hostId: domainEntity.hostId,
            participants: domainEntity.participants,
            startTime: domainEntity.startTime,
            endTime: domainEntity.endTime,
            status: domainEntity.status,
            description: domainEntity.description,
            instructor: domainEntity.instructor,
            course: domainEntity.course,
            duration: domainEntity.duration,
            maxAttendees: domainEntity.maxAttendees,
            tags: domainEntity.tags,
            difficulty: domainEntity.difficulty,
            isLive: domainEntity.isLive,
            hasRecording: domainEntity.hasRecording,
            recordingUrl: domainEntity.recordingUrl,
            attendees: domainEntity.attendees,
            attendeeList: domainEntity.attendeeList ? domainEntity.attendeeList.map(a => ({ id: a.id, name: a.name })) : [],
            joinUrl: domainEntity.joinUrl
        };
    }

    static toListResponseDTO(domainEntity: VideoSession): SessionListResponseDTO {
        return {
            id: domainEntity.id,
            title: domainEntity.title,
            instructor: domainEntity.instructor,
            course: domainEntity.course,
            status: domainEntity.status,
            attendees: domainEntity.attendees,
            maxAttendees: domainEntity.maxAttendees,
            startTime: domainEntity.startTime,
            joinUrl: domainEntity.joinUrl
        };
    }
}
