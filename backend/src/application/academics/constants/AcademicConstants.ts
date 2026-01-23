export const AcademicConstants = {
    Grade: {
        DEFAULT_GPA: 'N/A',
        UNKNOWN_TERM: 'Unknown Term',
        DEFAULT_CREDITS: '0',
    },
    Course: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 5,
        MAX_LIMIT: 50,
        SEARCH_REGEX_FLAGS: 'i',
    },
    Enrollment: {
        INCREMENT: 1,
        DECREMENT: -1,
    },
    Program: {
        DEFAULT_ESTIMATED_GRADUATION: 'To be determined',
    },
    Transcript: {
        DELIVERY_ESTIMATE_DAYS: 7,
        DELIVERY_METHODS: {
            ELECTRONIC: 'electronic',
            MAIL: 'mail',
        },
    },
    Messages: {
        STUDENT_NOT_FOUND: 'Student not found',
        GRADE_NOT_FOUND: 'Grade information not found',
        PROGRAM_NOT_FOUND: 'Program information not found',
        PROGRESS_NOT_FOUND: 'Progress information not found',
        REQUIREMENTS_NOT_FOUND: 'Requirements information not found',
        COURSE_NOT_FOUND: 'Course not found',
        ALREADY_ENROLLED: 'Already enrolled in this course',
        NOT_ENROLLED: 'Not enrolled in this course',
        ENROLLMENT_SUCCESS: 'Course registered successfully',
        DROP_SUCCESS: 'Course dropped successfully',
        TRANSCRIPT_SUCCESS: 'Transcript request submitted successfully',
        OFFICIAL_TRANSCRIPT_FAILED: 'Failed to request official transcript',
        INVALID_DELIVERY_METHOD: 'Invalid delivery method',
        ADDRESS_REQUIRED: 'Address is required for mail delivery',
        EMAIL_REQUIRED: 'Email is required for electronic delivery',
        FAILED_TO_REGISTER: 'Failed to register course',
        FAILED_TO_DROP: 'Failed to drop course'
    },
    Defaults: {
        ZERO: 0,
        EMPTY_STRING: '',
    }
} as const;
