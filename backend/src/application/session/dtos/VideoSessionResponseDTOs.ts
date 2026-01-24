import { VideoSessionStatus } from "../../../domain/session/enums/VideoSessionStatus";

export interface SessionListResponseDTO {
    id: string;
    title: string;
    instructor?: string;
    course?: string;
    status: VideoSessionStatus;
    attendees?: number;
    maxAttendees?: number;
    startTime: Date;
    joinUrl?: string;
}

export interface VideoSessionResponseDTO {
    id: string;
    title: string;
    hostId: string;
    participants: string[];
    startTime: Date;
    endTime: Date | null;
    status: VideoSessionStatus;
    description?: string;
    instructor?: string;
    course?: string;
    duration?: number;
    maxAttendees?: number;
    tags?: string[];
    difficulty?: "beginner" | "intermediate" | "advanced";
    isLive?: boolean;
    hasRecording?: boolean;
    recordingUrl?: string;
    attendees?: number;
    attendeeList?: { id: string; name: string }[];
    joinUrl?: string;
}

export interface UserSessionResponseDTO {
    id: string;
    title: string;
    status: VideoSessionStatus;
    description?: string;
    instructor?: string;
    course?: string;
    duration?: number;
    tags?: string[];
    difficulty?: "beginner" | "intermediate" | "advanced";
    hasRecording?: boolean;
    startTime: Date;
    joinUrl?: string;
    isLive?: boolean;
    isEnrolled?: boolean;
    userAttendanceStatus?: string;
}

export interface AttendanceRecordResponseDTO {
    id: string;
    username: string;
    email: string;
    intervals: Array<{ joinedAt: Date; leftAt?: Date }>;
    status: string | null;
}

export interface CreateVideoSessionResponseDTO {
    session: VideoSessionResponseDTO;
}

export interface JoinVideoSessionResponseDTO {
    session: VideoSessionResponseDTO;
}

export interface UpdateVideoSessionResponseDTO {
    session: VideoSessionResponseDTO;
}

export interface UpdateVideoSessionStatusResponseDTO {
    success: boolean;
    message: string;
    session: VideoSessionResponseDTO;
}

export interface DeleteVideoSessionResponseDTO {
    message: string;
}