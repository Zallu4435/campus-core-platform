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
    id: string;
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
    createdBy?: string;
    createdAt?: Date;
    image?: string;
}

export interface ClubRequestSummaryData {
    id: string;
    _id?: string;
    userId: string;
    userName: string;
    userEmail: string;
    requestedBy: string;
    clubId: string;
    clubName: string;
    name?: string;
    clubType: string;
    type?: string;
    clubDescription?: string;
    status: string;
    createdAt: Date;
    requestedAt?: Date;
    updatedAt: Date;
    requestedId?: string;
    whyJoin?: string;
    additionalInfo?: string;
}
export interface ClubSummaryDTO extends ClubSummaryData { }

export interface ClubRequestDTO extends ClubRequestSummaryData { }
