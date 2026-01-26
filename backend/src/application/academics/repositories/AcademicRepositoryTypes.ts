import { Student } from "../../../domain/academics/entities/Student";
import { Program } from "../../../domain/academics/entities/Program";
import { Enrollment } from "../../../domain/academics/entities/Enrollment";

export interface StudentInfoResult {
    student: Student;
    program: Program;
    pendingEnrollments: Enrollment[];
    approvedEnrollments: Enrollment[];
}

export interface CourseFilter {
    title?: RegExp;
    specialization?: RegExp;
    faculty?: RegExp;
    description?: RegExp;
    credits?: number;
    term?: string;
    schedule?: string;
    maxEnrollment?: number;
    currentEnrollment?: number;
    prerequisites?: string[];
    $or?: Array<{
        title?: RegExp;
        specialization?: RegExp;
        faculty?: RegExp;
        description?: RegExp;
    }>;
    [key: string]: unknown; // For flexibility with Mongoose queries if absolutely needed, but prefer strict
}

export interface AcademicHistoryFilter {
    userId?: string;
    term?: { $gte?: string; $lte?: string };
    credits?: number;
    gpa?: number;
    id?: string;
    [key: string]: unknown;
}

export interface TranscriptRequestInput {
    userId: string;
    deliveryMethod: string;
    address?: string;
    email?: string;
    requestedAt?: Date;
    estimatedDelivery: Date;
}
