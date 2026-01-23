/**
 * Campus Life Domain Errors
 * Custom error classes for campus-life module following the Auth module pattern
 */

/**
 * Base Domain Error
 * All campus-life errors extend this base class
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

/**
 * Event Not Found Error
 * Thrown when a requested event does not exist
 */
export class EventNotFoundError extends DomainError {
    constructor(eventId: string) {
        super(
            `Event with ID '${eventId}' not found`,
            404,
            'EVENT_NOT_FOUND'
        );
    }
}

/**
 * Sport Not Found Error
 * Thrown when a requested sport does not exist
 */
export class SportNotFoundError extends DomainError {
    constructor(sportId: string) {
        super(
            `Sport with ID '${sportId}' not found`,
            404,
            'SPORT_NOT_FOUND'
        );
    }
}

/**
 * Club Not Found Error
 * Thrown when a requested club does not exist
 */
export class ClubNotFoundError extends DomainError {
    constructor(clubId: string) {
        super(
            `Club with ID '${clubId}' not found`,
            404,
            'CLUB_NOT_FOUND'
        );
    }
}

/**
 * Invalid Join Request Error
 * Thrown when a join request contains invalid data
 */
export class InvalidJoinRequestError extends DomainError {
    constructor(reason: string) {
        super(
            `Invalid join request: ${reason}`,
            400,
            'INVALID_JOIN_REQUEST'
        );
    }
}

/**
 * Duplicate Join Request Error
 * Thrown when a user tries to join the same event/sport/club multiple times
 */
export class DuplicateJoinRequestError extends DomainError {
    constructor(type: 'event' | 'sport' | 'club', id: string) {
        super(
            `You have already submitted a join request for this ${type}`,
            409,
            'DUPLICATE_JOIN_REQUEST'
        );
    }
}

/**
 * Campus Life Overview Error
 * Thrown when overview data cannot be retrieved
 */
export class CampusLifeOverviewError extends DomainError {
    constructor(reason: string) {
        super(
            `Failed to retrieve campus life overview: ${reason}`,
            500,
            'CAMPUS_LIFE_OVERVIEW_ERROR'
        );
    }
}
