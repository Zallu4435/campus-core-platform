export const DIPLOMA_LIMITS = {
    DEFAULT_PAGE_SIZE: 10,
    MIN_PAGE: 1,
    MIN_LIMIT: 1,
};

export const DIPLOMA_MESSAGES = {
    NOT_FOUND: (id: string) => `Diploma with ID ${id} not found`,
    CREATED: "Diploma created successfully",
    UPDATED: "Diploma updated successfully",
    DELETED: "Diploma deleted successfully",
};

export const DIPLOMA_FILTERS = {
    ALL: "all",
};

export const DIPLOMA_SORT = {
    DEFAULT: { createdAt: -1 } as const,
};

export const USER_DIPLOMA_MESSAGES = {
    ENROLLED: "Student enrolled successfully",
    UNENROLLED: "Student unenrolled successfully",
    NOT_FOUND: "User Diploma record not found",
};
