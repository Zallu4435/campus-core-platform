import { EventStatus, SportType, ClubStatus, RequestStatus } from '../enums/CampusLifeEnums';

/**
 * Campus Life Types
 * Request classes and raw data interfaces
 */

// ============================================
// Request Classes (for use cases)
// ============================================

export class CampusLifeOverviewRequest {
    constructor() { }
}

export class EventsRequest {
    constructor(
        public page: number,
        public limit: number,
        public search: string,
        public status: EventStatus | 'all',
        public userId?: string
    ) { }
}

export class EventByIdRequest {
    constructor(
        public eventId: string
    ) { }
}

export class SportsRequest {
    constructor(
        public search: string,
        public type?: SportType,
        public userId?: string
    ) { }
}

export class SportByIdRequest {
    constructor(
        public sportId: string
    ) { }
}

export class ClubsRequest {
    constructor(
        public search: string,
        public status: ClubStatus | 'all',
        public type?: string,
        public userId?: string
    ) { }
}

export class ClubByIdRequest {
    constructor(
        public clubId: string
    ) { }
}

export class JoinClubRequest {
    constructor(
        public clubId: string,
        public studentId: string,
        public reason: string,
        public additionalInfo?: string
    ) { }
}

export class JoinSportRequest {
    constructor(
        public sportId: string,
        public studentId: string,
        public reason: string,
        public additionalInfo?: string
    ) { }
}

export class JoinEventRequest {
    constructor(
        public eventId: string,
        public studentId: string,
        public reason: string,
        public additionalInfo?: string
    ) { }
}

// ============================================
// Raw Data Interfaces (from database)
// ============================================

export interface RawCampusEvent {
    _id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    organizer: string;
    timeframe: string;
    icon: string;
    color: string;
    description: string;
    fullTime: boolean;
    additionalInfo: string;
    requirements: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RawSport {
    _id: string;
    title: string;
    type: string;
    headCoach: string;
    playerCount?: number;
    status: string;
    formedOn?: string;
    logo?: string;
    division: string;
    participants: number;
    icon: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface RawClub {
    _id: string;
    name: string;
    type: string;
    createdBy: string;
    status: string;
    description: string;
    members: string[];
    color: string;
    icon: string;
    nextMeeting: string;
    about: string;
    upcomingEvents: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface RawJoinRequest {
    _id: string;
    userId: string;
    eventId?: string;
    sportId?: string;
    clubId?: string;
    status: string;
    whyJoin: string;
    additionalInfo: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Filter Interfaces (for queries)
// ============================================

export interface CampusEventFilter {
    title?: { $regex: string; $options: string };
    date?: { $gte?: string; $lte?: string };
    organizer?: { $regex: string; $options: string };
    status?: 'upcoming' | 'past' | string;
    $or?: Array<{
        title?: { $regex: string; $options: string };
        organizer?: { $regex: string; $options: string };
    }>;
    [key: string]: unknown;
}

export interface SportFilter {
    title?: { $regex: string; $options: string };
    type?: string;
    division?: string;
    headCoach?: { $regex: string; $options: string };
    $or?: Array<{
        title?: { $regex: string; $options: string };
        headCoach?: { $regex: string; $options: string };
    }>;
    [key: string]: unknown;
}

export interface ClubFilter {
    name?: { $regex: string; $options: string };
    type?: { $regex: string; $options: string };
    status?: string;
    $or?: Array<{
        name?: { $regex: string; $options: string };
        type?: { $regex: string; $options: string };
    }>;
    [key: string]: unknown;
}
