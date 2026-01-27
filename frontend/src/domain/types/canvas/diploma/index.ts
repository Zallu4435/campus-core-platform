import { ThemeStyles } from '../../config/types';

export interface ChapterItemProps {
  chapter: Chapter;
  courseId: string;
  styles: ThemeStyles;
  isFirst: boolean;
  isPrevCompleted: boolean;
  isCompleted: boolean;
  isBookmarked: boolean;
  onViewChapter: (chapter: Chapter) => void;
  onBookmark: (courseId: string, chapterId: string) => void;
}

export interface Chapter {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: string;
  duration: string | number;
  order?: number;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  videoUrl?: string;
  notes?: string;
  [key: string]: unknown;
}

export interface DiplomaCourse {
  id: string;
  _id?: string;
  title: string;
  description: string;
  chapters: Chapter[];
  duration?: string;
  createdAt?: string;
  updatedAt?: string;
  isEnrolled?: boolean;
  thumbnail?: string;
  category?: string;
  instructor?: string;
  department?: string;
  status?: string;
  videoCount?: number;
  completedVideoCount?: number;
  totalVideos?: number;
  [key: string]: unknown;
}

export interface DiplomaCardProps {
  course: DiplomaCourse;
  index: number;
  styles: ThemeStyles;
  userAdmitted: boolean;
  completedChapters: Set<string>;
  onViewDetails: (course: DiplomaCourse) => void;
  onStartCourse: (courseId: string) => void;
}

export interface VideoPlayerProps {
  styles: ThemeStyles;
  isPlaying: boolean;
  videoProgress: number;
  onPlayPause: () => void;
}

export type ViewMode = 'grid' | 'table' | 'courses' | 'details';

export type ChapterType = 'video' | 'interactive' | 'quiz' | 'project';

export interface BackendChapter {
  _id?: string;
  id?: string;
  title: string;
  description?: string;
  type?: string;
  duration?: string;
  videoUrl?: string;
  notes?: string;
  order?: number;
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

export interface BackendCourse {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  category?: string;
  duration?: string;
  instructor?: string;
  department?: string;
  chapters?: BackendChapter[];
  videos?: BackendChapter[];
  videoCount?: number;
  completedVideoCount?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
  isEnrolled?: boolean;
  thumbnail?: string;
}