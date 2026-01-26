export interface Club {
  id: string;
  name: string;
  type: string;
  members: string | string[];
  icon: string;
  color: string;
  status: string;
  role: string;
  nextMeeting: string;
  about: string;
  createdBy: string;
  createdAt: string;
  upcomingEvents: { date: string; description: string }[];
  memberCount?: number;
  enteredMembers?: number;
  description?: string;
  _id?: string;
  clubName?: string;
  whyJoin?: string;
  additionalInfo?: string;
  requestedBy?: string;
}

export interface ClubRequest {
  _id: string;
  name: string;
  type: string;
  members: string;
  icon: string;
  color: string;
  role: string;
  nextMeeting: string;
  about: string;
  requestedBy: string;
  createdAt: string;
  status: string;
  rejectionReason?: string;
  upcomingEvents: { date: string; description: string }[];
  clubName?: string;
  requestedId?: string;
  requestedAt?: string;
  id?: string;
  whyJoin?: string;
  additionalInfo?: string;
  clubDescription?: string;
}

export type ClubStatus = 'active' | 'inactive';
export type RequestStatus = 'pending' | 'approved' | 'rejected';
export type ClubType = 'Tech' | 'Cultural' | 'Sports' | 'Arts' | 'Academic';

export interface ClubAction {
  id: string;
  type: 'club' | 'request';
  action: 'delete' | 'reject' | 'approve';
}

export interface ClubActionConfig {
  icon: React.ReactNode;
  label: string;
  onClick: (item: Club | ClubRequest) => void;
  color: 'blue' | 'green' | 'red';
  disabled?: boolean | ((item: Club | ClubRequest) => boolean);
}

export interface ClubColumn {
  header: string;
  key: string;
  render: (item: Club | ClubRequest) => React.ReactNode;
  width?: string;
}

export interface ClubFormData {
  name: string;
  type: string;
  members: string;
  icon: string;
  color: string;
  status: 'active' | 'inactive';
  role: string;
  nextMeeting: string;
  about: string;
  createdBy: string;
  upcomingEvents: Array<{
    date: string;
    description: string;
  }>;
}

export interface AddClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClubFormData) => void;
  initialData?: Partial<ClubFormData>;
  isEditing?: boolean;
  clubTypes: string[];
  roles: string[];
  icons: string[];
  colors: string[];
}

export interface StatusBadgeProps {
  status: string;
}

export interface InfoCardProps {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
}

export interface ClubDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  club: Club | ClubRequest | null;
  onEdit?: (club: Club) => void;
}

export interface ParticleConfig {
  size: number;
  top: number;
  left: number;
  animDuration: number;
  animDelay: number;
}

export type StatusType = 'pending' | 'approved' | 'rejected';

export interface ClubRequestDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: ClubRequestDetails | ClubRequest | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
}

export interface ClubRequestDetails {
  clubRequest: {
    id: string;
    status: StatusType;
    createdAt: string;
    updatedAt: string;
    whyJoin: string;
    additionalInfo?: string;
    clubDescription?: string;
    club: {
      id: string;
      name: string;
      type: string;
      about: string;
      enteredMembers: number;
      members?: string | string[];
      description?: string;
      nextMeeting?: string;
    };
    user: {
      name?: string;
      email: string;
    };
  };
}

export interface ClubRequestDetailsStatusBadgeProps {
  status: StatusType;
}

export interface ClubApiResponse {
  data: {
    clubs: Club[];
    totalItems: number;
    totalPages: number;
    currentPage: number;
  };
}

export interface ClubResponse {
  data: {
    club: Club;
  };
}

export interface ClubRequestResponse {
  data: {
    clubRequest: ClubRequest;
  };
}

export interface ClubRequestsResponse {
  clubRequests: ClubRequest[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

export interface ClubRequestDetailsInfoCardProps {
  icon: React.ComponentType<{ size?: number | string; className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}


export interface ApiErrorResponse {
  error?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ItemAction {
  id: string;
  type: 'club' | 'request';
  action: 'delete' | 'reject' | 'approve';
}

export interface Filters {
  [key: string]: string;
  category: string;
  status: string;
  dateRange: string;
} 