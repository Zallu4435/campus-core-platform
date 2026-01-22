import { InvalidEmailError } from '../errors/AuthErrors';

/**
 * Email Value Object
 * Encapsulates email validation and behavior
 * Ensures all emails in the system are valid
 */
export class Email {
    private readonly value: string;

    private constructor(email: string) {
        this.value = email;
    }

    /**
     * Create a new Email value object
     * @param email - The email string to validate and create
     * @throws InvalidEmailError if email format is invalid
     */
    static create(email: string): Email {
        if (!email) {
            throw new InvalidEmailError(email || '(empty)');
        }

        const trimmedEmail = email.trim();

        if (!this.isValid(trimmedEmail)) {
            throw new InvalidEmailError(email);
        }

        return new Email(trimmedEmail.toLowerCase());
    }

    /**
     * Validate email format
     * @param email - The email string to validate
     * @returns true if valid, false otherwise
     */
    static isValid(email: string): boolean {
        if (!email || typeof email !== 'string') {
            return false;
        }

        // RFC 5322 compliant email regex (simplified)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Additional checks
        const hasValidLength = email.length >= 3 && email.length <= 254;
        const hasValidFormat = emailRegex.test(email);
        const hasNoConsecutiveDots = !email.includes('..');
        const hasValidLocalPart = !email.startsWith('.') && !email.includes('@.');

        return hasValidLength && hasValidFormat && hasNoConsecutiveDots && hasValidLocalPart;
    }

    /**
     * Get the email value as a string
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Get the domain part of the email
     */
    getDomain(): string {
        return this.value.split('@')[1];
    }

    /**
     * Get the local part of the email (before @)
     */
    getLocalPart(): string {
        return this.value.split('@')[0];
    }

    /**
     * Check if two emails are equal
     */
    equals(other: Email): boolean {
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
