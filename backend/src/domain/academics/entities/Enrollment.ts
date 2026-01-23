import { EnrollmentStatus } from "../enums/AcademicEnums";

export class Enrollment {
    constructor(
        public readonly id: string,
        public readonly studentId: string,
        public readonly courseId: string,
        public readonly status: EnrollmentStatus,
        public readonly requestedAt: Date,
        public readonly reason?: string,
    ) { }
}
