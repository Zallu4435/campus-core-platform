import { SportStatus, SportRequestStatus, SportProps } from "../../../domain/sports/entities/SportTypes";

export interface SportDataDTO extends Omit<SportProps, 'id' | 'createdAt' | 'updatedAt'> {
    status?: SportStatus;
}

export interface SportRequestDataDTO {
    sportId: string;
    userId: string;
    whyJoin: string;
    additionalInfo?: string;
}

export interface RepositorySportData extends SportDataDTO {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface SportSummaryDTO {
    id: string;
    title: string;
    type: string;
    headCoach: string;
    playerCount: number;
    status: SportStatus;
    formedOn?: string;
    division: string;
    participants: number;
    icon: string;
    color: string;
    createdAt?: string;
    category?: string;
    organizer?: string;
    organizerType?: string;
    homeGames?: number;
    record?: string;
    upcomingGames?: { date: string; description: string }[];
    userRequestStatus?: string;
}

export interface SportRequestDTO {
    id: string;
    sportId: string;
    sportTitle: string;
    userId: string;
    userName: string;
    userEmail: string;
    status: string;
    whyJoin: string;
    additionalInfo: string;
    requestedDate: string;
    updatedAt: string;
    type: string;
    headCoach: string;
    playerCount: number;
    division: string;
}
