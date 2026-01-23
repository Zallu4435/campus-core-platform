export class DomainError extends Error {
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

export class AssignmentNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Assignment with ID "${id}" not found.`, 404, "ASSIGNMENT_NOT_FOUND");
    }
}

export class SubmissionNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Submission with ID "${id}" not found.`, 404, "SUBMISSION_NOT_FOUND");
    }
}

export class AssignmentValidationError extends DomainError {
    constructor(message: string) {
        super(message, 400, "ASSIGNMENT_VALIDATION_ERROR");
    }
}

export class UnauthorizedAssignmentAccessError extends DomainError {
    constructor(message: string = "You are not authorized to access this assignment.") {
        super(message, 403, "UNAUTHORIZED_ASSIGNMENT_ACCESS");
    }
}
