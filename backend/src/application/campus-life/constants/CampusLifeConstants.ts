/**
 * Campus Life Constants
 * All magic strings, numbers, and configuration values for the campus-life module
 */

/**
 * Pagination and Limits
 */
export const PAGINATION = {
    /** Default limit for overview queries */
    OVERVIEW_LIMIT: 10,

    /** Default limit for clubs when no filter is applied */
    CLUBS_DEFAULT_LIMIT: 5,

    /** Default page number */
    DEFAULT_PAGE: 1,

    /** Default items per page */
    DEFAULT_LIMIT: 10,

    /** Calculate skip value for pagination */
    calculateSkip: (page: number, limit: number): number => (page - 1) * limit,

    /** Calculate total pages */
    calculateTotalPages: (totalItems: number, limit: number): number =>
        Math.ceil(totalItems / limit),
} as const;

/**
 * Query Constants
 */
export const QUERY = {
    /** MongoDB case-insensitive regex option */
    CASE_INSENSITIVE: 'i',

    /** Status filter value for "all" */
    STATUS_ALL: 'all',
} as const;

/**
 * Database Field Selection Strings
 */
export const FIELDS = {
    /** Fields to select for campus events */
    EVENT_SELECT: 'title date time location organizer timeframe icon color description fullTime additionalInfo requirements createdAt updatedAt',

    /** Fields to select for sports */
    SPORT_SELECT: 'title type teams icon color division headCoach homeGames record upcomingGames createdAt updatedAt',

    /** Fields to select for clubs */
    CLUB_SELECT: 'name type members icon color status role nextMeeting about upcomingEvents createdAt updatedAt',
} as const;

/**
 * Success and Error Messages
 */
export const MESSAGES = {
    /** Join request submitted successfully */
    JOIN_REQUEST_SUBMITTED: 'Join request submitted successfully',

    /** Event join request success */
    EVENT_JOIN_SUCCESS: 'Your request to join the event has been submitted',

    /** Sport join request success */
    SPORT_JOIN_SUCCESS: 'Your request to join the sport has been submitted',

    /** Club join request success */
    CLUB_JOIN_SUCCESS: 'Your request to join the club has been submitted',

    /** Campus life overview retrieved */
    OVERVIEW_SUCCESS: 'Campus life overview retrieved successfully',

    /** Events retrieved */
    EVENTS_SUCCESS: 'Events retrieved successfully',

    /** Sports retrieved */
    SPORTS_SUCCESS: 'Sports retrieved successfully',

    /** Clubs retrieved */
    CLUBS_SUCCESS: 'Clubs retrieved successfully',
} as const;

/**
 * Default Query Parameters
 */
export const DEFAULT_QUERY_PARAMS = {
    /** Default page as string (from query params) */
    PAGE: '1',

    /** Default limit as string (from query params) */
    LIMIT: '10',

    /** Default search string */
    SEARCH: '',

    /** Default status filter */
    STATUS: 'all',
} as const;

/**
 * Combined Campus Life Constants
 */
export const CAMPUS_LIFE_CONSTANTS = {
    PAGINATION,
    QUERY,
    FIELDS,
    MESSAGES,
    DEFAULT_QUERY_PARAMS,
} as const;
