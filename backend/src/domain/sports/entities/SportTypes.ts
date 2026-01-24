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
  logo?: string;
}

export interface SportRequestProps {
  id?: string;
  sportId: string | { _id: string; title: string; type: string };
  userId: string | { _id: string; email: string; firstName?: string; lastName?: string };
  status?: SportRequestStatus;
  whyJoin: string;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Sport {
  _id: string;
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
  logo?: string;
}

export interface SportDoc extends Sport { }

export interface SportRequestDoc {
  _id: string;
  sportId: string | { _id: string; title: string; type: string };
  userId: string | { _id: string; email: string; firstName?: string; lastName?: string };
  status: SportRequestStatus;
  whyJoin: string;
  additionalInfo: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SportRequest extends SportRequestDoc { }
