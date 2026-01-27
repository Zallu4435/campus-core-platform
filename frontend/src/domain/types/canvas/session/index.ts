
import { ThemeStyles } from '../../config/types';

export interface Styles {
    status: { warning: string; error: string; info: string; success: string };
    badgeBackground: string;
    button: { secondary: string };
    textSecondary: string;
    success: string;
    error: string;
    info: string;
    border: string;
    cardHover: string;
    cardShadow: string;
    card: { background: string };
    icon: { secondary: string };
    backgroundSecondary: string;
    accent: string;
}

export interface Session {
    id?: string;
    _id?: string;
    title: string;
    name?: string;
    instructor: string;
    instructorAvatar: string;
    course: string;
    date: string;
    time: string;
    duration: number;
    status: 'live' | 'upcoming' | 'completed';
    hasRecording: boolean;
    attendees: number;
    maxAttendees: number;
    description: string;
    tags: string[];
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    isLive: boolean;
    connectionQuality: 'excellent' | 'good' | 'poor' | null;
    // New fields from lightweight API
    startTime?: string;
    joinUrl?: string;
    // New user-specific fields
    isEnrolled?: boolean;
    userAttendanceStatus?: string;
}

export interface Faculty {
    _id?: string;
    id: string;
    firstName: string;
    lastName: string;

}

export interface UserAccess {
    isEnrolled: boolean;
    watchedSessions: string[];
    likedSessions: string[];
    userName: string;
    userRole: string;
}

export interface Filters {
    status: 'all' | 'live' | 'upcoming' | 'completed';
    instructor: string;
    dateRange: string;
}

export interface SessionStats {
    liveCount: number;
    upcomingCount: number;
    completedCount: number;
    watchedCount: number;
}

export interface SessionCardProps {
    session: Session;
    index: number;
    userAccess: UserAccess;
    styles: ThemeStyles;
    onToggleWatched: (sessionId: string) => void;
    onToggleLike?: (sessionId: string) => void;
    onJoinSession?: (sessionId: string, userId: string) => void;
}

export interface SessionFiltersProps {
    filters: Filters;
    onFilterChange: (filters: Filters) => void;
    onClearFilters: () => void;
    uniqueInstructors: string[];
    userAccess: UserAccess;
    onToggleEnrollment: (isEnrolled: boolean) => void;
    styles: ThemeStyles;
}

export interface SessionHeaderProps {
    userName: string;
    currentTime: Date;
    isEnrolled: boolean;
    sessionCount: number;
    styles: ThemeStyles;
}

export interface SessionStatsProps {
    stats: SessionStats;
    styles: ThemeStyles;
}


export interface BackendSession {
    startTime: string;
    joinUrl?: string;
    [key: string]: unknown;
}

export interface UniversitySession {
    id: string;
    title: string;
    status: string;
    description?: string;
    instructor?: string;
    course?: string;
    duration?: number;
    tags?: string[];
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    hasRecording?: boolean;
    startTime: string;
    joinUrl?: string;
    isLive?: boolean;
    isEnrolled?: boolean;
    userAttendanceStatus?: string;
}
