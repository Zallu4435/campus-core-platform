import { AssignmentStatus, SubmissionStatus } from '../../../domain/assignments/enums/AssignmentEnums';
import { AssignmentFile, SubmissionFile } from '../../../domain/assignments/types/AssignmentTypes';

export interface FileDTO {
    originalname: string;
    path: string;
    size: number;
}

export interface CreateAssignmentDTO {
    title: string;
    subject: string;
    description: string;
    maxMarks: number;
    dueDate: Date;
    files?: FileDTO[];
}

export interface UpdateAssignmentDTO {
    id: string;
    title?: string;
    subject?: string;
    description?: string;
    maxMarks?: number;
    dueDate?: Date;
    files?: FileDTO[];
    status?: AssignmentStatus;
}

export interface AssignmentResponseDTO {
    id: string;
    title: string;
    subject: string;
    description: string;
    maxMarks: number;
    dueDate: Date;
    files: AssignmentFile[];
    status: AssignmentStatus;
    createdAt: Date;
    updatedAt: Date;
    totalSubmissions: number;
    averageMarks: number;
}

export interface SubmissionResponseDTO {
    id: string;
    assignmentId: string;
    studentId: string;
    studentName: string;
    submittedDate: Date;
    status: SubmissionStatus;
    isLate: boolean;
    files: SubmissionFile[];
    marks?: number;
    feedback?: string;
    reviewedAt?: Date | null;
}

export interface PaginatedResponseDTO<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

export interface ReviewSubmissionDTO {
    assignmentId: string;
    submissionId: string;
    marks: number;
    feedback: string;
    status: SubmissionStatus;
    isLate: boolean;
}
