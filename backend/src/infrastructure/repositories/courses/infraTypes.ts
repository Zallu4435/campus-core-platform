import { Document } from "mongoose";

/**
 * Mongoose Document interface for Course
 */
export interface ICourseDocument extends Document {
    title: string;
    specialization: string;
    faculty: string;
    credits: number;
    schedule: string;
    maxEnrollment: number;
    currentEnrollment: number;
    description?: string;
    term?: string;
    prerequisites?: string[];
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Document interface for Enrollment
 */
export interface IEnrollmentDocument extends Document {
    studentId: string | { _id: string; email: string; name?: string };
    courseId: string | { _id: string; title: string; specialization?: string };
    status: "Pending" | "Approved" | "Rejected";
    requestedAt: Date;
    reason?: string;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Mongoose Populated Document for Enrollment
 */
export interface PopulatedEnrollmentDocument extends Omit<IEnrollmentDocument, 'studentId' | 'courseId'> {
    studentId: {
        _id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    courseId: {
        _id: string;
        title: string;
        specialization: string;
        term: string;
        faculty: string;
        credits: number;
    };
}

/**
 * Filter interface for querying courses (Infrastructure concern)
 */
export interface CourseFilter {
    title?: string | { $regex: string; $options: string };
    specialization?: string | { $regex: string; $options: string };
    faculty?: string | { $regex: string; $options: string };
    term?: string | { $regex: string; $options: string };
    status?: string | { $regex: string; $options: string };
    courseId?: string | { $in: string[] };
    studentId?: string | { $in: string[] };
    createdAt?: { $gte?: Date; $lte?: Date };
    updatedAt?: { $gte?: Date; $lte?: Date };
    $or?: Array<{
        title?: { $regex: string; $options: string };
        specialization?: { $regex: string; $options: string };
        faculty?: { $regex: string; $options: string };
        term?: { $regex: string; $options: string };
        courseId?: { $in: string[] };
        studentId?: { $in: string[] };
    }>;
    [key: string]: unknown;
}
