export const AssignmentsConstants = {
    FILE_UPLOAD: {
        MAX_FILES: 5,
        MAX_SIZE_MB: 10,
        ALLOWED_FORMATS: ['image/jpeg', 'image/png', 'application/pdf', 'application/zip', 'text/plain'],
    },
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
    },
    STATUS: {
        ASSIGNMENT: {
            DRAFT: 'draft',
            PUBLISHED: 'published',
            CLOSED: 'closed',
        },
        SUBMISSION: {
            PENDING: 'pending',
            REVIEWED: 'reviewed',
            LATE: 'late',
            NEEDS_CORRECTION: 'needs_correction',
        },
    },
};
