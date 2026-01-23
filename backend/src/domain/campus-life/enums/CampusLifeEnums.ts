/**
 * Campus Life Enums
 * All enums used in the campus-life module
 */

/**
 * Event Status Enum
 * Defines the possible states of a campus event
 */
export enum EventStatus {
    /** Event is scheduled for the future */
    Upcoming = 'upcoming',

    /** Event has already occurred */
    Past = 'past',
}

/**
 * Sport Type Enum
 * Categorizes sports into varsity or intramural types
 */
export enum SportType {
    /** Varsity-level competitive sports */
    Varsity = 'VARSITY SPORTS',

    /** Intramural recreational sports */
    Intramural = 'INTRAMURAL SPORTS',
}

/**
 * Club Status Enum
 * Defines the operational status of a campus club
 */
export enum ClubStatus {
    /** Club is currently active and accepting members */
    Active = 'active',

    /** Club is inactive or suspended */
    Inactive = 'inactive',
}

/**
 * Request Status Enum
 * Tracks the state of join requests for events, sports, and clubs
 */
export enum RequestStatus {
    /** Request is awaiting approval */
    Pending = 'pending',

    /** Request has been approved */
    Approved = 'approved',

    /** Request has been rejected */
    Rejected = 'rejected',
}
