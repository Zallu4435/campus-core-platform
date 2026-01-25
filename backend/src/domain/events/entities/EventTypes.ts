export enum OrganizerType {
  Department = "department",
  Club = "club",
  Student = "student",
  Administration = "administration",
  External = "external",
}

export enum EventType {
  Workshop = "workshop",
  Seminar = "seminar",
  Fest = "fest",
  Competition = "competition",
  Exhibition = "exhibition",
  Conference = "conference",
  Hackathon = "hackathon",
  Cultural = "cultural",
  Sports = "sports",
  Academic = "academic",
}

export enum Timeframe {
  Morning = "morning",
  Afternoon = "afternoon",
  Evening = "evening",
  Night = "night",
  AllDay = "allday",
}

export enum EventStatus {
  Upcoming = "upcoming",
  Completed = "completed",
  Cancelled = "cancelled",
}

export enum EventRequestStatus {
  Pending = "pending",
  Approved = "approved",
  Rejected = "rejected",
}

export interface EventProps {
  id?: string;
  title: string;
  organizer: string;
  organizerType: OrganizerType;
  eventType: EventType;
  date: string;
  time: string;
  location: string;
  timeframe: Timeframe;
  status?: EventStatus;
  icon?: string;
  color?: string;
  description?: string;
  fullTime?: boolean;
  additionalInfo?: string;
  requirements?: string;
  maxParticipants?: number;
  registrationRequired?: boolean;
  participants?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventRequestProps {
  id?: string;
  eventId: string | { id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string; participants: number };
  userId: string | { id: string; firstName: string; lastName: string; email: string };
  status?: EventRequestStatus;
  whyJoin: string;
  additionalInfo?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface EventData {
  id: string;
  title: string;
  organizer: string;
  organizerType: OrganizerType;
  eventType: EventType;
  date: string;
  time: string;
  location: string;
  timeframe: Timeframe;
  status: EventStatus;
  icon: string;
  color: string;
  description: string;
  fullTime: boolean;
  additionalInfo: string;
  requirements: string;
  maxParticipants: number;
  registrationRequired: boolean;
  participants: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EventRequestData {
  id: string;
  eventId: string | { id: string; title: string; eventType: string; date: string; organizer: string; location: string; description: string; participants: number };
  userId: string | { id: string; firstName: string; lastName: string; email: string };
  status: EventRequestStatus;
  whyJoin: string;
  additionalInfo: string;
  createdAt: Date;
  updatedAt: Date;
}