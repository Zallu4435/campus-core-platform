import mongoose, { Schema, Document } from 'mongoose';
import { VideoSessionStatus } from '../../../../domain/session/enums/VideoSessionStatus';
import { VideoSessionProps } from '../../../../domain/session/entities/VideoSessionTypes';

export interface VideoSessionDoc extends Omit<VideoSessionProps, 'id'>, Document {
    _id: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const AttendeeSchema = new Schema({
    id: { type: String, required: true },
    name: { type: String, required: true }
}, { _id: false });

const AttendanceIntervalSchema = new Schema({
    joinedAt: { type: Date, required: true },
    leftAt: { type: Date }
}, { _id: false });

const AttendanceRecordSchema = new Schema({
    userId: { type: String, required: true },
    intervals: { type: [AttendanceIntervalSchema], default: [] },
    status: { type: String },
}, { _id: false });

const VideoSessionSchema = new Schema<VideoSessionDoc>({
    title: { type: String, required: true, trim: true },
    hostId: { type: String, required: true },
    participants: { type: [String], default: [] },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    status: { type: String, enum: Object.values(VideoSessionStatus), default: VideoSessionStatus.Scheduled },
    description: { type: String, trim: true },
    instructor: { type: String, trim: true },
    course: { type: String, trim: true },
    duration: { type: Number },
    maxAttendees: { type: Number },
    tags: { type: [String], default: [] },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    isLive: { type: Boolean, default: false },
    hasRecording: { type: Boolean, default: false },
    recordingUrl: { type: String, trim: true },
    attendees: { type: Number, default: 0 },
    attendeeList: { type: [AttendeeSchema], default: [] },
    joinUrl: { type: String, trim: true },
    attendance: { type: [AttendanceRecordSchema], default: [] },
}, { timestamps: true });

export const VideoSessionModel = mongoose.model<VideoSessionDoc>('VideoSession', VideoSessionSchema); 