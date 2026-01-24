export interface CreateVideoSessionRequestDTO {
    title: string;
    hostId?: string; // Optional since it will be automatically set by the backend
    startTime?: Date;
    date?: string; // Optional: ISO date string (e.g., '2025-07-21')
    time?: string; // Optional: time string (e.g., '13:12')
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
}

export interface JoinVideoSessionRequestDTO {
    sessionId: string;
    participantId: string;
}

export interface UpdateVideoSessionRequestDTO {
    sessionId: string;
    data: Partial<{
        title: string;
        startTime?: Date;
        date?: string; // Optional: ISO date string
        time?: string; // Optional: time string
        endTime?: Date | null;
        status?: string;
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
    }>;
}

export interface UpdateVideoSessionStatusRequestDTO {
    sessionId: string;
    status: string;
}

export interface DeleteVideoSessionRequestDTO {
    sessionId: string;
}

export interface UpdateAttendanceStatusRequestDTO {
    sessionId: string;
    userId: string;
    status: string;
    name: string;
}

export interface GetSessionAttendanceRequestDTO {
    sessionId: string;
    search?: string;
    decision?: string;
    attendanceLevel?: string;
    startDate?: string;
    endDate?: string;
}