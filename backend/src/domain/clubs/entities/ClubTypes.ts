export enum ClubStatus {
  Active = "active",
  Inactive = "inactive",
}

export enum ClubRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface ClubProps {
  id?: string;
  name: string;
  type: string;
  createdBy: string;
  status?: ClubStatus;
  description?: string;
  members?: string[];
  color?: string;
  icon?: string;
  nextMeeting?: string;
  about?: string;
  enteredMembers?: number;
  upcomingEvents?: { date: string; description: string }[];
  role?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ClubRequestProps {
  id?: string;
  clubId: string | { _id: string; name: string; type: string; about: string; nextMeeting: string; enteredMembers: number };
  userId: string | { _id: string; firstName: string; lastName: string; email: string };
  status?: ClubRequestStatus;
  whyJoin: string;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Club {
  _id: string;
  name: string;
  type: string;
  createdBy: string;
  status: ClubStatus;
  description: string;
  members: string[];
  color: string;
  icon: string;
  nextMeeting: string;
  about: string;
  enteredMembers: number;
  upcomingEvents: { date: string; description: string }[];
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for Mongoose ClubRequest model
export interface ClubRequest {
  _id: string;
  clubId: string | { _id: string; name: string; type: string; about: string; nextMeeting: string; enteredMembers: number };
  userId: string | { _id: string; firstName: string; lastName: string; email: string };
  status: ClubRequestStatus;
  whyJoin: string;
  additionalInfo: string;
  createdAt: Date;
  updatedAt: Date;
}