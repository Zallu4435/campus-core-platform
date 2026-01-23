/**
 * Site Management Constants
 */
export const SITE_MANAGEMENT_CONSTANTS = {
    /** Default query parameters for pagination and search */
    DEFAULT_QUERY_PARAMS: {
        PAGE: 1,
        LIMIT: 10,
        MAX_LIMIT: 100,
        SEARCH: '',
        CATEGORY: 'all',
        STATUS: 'all',
        DATE_RANGE: 'all',
    },

    /** Allowed section keys for site management */
    SECTION_KEYS: {
        HIGHLIGHTS: 'highlights',
        VAGO_NOW: 'vagoNow',
        LEADERSHIP: 'leadership',
    },

    /** File upload configuration */
    FILE_UPLOAD: {
        ALLOWED_FORMATS: ['jpg', 'jpeg', 'png', 'webp'],
        MAX_SIZE_MB: 5,
    }
};
