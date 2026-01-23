export class AcademicDomainError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
    }
}

export class StudentNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Student with ID ${id} not found`, 404, 'STUDENT_NOT_FOUND');
    }
}

export class CourseNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Course with ID ${id} not found`, 404, 'COURSE_NOT_FOUND');
    }
}

export class GradeNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Grade information for user ${id} not found`, 404, 'GRADE_NOT_FOUND');
    }
}

export class ProgramNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Program information for user ${id} not found`, 404, 'PROGRAM_NOT_FOUND');
    }
}

export class ProgressNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Progress information for user ${id} not found`, 404, 'PROGRESS_NOT_FOUND');
    }
}

export class RequirementsNotFoundError extends AcademicDomainError {
    constructor(id: string) {
        super(`Requirements information for user ${id} not found`, 404, 'REQUIREMENTS_NOT_FOUND');
    }
}

export class AlreadyEnrolledError extends AcademicDomainError {
    constructor() {
        super('Already enrolled in this course', 400, 'ALREADY_ENROLLED');
    }
}

export class NotEnrolledError extends AcademicDomainError {
    constructor() {
        super('Not enrolled in this course', 400, 'NOT_ENROLLED');
    }
}

export class EnrollmentFailedError extends AcademicDomainError {
    constructor(message: string) {
        super(message, 400, 'ENROLLMENT_FAILED');
    }
}

export class InvalidActionError extends AcademicDomainError {
    constructor(message: string) {
        super(message, 400, 'INVALID_ACTION');
    }
}
