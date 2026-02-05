import React from 'react';
import { OrganizerTypeOption, StatusBadgeProps, InfoCardProps, Team, PlayerRequest, TeamRequestDetailsStatusBadgeProps, TeamRequestDetailsInfoCardProps } from '../../domain/types/management/sportmanagement';
import { IoPeopleOutline as Users, IoPersonOutline as User, IoBusinessOutline as Building } from 'react-icons/io5'

export const SPORT_TYPES = ['All', 'Football', 'Basketball', 'Badminton', 'Athletics', 'Swimming'] as const;
export const TEAM_STATUSES = ['All', 'Active', 'Inactive'] as const;
export const REQUEST_STATUSES = ['All', 'Pending', 'Approved', 'Rejected'] as const;
export const COACHES = ['All', 'Dr. John Smith', 'Prof. Sarah Johnson', 'Mr. Mike Wilson'] as const;
export const DATE_RANGES = ['All', 'Last Week', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'] as const;
export const TEAM_CATEGORIES = ['Varsity', 'Club', 'Intramural'] as const;
export const DIVISIONS = ['Division I', 'Division II', 'Division III'] as const;

export const SPORT_TYPE_OPTIONS = [
  { value: 'football', label: 'Football', emoji: '⚽' },
  { value: 'basketball', label: 'Basketball', emoji: '🏀' },
  { value: 'badminton', label: 'Badminton', emoji: '🏸' },
  { value: 'athletics', label: 'Athletics', emoji: '🏃' },
  { value: 'swimming', label: 'Swimming', emoji: '🏊' },
  { value: 'tennis', label: 'Tennis', emoji: '🎾' },
  { value: 'volleyball', label: 'Volleyball', emoji: '🏐' },
  { value: 'cricket', label: 'Cricket', emoji: '🏏' },
  { value: 'hockey', label: 'Hockey', emoji: '🏒' },
  { value: 'rugby', label: 'Rugby', emoji: '🏉' },
] as const;

export const TEAM_CATEGORY_OPTIONS = [
  { value: 'varsity', label: 'Varsity', emoji: '🏆' },
  { value: 'club', label: 'Club', emoji: '🎪' },
  { value: 'intramural', label: 'Intramural', emoji: '🎯' },
] as const;

export const DIVISION_OPTIONS = [
  { value: 'division_i', label: 'Division I', emoji: '🥇' },
  { value: 'division_ii', label: 'Division II', emoji: '🥈' },
  { value: 'division_iii', label: 'Division III', emoji: '🥉' },
] as const;

export const COACH_OPTIONS = [
  { value: 'dr_john_smith', label: 'Dr. John Smith', emoji: '👨‍🏫' },
  { value: 'prof_sarah_johnson', label: 'Prof. Sarah Johnson', emoji: '👩‍🏫' },
  { value: 'mr_mike_wilson', label: 'Mr. Mike Wilson', emoji: '👨‍💼' },
  { value: 'ms_lisa_brown', label: 'Ms. Lisa Brown', emoji: '👩‍💼' },
  { value: 'coach_david_lee', label: 'Coach David Lee', emoji: '🏃‍♂️' },
] as const;

export const TEAM_ICONS = [
  '⚽', '🏀', '🏸', '🏃', '🏊', '🎾', '🏐', '🏏', '🏒', '🏉',
  '🥎', '🏓', '🏸', '🏊‍♀️', '🏃‍♀️', '🚴', '🏋️', '🤸', '🤺', '🏹',
  '🎯', '��', '🏸', '🏊‍♂️', '🏃‍♂️', '🚴‍♀️', '🏋️‍♀️', '🤸‍♀️', '🤺', '🏹'
] as const;

export const ORGANIZER_TYPE_OPTIONS: OrganizerTypeOption[] = [
  { value: 'department', label: 'Department', emoji: '🏛️' },
  { value: 'club', label: 'Club', emoji: '🎉' },
  { value: 'student', label: 'Student', emoji: '🎓' },
  { value: 'administration', label: 'Administration', emoji: '📋' },
  { value: 'external', label: 'External', emoji: '🌍' },
];

export const ICON_OPTIONS = [
  '📅', '🎉', '🏆', '🎭', '🎵', '🏃', '🍽️', '🎨', '📚', '💼',
  '🔬', '🎯', '⚽', '🎪', '🎬', '🏛️', '🌟', '🎊', '🎓', '💡',
  '🚀', '🎮', '🏋️', '🎤', '📸', '🎸', '🎺', '🎻', '🎲'
] as const;

export const COLOR_OPTIONS = [
  '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444',
  '#EC4899', '#6366F1', '#84CC16', '#F97316', '#8B5A2B',
  '#DC2626', '#7C3AED', '#059669', '#DB2777', '#9333EA'
] as const;

export const DEFAULT_TEAM_FORM_VALUES = {
  title: '',
  type: '',
  category: '',
  organizer: '',
  organizerType: 'department' as const,
  icon: '⚽',
  color: '#8B5CF6',
  division: '',
  headCoach: '',
  homeGames: 0,
  record: '0-0-0',
  upcomingGames: [{ date: '', description: '' }],
  participants: 0,
  status: 'Active' as const,
};

export const PARTICLE_COUNT = 30;
export const PARTICLE_SIZE_RANGE = { min: 5, max: 15 };
export const PARTICLE_ANIMATION_RANGE = { min: 15, max: 25 };
export const PARTICLE_DELAY_RANGE = { min: 0, max: 5 };

export const TEAM_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6366F1',
  '#14B8A6', '#FBBF24', '#F87171', '#A78BFA', '#22D3EE',
  '#4ADE80', '#FB923C', '#F472B6', '#818CF8', '#2DD4BF'
] as const;

export const STATUS_BADGE_COLORS = {
  active: 'bg-green-900/30 text-green-400 border-green-500/30',
  inactive: 'bg-gray-900/30 text-gray-400 border-gray-500/30',
  pending: 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30',
  approved: 'bg-green-900/30 text-green-400 border-green-500/30',
  rejected: 'bg-red-900/30 text-red-400 border-red-500/30',
} as const;

export const SPORT_STATS_LABELS = {
  totalTeams: 'Total Teams',
  activeTeams: 'Active Teams',
  inactiveTeams: 'Inactive Teams',
  totalPlayers: 'Total Players',
  averagePlayersPerTeam: 'Average Players per Team',
  pendingRequests: 'Pending Requests',
  approvedRequests: 'Approved Requests',
  rejectedRequests: 'Rejected Requests',
} as const;

export const SPORT_VALIDATION_MESSAGES = {
  titleRequired: 'Team title is required',
  typeRequired: 'Sport type is required',
  categoryRequired: 'Team category is required',
  organizerRequired: 'Team organizer is required',
  organizerTypeRequired: 'Organizer type is required',
  divisionRequired: 'Division is required',
  headCoachRequired: 'Head coach is required',
  participantsRequired: 'Number of participants is required',
  participantsPositive: 'Number of participants must be a positive number',
  homeGamesRequired: 'Number of home games is required',
  homeGamesPositive: 'Number of home games must be a positive number',
  recordRequired: 'Team record is required',
  invalidDate: 'Please select a valid date',
} as const;

export const SPORT_SUCCESS_MESSAGES = {
  teamCreated: 'Team created successfully',
  teamUpdated: 'Team updated successfully',
  teamDeleted: 'Team deleted successfully',
  requestApproved: 'Player request approved',
  requestRejected: 'Player request rejected',
} as const;

export const SPORT_ERROR_MESSAGES = {
  fetchTeamsFailed: 'Failed to fetch teams',
  fetchRequestsFailed: 'Failed to fetch player requests',
  createTeamFailed: 'Failed to create team',
  updateTeamFailed: 'Failed to update team',
  deleteTeamFailed: 'Failed to delete team',
  approveRequestFailed: 'Failed to approve request',
  rejectRequestFailed: 'Failed to reject request',
  fetchTeamDetailsFailed: 'Failed to fetch team details',
  fetchRequestDetailsFailed: 'Failed to fetch request details',
} as const;

export const getTeamColumns = (
  Users: React.ComponentType<{ size?: number | string; className?: string }>,
  Trophy: React.ComponentType<{ size?: number | string; className?: string }>,
  formatDate: (date: string) => string
) => [
    {
      header: 'Team',
      key: 'name',
      render: (team: Team) => (
        <div className="flex items-center gap-3">
          <span
            className="text-2xl w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: `${team.color}20`, color: team.color }}
          >
            {team.icon}
          </span>
          <div>
            <p className="font-medium text-gray-200">{team.title}</p>
            <p className="text-xs text-gray-400">ID: {(team._id || team.id)?.slice(0, 8)}</p>
          </div>
        </div>
      ),
      width: '20%',
    },
    {
      header: 'Sport',
      key: 'sportType',
      render: (team: Team) => (
        <div className="flex items-center text-gray-300">
          <Trophy size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{team.type}</span>
        </div>
      ),
    },
    {
      header: 'Players',
      key: 'playerCount',
      render: (team: Team) => (
        <div className="flex items-center text-gray-300">
          <Users size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{team.playerCount}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (team: Team) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${team.status === 'Active'
            ? 'bg-green-900/30 text-green-400 border-green-500/30'
            : 'bg-gray-900/30 text-gray-400 border-gray-500/30'
            }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full mr-1.5"
            style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
          ></span>
          {team.status}
        </span>
      ),
    },
    {
      header: 'Formed On',
      key: 'formedOn',
      render: (team: Team) => (
        <div className="flex items-center text-gray-300">
          <Users size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{formatDate(team.createdAt)}</span>
        </div>
      ),
    },
  ];

export const getPlayerRequestColumns = (
  Users: React.ComponentType<{ size?: number | string; className?: string }>,
  Trophy: React.ComponentType<{ size?: number | string; className?: string }>,
  formatDate: (date: string) => string
) => [
    {
      header: 'Student',
      key: 'studentName',
      render: (request: PlayerRequest) => (
        <div>
          <p className="font-medium text-gray-200">{request.requestedBy}</p>
          <p className="text-xs text-gray-400">ID: {request?.requestId?.slice(0, 7)}</p>
        </div>
      ),
      width: '20%',
    },
    {
      header: 'Team',
      key: 'team',
      render: (request: PlayerRequest) => (
        <div className="flex items-center text-gray-300">
          <Users size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{request.sportName}</span>
        </div>
      ),
    },
    {
      header: 'Sport',
      key: 'sport',
      render: (request: PlayerRequest) => (
        <div className="flex items-center text-gray-300">
          <Trophy size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{request.type}</span>
        </div>
      ),
    },
    {
      header: 'Requested Date',
      key: 'requestedAt',
      render: (request: PlayerRequest) => (
        <div className="flex items-center text-gray-300">
          <Users size={14} className="text-purple-400 mr-2" />
          <span className="text-sm">{formatDate(request.requestedAt || '')}</span>
        </div>
      ),
    },
    {
      header: 'Status',
      key: 'status',
      render: (request: PlayerRequest) => (
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${request.status === 'pending'
            ? 'bg-yellow-900/30 text-yellow-400 border-yellow-500/30'
            : request.status === 'approved'
              ? 'bg-green-900/30 text-green-400 border-green-500/30'
              : 'bg-red-900/30 text-red-400 border-red-500/30'
            }`}
        >
          <span
            className="h-1.5 w-1.5 rounded-full mr-1.5"
            style={{ boxShadow: `0 0 8px currentColor`, backgroundColor: 'currentColor' }}
          ></span>
          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
        </span>
      ),
    },
  ];

export const resetFilters = () => ({
  sportType: 'all',
  category: 'all',
  division: 'all',
  coach: 'all',
  dateRange: 'all',
  status: 'all',
});

export const formatDateRangeValue = (value: string) => value;

export const getFilterOptions = (activeTab: 'teams' | 'requests') => {
  if (activeTab === 'teams') {
    return {
      sportType: SPORT_TYPES,
      category: TEAM_CATEGORIES,
      division: DIVISIONS,
      coach: COACHES,
      dateRange: ['all', 'today', 'week', 'month', 'year'],
    };
  } else {
    return {
      status: ['all', 'pending', 'approved', 'rejected'],
      sportType: SPORT_TYPES,
      dateRange: ['all', 'today', 'week', 'month', 'year'],
    };
  }
};

export const ghostParticles = Array(PARTICLE_COUNT)
  .fill(0)
  .map((_) => ({
    size: Math.random() * (PARTICLE_SIZE_RANGE.max - PARTICLE_SIZE_RANGE.min) + PARTICLE_SIZE_RANGE.min,
    top: Math.random() * 100,
    left: Math.random() * 100,
    animDuration: Math.random() * (PARTICLE_ANIMATION_RANGE.max - PARTICLE_ANIMATION_RANGE.min) + PARTICLE_ANIMATION_RANGE.min,
    animDelay: Math.random() * PARTICLE_DELAY_RANGE.max,
  }));

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const statusConfig = {
    active: { bg: 'bg-green-600/30', text: 'text-green-100', border: 'border-green-500/50' },
    pending: { bg: 'bg-yellow-600/30', text: 'text-yellow-100', border: 'border-yellow-500/50' },
    rejected: { bg: 'bg-red-600/30', text: 'text-red-100', border: 'border-red-500/50' },
  };

  const config = statusConfig[status?.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config.bg} ${config.text} ${config.border}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export const InfoCard = ({ icon: Icon, label, value }: InfoCardProps) => (
  <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
    <div className="flex items-center mb-2">
      <Icon size={18} className="text-purple-300" />
      <span className="ml-2 text-sm font-medium text-purple-300">{label}</span>
    </div>
    <p className="text-white font-semibold">{value}</p>
  </div>
);

export const getOrganizerIcon = (type: string) => {
  switch (type?.toLowerCase()) {
    case 'student': return Users;
    case 'club': return Building;
    default: return User;
  }
};


export const RequestStatusBadge: React.FC<TeamRequestDetailsStatusBadgeProps> = ({ status }) => {
  const statusConfig = {
    pending: { bg: 'bg-yellow-600/30', text: 'text-yellow-100', border: 'border-yellow-500/50' },
    approved: { bg: 'bg-green-600/30', text: 'text-green-100', border: 'border-green-500/50' },
    rejected: { bg: 'bg-red-600/30', text: 'text-red-100', border: 'border-red-500/50' },
  };

  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${config?.bg} ${config?.text} ${config?.border}`}
    >
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
};

export const RequestInfoCard: React.FC<TeamRequestDetailsInfoCardProps> = ({ icon: Icon, label, value }) => (
  <div className="bg-gray-800/80 border border-purple-600/30 rounded-lg p-4 shadow-sm">
    <div className="flex items-center mb-2">
      <Icon size={18} className="text-purple-300" />
      <span className="ml-2 text-sm font-medium text-purple-300">{label}</span>
    </div>
    <p className="text-white font-semibold">{value}</p>
  </div>
);