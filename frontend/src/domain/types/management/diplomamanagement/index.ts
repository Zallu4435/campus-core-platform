import React, { JSX } from 'react';

export interface Diploma {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnail: string;
  duration: string;
  prerequisites: string[];
  status: boolean;
  createdAt: string;
  updatedAt: string;
  videoIds: string[];
  videoCount: number;
}

export interface Enrollment {
  id: string;
  studentName: string;
  studentEmail: string;
  courseTitle: string;
  enrollmentDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  progress: number;
}

export interface DiplomaDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  diploma: {
    id: string;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail: string;
    duration: string;
    prerequisites: string[];
    status: boolean;
    createdAt: string;
    updatedAt: string;
    enrolledStudents?: { id: string; name: string; email: string; enrollmentDate: string; progress: number }[];
  };
  isLoading: boolean;
}

export interface EnrollmentDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  enrollment: {
    _id: string;
    studentName: string;
    studentEmail: string;
    courseTitle: string;
    enrollmentDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    progress: number;
  };
  isLoading: boolean;
}

export interface InfoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | JSX.Element;
}

export interface DiplomaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: unknown) => void;
  initialData?: unknown;
  isEditing?: boolean;
  categories: string[];
}

export interface DiplomaApiResponse {
  success: boolean;
  data: {
    data: DiplomaCourse[];
    totalPages: number;
    page: number;
    total: number;
    limit: number;
  };
  message?: string;
}

export interface DiplomaCourseResponse {
  success: boolean;
  data: DiplomaCourse;
  message?: string;
}

export interface ChapterResponse {
  success: boolean;
  data: {
    chapter: Chapter;
  };
  message?: string;
}

export interface CompletedChaptersResponse {
  success: boolean;
  data: {
    chapters: string[];
  };
  message?: string;
}

export interface BookmarkedChaptersResponse {
  success: boolean;
  data: {
    chapters: string[];
  };
  message?: string;
}

export interface DiplomaCourse {
  id: string;
  _id?: string;
  title: string;
  description: string;
  category: string;
  duration: string;
  instructor: string;
  department: string;
  chapters: Chapter[];
  videos: Chapter[];
  videoCount: number;
  completedVideoCount: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  isEnrolled: boolean;
  thumbnail?: string;
}

export interface Chapter {
  id: string;
  _id?: string;
  title: string;
  description: string;
  type: string;
  duration: string;
  videoUrl?: string;
  notes?: string;
  order?: number;
  isCompleted?: boolean;
  isBookmarked?: boolean;
}

export type Filters = {
  category: string;
  status: string;
  dateRange: string;
  startDate?: string;
  endDate?: string;
};

