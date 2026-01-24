import { VideoSessionStatus } from '../enums/VideoSessionStatus';
import { Attendee, AttendanceRecord, VideoSessionProps } from './VideoSessionTypes';

export class VideoSession {
    public readonly id: string;
    public readonly title: string;
    public readonly hostId: string;
    public readonly participants: string[];
    public readonly startTime: Date;
    public readonly endTime: Date | null;
    public readonly status: VideoSessionStatus;
    public readonly description?: string;
    public readonly instructor?: string;
    public readonly course?: string;
    public readonly duration?: number;
    public readonly maxAttendees?: number;
    public readonly tags?: string[];
    public readonly difficulty?: 'beginner' | 'intermediate' | 'advanced';
    public readonly isLive?: boolean;
    public readonly hasRecording?: boolean;
    public readonly recordingUrl?: string;
    public readonly attendees?: number;
    public readonly attendeeList?: Attendee[];
    public readonly attendance?: AttendanceRecord[];
    public joinUrl?: string;

    constructor(props: VideoSessionProps) {
        this.id = props.id || '';
        this.title = props.title;
        this.hostId = props.hostId;
        this.participants = props.participants;
        this.startTime = props.startTime;
        this.endTime = props.endTime;
        this.status = props.status;
        this.description = props.description;
        this.instructor = props.instructor;
        this.course = props.course;
        this.duration = props.duration;
        this.maxAttendees = props.maxAttendees;
        this.tags = props.tags;
        this.difficulty = props.difficulty;
        this.isLive = props.isLive;
        this.hasRecording = props.hasRecording;
        this.recordingUrl = props.recordingUrl;
        this.attendees = props.attendees;
        this.attendeeList = props.attendeeList;
        this.attendance = props.attendance;
        this.joinUrl = props.joinUrl;
    }
}
