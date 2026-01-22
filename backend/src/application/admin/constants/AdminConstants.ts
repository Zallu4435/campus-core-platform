// AdminConstants.ts

export const AdminConstants = {
    ADMISSION_STATUS: {
        PENDING: "pending",
        APPROVED: "approved",
        REJECTED: "rejected",
        OFFERED: "offered",
    },

    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
    },

    EMAIL: {
        EXPIRY_DAYS: 7,
    },

    REGEX: {
        EMAIL: /^\S+@\S+\.\S+$/,
    },

    FILTER_RANGES: {
        LAST_WEEK: 7,
        LAST_MONTH: 30,
        LAST_3_MONTHS: 90,
    }
};
