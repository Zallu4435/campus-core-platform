export class StudentError extends Error {
    constructor(public message: string, public code: string = 'STUDENT_ERROR') {
        super(message);
        this.name = 'StudentError';
    }
}

export class StudentNotFoundError extends StudentError {
    constructor(id: string) {
        super(`Student with ID ${id} not found`, 'STUDENT_NOT_FOUND');
        this.name = 'StudentNotFoundError';
    }
}

export class StudentValidationError extends StudentError {
    constructor(field: string, message: string) {
        super(`Validation failed for ${field}: ${message}`, 'STUDENT_VALIDATION_ERROR');
        this.name = 'StudentValidationError';
    }
}

export class StudentDashboardDataError extends StudentError {
    constructor(message: string) {
        super(message, 'STUDENT_DASHBOARD_DATA_ERROR');
        this.name = 'StudentDashboardDataError';
    }
}
