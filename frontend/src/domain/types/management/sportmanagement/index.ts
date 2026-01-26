import React from 'react';

export interface Team {
  id?: string;
  title: string;
  type: string;
  headCoach: string;
  playerCount: number;
  status: string;
  createdAt: string;
  category: string;
  organizer: string;
  organizerType: string;
  icon: string;
  color: string;
  division: string;
  homeGames: number;
  record: string;
  name?: string;
  participants?: number;
  formedOn?: string;
  description?: string;
  upcomingGames: { date: string; description: string }[];
  _id?: string;
}

export interface PlayerRequest {
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
  // UI helper fields
  requestId?: string;
  teamName?: string;
  sportName?: string;
  requestedBy?: string;
  requestedAt?: string;
  _id?: string;
}

export interface SportRequestDetails {
  sportRequest: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    whyJoin: string;
    requestedDate?: string;
    additionalInfo?: string;
    sport: {
      id: string;
      title: string;
      type: string;
      headCoach: string;
      playerCount: number;
      division: string;
    };
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
  data?: {
    id: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    description: string;
    additionalInfo?: string;
    sport: {
      id: string;
      name: string;
      type: string;
      description: string;
      expectedParticipants: number;
    };
    user: {
      name?: string;
      email: string;
    };
  };
}

// Sport Status Types
export type SportStatus = 'active' | 'inactive' | 'pending' | 'approved' | 'rejected';
export type SportType = 'football' | 'basketball' | 'badminton' | 'athletics' | 'swimming' | 'tennis' | 'volleyball';
export type TeamCategory = 'varsity' | 'club' | 'intramural';
export type Division = 'division_i' | 'division_ii' | 'division_iii';

// Sport Management Modal Types
export interface TeamDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onEdit: (team: Team) => void;
}

export interface StatusBadgeProps {
  status: string;
}

export interface InfoCardProps {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string | number;
}

export interface UpcomingGame {
  date: string;
  description: string;
  _id: string;
}

export interface TeamDetailsTeam {
  id: string;
  name: string;
  sportType: string;
  category: string;
  organizer: string;
  organizerType: string;
  color: string;
  division: string;
  coach: string;
  homeGames: number;
  record: string;
  upcomingGames: UpcomingGame[];
  playerCount: number;
  status: string;
  formedOn: string;
  description?: string;
  _id?: string;
  icon?: string;
  type?: string;
  headCoach?: string;
  participants?: number;
  createdAt?: string;
}

// Sport Form Types
export interface TeamFormData {
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
  status: 'Active' | 'Inactive';
}

export interface AddTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeamFormData) => void;
  initialData?: Partial<TeamFormData>;
  isEditing?: boolean;
  sportTypes: string[];
  coaches: string[];
  divisions: string[];
  teamCategories: string[];
}

export interface OrganizerTypeOption {
  value: 'department' | 'club' | 'student' | 'administration' | 'external';
  label: string;
  emoji: string;
}

export interface UpcomingGame {
  date: string;
  description: string;
}

export interface ParticleConfig {
  size: number;
  top: number;
  left: number;
  animDuration: number;
  animDelay: number;
}

// Sport Action Types
export interface SportAction {
  id: string;
  type: 'team' | 'request';
  action: 'delete' | 'reject' | 'approve' | 'edit';
}

export interface SportActionConfig {
  icon: React.ReactNode;
  label: string;
  onClick: (item: Team | PlayerRequest) => void;
  color: 'blue' | 'green' | 'red' | 'yellow';
  disabled?: boolean | ((item: Team | PlayerRequest) => boolean);
}

// Sport Column Types
export interface SportColumn {
  header: string;
  key: string;
  render: (item: Team | PlayerRequest) => React.ReactNode;
  width?: string;
}

// Sport Filter Types
export interface SportFilters {
  status?: SportStatus;
  type?: SportType;
  category?: TeamCategory;
  division?: Division;
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

// Sports Management Types
export interface Filters {
  [key: string]: string;
  sportType: string;
  status: string;
  dateRange: string;
}

export interface ItemToAction {
  id: string;
  type: 'team' | 'playerRequest';
  action: 'delete' | 'reject' | 'approve';
}

// Team Request Details Types
export interface TeamRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SportRequestDetails | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export interface TeamRequestDetailsStatusBadgeProps {
  status: SportStatus;
}

export interface TeamRequestDetailsInfoCardProps {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string | number;
  highlight?: boolean;
}

// Particle Animation Types
export interface ParticleConfig {
  size: number;
  top: number;
  left: number;
  animDuration: number;
  animDelay: number;
}

// Sport Statistics Types
export interface SportStats {
  totalTeams: number;
  activeTeams: number;
  inactiveTeams: number;
  totalPlayers: number;
  averagePlayersPerTeam: number;
  pendingRequests: number;
  approvedRequests: number;
  rejectedRequests: number;
}

// Sport Registration Types
export interface SportRegistration {
  id: string;
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
  registeredAt: string;
  status: 'registered' | 'approved' | 'rejected';
}

export interface SportRegistrationProps {
  teamId: string;
  userId: string;
  userName: string;
  userEmail: string;
}

// Form Option Types
export interface SportTypeOption {
  value: string;
  label: string;
  emoji: string;
}

export interface TeamCategoryOption {
  value: string;
  label: string;
  emoji: string;
}

export interface DivisionOption {
  value: string;
  label: string;
  emoji: string;
}

export interface CoachOption {
  value: string;
  label: string;
  emoji: string;
}

export interface IconOption {
  icon: string;
  index: number;
}

export interface ColorOption {
  color: string;
}

export interface SportsApiResponse<T = unknown> {
  data: {
    data: T[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  };
}

export interface TeamApiResponseSingle {
  data: {
    sport: Team;
  };
}

export interface PlayerRequestApiResponseSingle {
  data: {
    sportRequest: PlayerRequest;
  };
}

// Consolidated interfaces have been moved to the top of the file


export interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  form: {
    title: string;
    sportType: string;
    teams: string[];
    dateTime: string;
    venue: string;
    status: string;
  };
  setForm: (form: EventModalProps['form']) => void;
  sportTypes: string[];
}