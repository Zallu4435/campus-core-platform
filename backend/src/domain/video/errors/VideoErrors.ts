export class VideoDomainError extends Error {
    public readonly statusCode: number;
    public readonly code: string;

    constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_SERVER_ERROR') {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.code = code;
    }
}

export class VideoNotFoundError extends VideoDomainError {
    constructor(id?: string) {
        super(id ? `Video with ID ${id} not found` : 'Video not found', 404, 'VIDEO_NOT_FOUND');
    }
}

export class InvalidVideoIdError extends VideoDomainError {
    constructor() {
        super('Invalid video ID format', 400, 'INVALID_VIDEO_ID');
    }
}

export class InvalidDiplomaIdError extends VideoDomainError {
    constructor() {
        super('Invalid diploma ID or category', 400, 'INVALID_DIPLOMA_ID');
    }
}

export class VideoUploadError extends VideoDomainError {
    constructor(message: string = 'Failed to upload video') {
        super(message, 500, 'VIDEO_UPLOAD_FAILED');
    }
}

export class InvalidVideoDataError extends VideoDomainError {
    constructor(message: string) {
        super(message, 400, 'INVALID_VIDEO_DATA');
    }
}