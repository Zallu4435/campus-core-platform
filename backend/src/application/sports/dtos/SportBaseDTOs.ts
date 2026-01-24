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
    _id: string;
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
    logo?: string;
    division: string;
    participants: number;
    icon: string;
    color: string;
    createdAt?: string;
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
    type: string;
}
