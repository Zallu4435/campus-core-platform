import { EventStatus, SportType, ClubStatus, RequestStatus } from '../enums/CampusLifeEnums';
import { SportStatus } from '../../sports/entities/SportTypes';

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
// Raw Data Interfaces (Standard Domain Representation)
// ============================================

export interface CampusEventData {
    id: string;
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
    status: string;
    maxParticipants: number;
    registrationRequired: boolean;
    participants: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface SportData {
    id: string;
    title: string;
    type: string;
    category: string;
    organizer: string;
    organizerType: string;
    headCoach: string;
    homeGames: number;
    record: string;
    upcomingGames: { date: string; description: string }[];
    playerCount?: number;
    status: SportStatus;
    formedOn?: string;
    logo?: string;
    division: string;
    participants: number;
    icon: string;
    color: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ClubData {
    id: string;
    name: string;
    type: string;
    createdBy: string;
    status: string;
    description: string;
    members: string[];
    role: string;
    color: string;
    icon: string;
    nextMeeting: string;
    about: string;
    upcomingEvents: { date: string; description: string }[];
    enteredMembers: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface JoinRequestData {
    id: string;
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
// Filter Interfaces (Clean Domain Filtering)
// ============================================

export interface CampusEventFilter {
    searchQuery?: string;
    startDate?: string;
    endDate?: string;
    organizer?: string;
    status?: 'upcoming' | 'past' | string;
}

export interface SportFilter {
    searchQuery?: string;
    type?: string;
    division?: string;
    headCoach?: string;
}

export interface ClubFilter {
    searchQuery?: string;
    type?: string;
    status?: string;
}
