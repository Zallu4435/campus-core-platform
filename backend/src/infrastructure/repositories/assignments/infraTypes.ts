import { Types } from 'mongoose';

export interface IAssignmentFileSource {
    fileName: string;
    fileUrl: string;
    fileSize: number;
    fileType?: string;
    [key: string]: unknown;
}

export interface IAssignmentSource {
    _id: Types.ObjectId | string;
    title: string;
    subject: string;
    description: string;
    maxMarks: number;
    dueDate: Date | string;
    files?: IAssignmentFileSource[];
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    totalSubmissions?: number;
    averageMarks?: number;
    [key: string]: unknown;
}

export interface ISubmissionSource {
    _id: Types.ObjectId | string;
    assignmentId: Types.ObjectId | string;
    studentId: Types.ObjectId | string;
    studentName: string;
    submittedDate: Date | string;
    status: string;
    isLate: boolean;
    files?: IAssignmentFileSource[];
    marks?: number;
    feedback?: string;
    reviewedAt?: Date | string;
    [key: string]: unknown;
}
