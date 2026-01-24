import { VideoSessionStatus } from "../enums/VideoSessionStatus";

export interface Attendee {
    id: string;
    name: string;
}

export interface AttendanceInterval {
    joinedAt: Date;
    leftAt?: Date;
}

export interface AttendanceRecord {
    userId: string;
    intervals: AttendanceInterval[];
    status?: string;
}

export interface VideoSessionProps {
    id?: string;
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
    attendeeList?: Attendee[];
    attendance?: AttendanceRecord[];
    joinUrl?: string;
}
