export class ChatError extends Error {
    constructor(message: string) {
        super(message);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

export class ChatNotFoundError extends ChatError {
    constructor() {
        super("Chat not found");
    }
}

export class MessageNotFoundError extends ChatError {
    constructor() {
        super("Message not found");
    }
}

export class UserNotAuthorizedError extends ChatError {
    constructor() {
        super("User is not authorized to perform this action");
    }
}

export class CreatorNotFoundError extends ChatError {
    constructor() {
        super("Creator not found");
    }
}

export class ParticipantNotFoundError extends ChatError {
    constructor() {
        super("Participant not found");
    }
}

export class ChatAlreadyExistsError extends ChatError {
    constructor() {
        super("Chat already exists");
    }
}

export class InvalidActionError extends ChatError {
    constructor(message: string) {
        super(message);
    }
}
