export const VideoConstants = {
    Pagination: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 50
    },
    Upload: {
        FOLDER_VIDEOS: 'videos',
        FOLDER_CONTENT: 'content',
        RESOURCE_TYPE: 'video' as const,
        TIMEOUT: 60000
    },
    DateRanges: {
        LAST_WEEK: 'last_week',
        LAST_MONTH: 'last_month',
        LAST_3_MONTHS: 'last_3_months',
        CUSTOM: 'custom'
    },
    Messages: {
        INVALID_PAGINATION: 'Invalid page or limit parameters',
        DESCRIPTION_REQUIRED: 'Description is required',
        UPLOAD_FAILED: 'Failed to upload video to Cloudinary',
        VIDEO_DELETED: 'Video deleted successfully',
        INVALID_VIDEO_ID: 'Invalid video ID format',
        VIDEO_NOT_FOUND: 'Video not found',
        INVALID_DIPLOMA_ID: 'Invalid diploma ID or category',
        MISSING_VIDEO_ID: 'Missing video ID'
    }
};
