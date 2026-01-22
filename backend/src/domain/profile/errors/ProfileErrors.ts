// src/domain/profile/errors/ProfileErrors.ts

export class DomainError extends Error {
    constructor(message: string, public readonly name: string = "DomainError") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = name;
    }
}

export class ProfileNotFoundError extends DomainError {
    constructor() {
        super("User profile not found.", "ProfileNotFoundError");
    }
}

export class EmailAlreadyInUseError extends DomainError {
    constructor(email: string) {
        super(`Email "${email}" is already used by another account.`, "EmailAlreadyInUseError");
    }
}

export class InvalidPasswordError extends DomainError {
    constructor(message = "Invalid password provided.") {
        super(message, "InvalidPasswordError");
    }
}

export class PasswordMismatchError extends DomainError {
    constructor() {
        super("New password and confirmation do not match.", "PasswordMismatchError");
    }
}

export class ValidationError extends DomainError {
    constructor(message: string) {
        super(message, "ValidationError");
    }
}
