import { FinancialErrorType } from "../enums/FinancialErrorType";

export class FinancialError extends Error {
    constructor(public message: string, public statusCode: number = 400) {
        super(message);
        this.name = 'FinancialError';
    }
}

export class FinancialValidationError extends FinancialError {
    constructor(message: string = FinancialErrorType.MissingRequiredFields) {
        super(message, 400);
        this.name = 'FinancialValidationError';
    }
}

export class FinancialNotFoundError extends FinancialError {
    constructor(message: string = FinancialErrorType.PaymentNotFound) {
        super(message, 404);
        this.name = 'FinancialNotFoundError';
    }
}

export class FinancialUnauthorizedError extends FinancialError {
    constructor(message: string = FinancialErrorType.UnauthorizedAccess) {
        super(message, 403);
        this.name = 'FinancialUnauthorizedError';
    }
}
