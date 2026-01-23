export const CommunicationConstants = {
    ROLES: {
        ADMIN: 'admin',
        STUDENT: 'student',
        FACULTY: 'faculty',
        STAFF: 'staff'
    },
    STATUS: {
        READ: 'read',
        UNREAD: 'unread',
        DELIVERED: 'delivered',
        OPENED: 'opened',
        ALL: 'all'
    },
    DEFAULTS: {
        PAGE: 1,
        LIMIT: 10,
        SEARCH: ''
    },
    ERRORS: {
        INVALID_USER_ID: 'Invalid user ID',
        INVALID_PAGE_LIMIT: 'Invalid page or limit parameters',
        FAILED_TO_RETRIEVE_MESSAGES: 'Failed to retrieve messages from database',
        FAILED_TO_PROCESS_DATA: 'Failed to process message data',
        INVALID_SENDER_ID: 'Invalid sender ID',
        MISSING_REQUIRED_FIELDS: 'Missing required fields',
        MESSAGE_NOT_FOUND: 'Message not found',
        INVALID_MESSAGE_ID: 'Invalid message ID',
        UNAUTHORIZED: 'Unauthorized access',
        INVALID_RECIPIENTS_FORMAT: 'Invalid recipients format',
        SENDER_NOT_FOUND: 'Sender not found'
    },
    MESSAGES: {
        MARKED_AS_READ: 'Message marked as read',
        DELETED_SUCCESSFULLY: 'Message deleted successfully'
    }
};
