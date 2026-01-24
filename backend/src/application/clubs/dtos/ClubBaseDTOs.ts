import { ClubProps, ClubStatus } from "../../../domain/clubs/entities/ClubTypes";

export type ClubDataDTO = Pick<ClubProps,
    'name' | 'type' | 'createdBy' | 'description' | 'members' | 'color' | 'icon' |
    'nextMeeting' | 'about' | 'enteredMembers' | 'upcomingEvents'
> & {
    status?: ClubStatus;
};

export type ClubRequestDataDTO = {
    clubId: string;
    userId: string;
    whyJoin: string;
    additionalInfo?: string;
};

export interface RepositoryClubData {
    _id: string;
    name: string;
    type: string;
    status: string;
    createdBy?: string;
    description?: string;
    members?: string[];
    color?: string;
    icon?: string;
    nextMeeting?: string;
    about?: string;
    enteredMembers?: number;
    upcomingEvents?: { date: string; description: string }[];
    role?: string;
    createdAt: Date;
    updatedAt?: Date;
}

export interface ClubSummaryData {
    id: string;
    name: string;
    type: string;
    members: string[];
    color: string;
    icon: string;
    status: string;
    memberCount: number;
    image?: string;
}

export interface ClubRequestSummaryData {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    clubId: string;
    clubName: string;
    clubType: string;
    clubDescription?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ClubSummaryDTO extends ClubSummaryData { }

export interface ClubRequestDTO extends ClubRequestSummaryData { }
