export class CommunicationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "CommunicationError";
    }
}

export class MessageNotFoundError extends CommunicationError {
    constructor(messageId: string) {
        super(`Message with ID ${messageId} not found.`);
        this.name = "MessageNotFoundError";
    }
}

export class InvalidRecipientError extends CommunicationError {
    constructor(recipientId: string) {
        super(`Recipient with ID ${recipientId} is invalid.`);
        this.name = "InvalidRecipientError";
    }
}

export class SenderNotFoundError extends CommunicationError {
    constructor(senderId: string) {
        super(`Sender with ID ${senderId} not found.`);
        this.name = "SenderNotFoundError";
    }
}
