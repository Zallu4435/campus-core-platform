import { Types } from "mongoose";

// Source Interfaces (mirroring Mongoose Documents)
export interface IMongooseDocument {
    _id: Types.ObjectId | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}

export interface IStudentSource extends IMongooseDocument {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    profilePicture?: string;
}

export interface ICourseSource extends IMongooseDocument {
    title: string;
    specialization: string;
    faculty: string;
    credits: number;
    term?: string;
    maxEnrollment: number;
    currentEnrollment?: number;
    schedule: string;
    description?: string;
    prerequisites?: string[];
}

export interface IEnrollmentSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    courseId?: Types.ObjectId | string | { _id: Types.ObjectId | string };
    status: string;
    requestedAt: Date | string;
    reason?: string;
}

export interface IGradeSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    cumulativeGPA: number;
    termGPA: number;
    termName: string;
    creditsEarned: number;
    creditsInProgress: number;
}

export interface IAcademicHistorySource extends IMongooseDocument {
    studentId?: Types.ObjectId | string;
    term: string;
    credits: number;
    gpa: number;
}

export interface IProgramSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    degree: string;
    catalogYear: string;
    credits: number;
}

export interface IProgressSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    overallProgress: number;
    totalCredits: number;
    completedCredits: number;
    remainingCredits: number;
    estimatedGraduation: string;
}

// Sub-interface for Requirement
export interface IRequirementSubSource {
    percentage: number;
    completed: number;
    total: number;
}

export interface IRequirementSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    core: IRequirementSubSource;
    elective: IRequirementSubSource;
    general: IRequirementSubSource;
}

export interface ITranscriptRequestSource extends IMongooseDocument {
    studentId: Types.ObjectId | string;
    deliveryMethod: string;
    requestedAt: Date | string;
    estimatedDelivery: Date | string;
    requestId: string;
    address?: string;
    email?: string;
}
