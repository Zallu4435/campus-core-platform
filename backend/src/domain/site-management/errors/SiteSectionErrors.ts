/**
 * Site Management Domain Errors
 */

export class DomainError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly code: string
    ) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class InvalidSectionKeyError extends DomainError {
    constructor() {
        super("Section key is required!", 400, "INVALID_SECTION_KEY");
    }
}

export class InvalidHighlightError extends DomainError {
    constructor() {
        super("Highlight must have a title and description!", 400, "INVALID_HIGHLIGHT");
    }
}

export class InvalidVagoNowError extends DomainError {
    constructor() {
        super("VAGO Now must have a title and content!", 400, "INVALID_VAGO_NOW");
    }
}

export class InvalidLeadershipError extends DomainError {
    constructor() {
        super("Leadership must have a name and position!", 400, "INVALID_LEADERSHIP");
    }
}

export class SiteSectionNotFoundError extends DomainError {
    constructor(id: string) {
        super(`Site section with ID '${id}' not found`, 404, "SITE_SECTION_NOT_FOUND");
    }
}