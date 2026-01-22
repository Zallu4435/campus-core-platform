import { WeakPasswordError } from '../errors/AuthErrors';

/**
 * Password Value Object
 * Encapsulates password validation rules
 * Note: This represents a plain password for validation purposes
 * Actual hashing is done in the infrastructure layer
 */
export class Password {
    private readonly value: string;

    private constructor(password: string) {
        this.value = password;
    }

    /**
     * Create a new Password value object
     * @param plainPassword - The plain text password to validate
     * @throws WeakPasswordError if password doesn't meet requirements
     */
    static create(plainPassword: string): Password {
        if (!plainPassword) {
            throw new WeakPasswordError();
        }

        if (!this.meetsRequirements(plainPassword)) {
            throw new WeakPasswordError();
        }

        return new Password(plainPassword);
    }

    /**
     * Validate password strength requirements
     * Requirements:
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     */
    static meetsRequirements(password: string): boolean {
        if (!password || typeof password !== 'string') {
            return false;
        }

        const minLength = 8;
        const hasMinLength = password.length >= minLength;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasMinLength && hasUpperCase && hasLowerCase && hasNumber;
    }

    /**
     * Check if password has special characters (optional requirement)
     */
    static hasSpecialCharacters(password: string): boolean {
        return /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    }

    /**
     * Calculate password strength score (0-4)
     * 0 = Very Weak
     * 1 = Weak
     * 2 = Fair
     * 3 = Good
     * 4 = Strong
     */
    static calculateStrength(password: string): number {
        if (!password) return 0;

        let score = 0;

        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;

        // Character variety
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (this.hasSpecialCharacters(password)) score++;

        return Math.min(score, 4);
    }

    /**
     * Get the password value (use with caution)
     * This should only be used for hashing purposes
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Get password length
     */
    getLength(): number {
        return this.value.length;
    }

    /**
     * String representation (masked for security)
     */
    toString(): string {
        return '*'.repeat(this.value.length);
    }
}
