import { Types } from "mongoose";

export interface IVideoSessionSource {
    _id: Types.ObjectId | string;
    title: string;
    hostId: string;
    participants: string[];
    startTime: Date | string;
    endTime?: Date | string | null;
    status: string;
    description?: string;
    instructor?: string;
    course?: string;
    duration?: number;
    maxAttendees?: number;
    tags: string[];
    difficulty?: string;
    isLive: boolean;
    hasRecording: boolean;
    recordingUrl?: string;
    attendees: number;
    attendeeList: { id: string; name: string }[];
    joinUrl?: string;
    attendance: { userId: string; intervals: { joinedAt: Date; leftAt?: Date }[]; status?: string }[];
    createdAt: Date | string;
    updatedAt: Date | string;
    [key: string]: unknown;
}
