export enum SportStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum SportRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface SportProps {
  id?: string;
  title: string;
  type: string;
  category: string;
  organizer: string;
  organizerType: string;
  icon: string;
  color: string;
  division: string;
  headCoach: string;
  homeGames: number;
  record: string;
  upcomingGames: { date: string; description: string }[];
  participants: number;
  status?: SportStatus;
  createdAt?: Date;
  updatedAt?: Date;
  playerCount?: number;
  formedOn?: string;
  userRequestStatus?: string;
}

export interface SportRequestProps {
  id?: string;
  sportId: string | {
    id: string;
    _id?: { toString(): string };
    title: string;
    type: string;
    headCoach?: string;
    participants?: number;
    division?: string;
  };
  userId: string | {
    id: string;
    _id?: { toString(): string };
    email: string;
    firstName?: string;
    lastName?: string
  };
  status?: SportRequestStatus;
  whyJoin: string;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SportData {
  id: string;
  title: string;
  type: string;
  category: string;
  organizer: string;
  organizerType: string;
  icon: string;
  color: string;
  division: string;
  headCoach: string;
  homeGames: number;
  record: string;
  upcomingGames: { date: string; description: string }[];
  participants: number;
  status: SportStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface SportRequestData {
  id: string;
  _id?: string;
  sportId: string | {
    id: string;
    _id?: { toString(): string };
    title: string;
    type: string;
    headCoach?: string;
    participants?: number;
    division?: string;
  };
  userId: string | {
    id: string;
    _id?: { toString(): string };
    email: string;
    firstName?: string;
    lastName?: string
  };
  status: SportRequestStatus;
  whyJoin: string;
  additionalInfo: string;
  createdAt: Date;
  updatedAt: Date;
}
