export class FacultyConstants {
    public static readonly DEFAULTS = {
        PAGE: 1,
        LIMIT: 10,
        SORT: { updatedAt: -1, createdAt: -1 },
        STATUS: "all",
        DEPARTMENT: "all_departments",
        DATE_RANGE: "all",
    };

    public static readonly ACTIONS = {
        ACCEPT: "accept",
        REJECT: "reject",
    };

    public static readonly DOCUMENT_TYPES = {
        CV: "cv",
        CERTIFICATE: "certificate",
    };

    public static readonly REGEX = {
        PHONE: /^\+?[0-9\- ]{7,15}$/,
        EMAIL: /^\S+@\S+\.\S+$/,
    };

    public static readonly DATE_RANGES = {
        LAST_WEEK: "last_week",
        LAST_MONTH: "last_month",
        LAST_3_MONTHS: "last_3_months",
        CUSTOM: "custom",
    };
}
