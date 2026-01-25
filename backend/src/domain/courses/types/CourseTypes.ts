export interface CourseProps {
    id?: string;
    title: string;
    specialization: string;
    faculty: string;
    credits: number;
    schedule: string;
    maxEnrollment: number;
    currentEnrollment?: number;
    description?: string;
    term?: string;
    prerequisites?: string[];
}

export enum EnrollmentStatus {
    Pending = "Pending",
    Approved = "Approved",
    Rejected = "Rejected",
}

export interface EnrollmentProps {
    id?: string;
    studentId: string | { id: string; email: string; name?: string };
    courseId: string | { id: string; title: string; specialization?: string };
    status: EnrollmentStatus;
    requestedAt?: Date;
    reason?: string;
}
