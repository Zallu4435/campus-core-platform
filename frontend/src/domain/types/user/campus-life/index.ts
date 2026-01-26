import { JoinRequestFormValues } from "../../../validation/user/JoinRequestSchema";

export interface Game {
  date?: string;
  description?: string;
}

export interface Sport {
  id: string;
  title: string;
  type: string;
  icon?: string;
  color?: string;
  division?: string;
  headCoach?: string;
  category?: string;
  organizer?: string;
  organizerType?: string;
  homeGames?: number | string[];
  record?: string;
  upcomingGames?: (string | Game)[];
  participants?: number;
  createdAt?: string;
  updatedAt?: string;
  userRequestStatus?: string;
}

export interface SportsData {
  sports: Sport[];
  totalItems: number;
}

export interface JoinRequest {
  reason: string;
  additionalInfo: string;
}

export interface EventType {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  timeframe: string;
  icon: string;
  color: string;
  description?: string;
  fullTime?: string;
  additionalInfo?: string;
  requirements?: string;
  status?: string;
  maxParticipants?: number;
  registrationRequired?: boolean;
  participants?: number;
  userRequestStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsSectionProps {
  events: EventType[];
}

export interface ClubUpcomingEvent {
  date?: string;
  description?: string;
}

export interface ClubType {
  id: string;
  name: string;
  type: string;
  members: number | string;
  icon: string;
  color: string;
  status?: string;
  role: string;
  nextMeeting: string;
  about?: string;
  upcomingEvents?: (string | ClubUpcomingEvent)[];
  createdBy?: string;
  enteredMembers?: number;
  userRequestStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClubsSectionProps {
  clubs: ClubType[];
}


export interface CampusLifeTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export interface CampusLifeResponse {
  events: Event[];
  sports: Sport[];
  clubs: Club[];
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  organizer: string;
  timeframe: string;
  icon: string;
  color: string;
  description?: string;
  fullTime?: string;
  additionalInfo?: string;
  requirements?: string;
  status?: string;
  maxParticipants?: number;
  registrationRequired?: boolean;
  participants?: number;
  userRequestStatus?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Club {
  id: string;
  name: string;
  type: string;
  members: number | string;
  icon: string;
  color: string;
  status?: string;
  role: string;
  nextMeeting: string;
  about?: string;
  upcomingEvents?: (string | ClubUpcomingEvent)[];
  userRequestStatus?: string;
}

export interface JoinRequestFormProps {
  onSubmit: (data: JoinRequestFormValues) => void;
  onCancel: () => void;
  isLoading: boolean;
  title: string;
}