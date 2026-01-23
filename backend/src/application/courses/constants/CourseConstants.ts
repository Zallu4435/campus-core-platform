/**
 * Course Module Constants
 * Centralized configuration for the course module following Auth module standards
 */

export const COURSE_LIMITS = {
    DEFAULT_PAGE_SIZE: 5,
    SEARCH_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 100,
    MIN_CREDITS: 1,
    MAX_CREDITS: 10,
    MIN_ENROLLMENT: 1,
    MAX_ENROLLMENT: 1000,
} as const;

export const COURSE_MESSAGES = {
    CREATED_SUCCESS: "Course created successfully",
    UPDATED_SUCCESS: "Course updated successfully",
    DELETED_SUCCESS: "Course deleted successfully",
    FETCH_SUCCESS: "Courses retrieved successfully",
    FETCH_FAILED: "Failed to get courses",
    CREATE_FAILED: "Failed to create course",
    UPDATE_FAILED: "Failed to update course",
    DELETE_FAILED: "Failed to delete course",
    NOT_FOUND: "Course not found",
} as const;

export const ENROLLMENT_STATUS = {
    PENDING: "Pending",
    APPROVED: "Approved",
    REJECTED: "Rejected",
} as const;

export const ENROLLMENT_MESSAGES = {
    APPROVED_SUCCESS: "Enrollment approved successfully",
    REJECTED_SUCCESS: "Enrollment rejected successfully",
    FETCH_SUCCESS: "Enrollments retrieved successfully",
    FETCH_FAILED: "Failed to get enrollments",
    APPROVE_FAILED: "Failed to approve enrollment",
    REJECT_FAILED: "Failed to reject enrollment",
    NOT_FOUND: "Enrollment not found",
    DETAILS_FETCH_FAILED: "Failed to get enrollment details",
} as const;

export const COURSE_FILTERS = {
    ALL: "all",
} as const;

export const COURSE_SORT = {
    DEFAULT: { updatedAt: -1, createdAt: -1 },
} as const;
