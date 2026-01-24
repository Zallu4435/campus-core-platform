export class VideoError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class VideoNotFoundError extends VideoError {
    constructor(id: string) {
        super(`Video with id ${id} not found`);
    }
}

export class InvalidVideoDataError extends VideoError {
    constructor(message: string) {
        super(message);
    }
}

export class VideoUploadError extends VideoError {
    constructor(message: string) {
        super(message);
    }
}

export class InvalidVideoIdError extends VideoError {
    constructor() {
        super("Invalid Video ID");
    }
}

export class InvalidDiplomaIdError extends VideoError {
    constructor() {
        super("Invalid Diploma ID");
    }
}