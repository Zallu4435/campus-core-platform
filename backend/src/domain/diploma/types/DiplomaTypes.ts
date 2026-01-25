export enum DiplomaStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DRAFT = "draft",
    COMPLETED = "completed"
}

export interface DiplomaProps {
    id?: string;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail: string;
    duration: string;
    prerequisites: string[];
    status: boolean;
    createdAt?: Date;
    updatedAt?: Date;
    videoIds?: string[];
    students?: string[];
}

export interface Chapter {
    id: string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    order: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface DiplomaCourse {
    id: string;
    title: string;
    description: string;
    category: string;
    status: 'draft' | 'published' | 'archived';
    instructor: string;
    department: string;
    chapters: Chapter[];
    videoCount?: number;
    completedVideoCount?: number;
    videos?: string[];
    createdAt: Date;
    updatedAt: Date;
}

export interface EnrollStudentProps {
    diplomaId: string;
    studentId: string;
}

export interface UnenrollStudentProps {
    diplomaId: string;
    studentId: string;
}

export interface UserDiplomaProps {
    userId: string;
    courseId: string;
    chapterId?: string;
    bookmarked?: boolean;
    progress?: number;
    completed?: boolean;
}
