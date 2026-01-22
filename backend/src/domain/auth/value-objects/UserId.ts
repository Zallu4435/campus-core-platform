import { ValidationError } from '../errors/AuthErrors';

/**
 * UserId Value Object
 * Encapsulates user ID validation and behavior
 * Ensures all user IDs in the system are valid
 */
export class UserId {
    private readonly value: string;

    private constructor(id: string) {
        this.value = id;
    }

    /**
     * Create a new UserId value object
     * @param id - The user ID string to validate and create
     * @throws ValidationError if ID is invalid
     */
    static create(id: string): UserId {
        if (!id || typeof id !== 'string') {
            throw new ValidationError('User ID cannot be empty');
        }

        const trimmedId = id.trim();

        if (!trimmedId) {
            throw new ValidationError('User ID cannot be empty');
        }

        // Optional: Add MongoDB ObjectId validation
        if (!this.isValidObjectId(trimmedId)) {
            throw new ValidationError(`Invalid user ID format: "${id}"`);
        }

        return new UserId(trimmedId);
    }

    /**
     * Validate MongoDB ObjectId format (24 hex characters)
     */
    private static isValidObjectId(id: string): boolean {
        // MongoDB ObjectId is 24 hex characters
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return objectIdRegex.test(id);
    }

    /**
     * Create UserId from unknown source (returns null if invalid)
     * Useful for optional IDs or when validation should not throw
     */
    static createOrNull(id: string | undefined | null): UserId | null {
        if (!id) {
            return null;
        }

        try {
            return UserId.create(id);
        } catch {
            return null;
        }
    }

    /**
     * Get the user ID value as a string
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Check if two user IDs are equal
     */
    equals(other: UserId | null | undefined): boolean {
        if (!other) {
            return false;
        }
        return this.value === other.value;
    }

    /**
     * String representation
     */
    toString(): string {
        return this.value;
    }
}
