import { ValidationError } from '../errors/AuthErrors';

/**
 * PersonName Value Object
 * Encapsulates person name validation and behavior
 * Ensures consistent name handling across the system
 */
export class PersonName {
    private readonly firstName: string;
    private readonly lastName: string;

    private constructor(firstName: string, lastName: string) {
        this.firstName = firstName;
        this.lastName = lastName;
    }

    /**
     * Create a new PersonName value object
     * @param firstName - The first name
     * @param lastName - The last name
     * @throws ValidationError if names are invalid
     */
    static create(firstName: string, lastName: string): PersonName {
        if (!firstName || typeof firstName !== 'string') {
            throw new ValidationError('First name is required');
        }

        if (!lastName || typeof lastName !== 'string') {
            throw new ValidationError('Last name is required');
        }

        const trimmedFirstName = firstName.trim();
        const trimmedLastName = lastName.trim();

        if (!trimmedFirstName) {
            throw new ValidationError('First name cannot be empty');
        }

        if (!trimmedLastName) {
            throw new ValidationError('Last name cannot be empty');
        }

        // Optional: Validate name length
        if (trimmedFirstName.length > 50) {
            throw new ValidationError('First name is too long (max 50 characters)');
        }

        if (trimmedLastName.length > 50) {
            throw new ValidationError('Last name is too long (max 50 characters)');
        }

        // Optional: Validate name characters (letters, spaces, hyphens, apostrophes)
        const nameRegex = /^[a-zA-Z\s\-']+$/;
        if (!nameRegex.test(trimmedFirstName)) {
            throw new ValidationError('First name contains invalid characters');
        }

        if (!nameRegex.test(trimmedLastName)) {
            throw new ValidationError('Last name contains invalid characters');
        }

        return new PersonName(trimmedFirstName, trimmedLastName);
    }

    /**
     * Create from full name string (splits on last space)
     * Example: "John Doe" -> firstName: "John", lastName: "Doe"
     * Example: "John Michael Doe" -> firstName: "John Michael", lastName: "Doe"
     */
    static createFromFullName(fullName: string): PersonName {
        if (!fullName || typeof fullName !== 'string') {
            throw new ValidationError('Full name is required');
        }

        const trimmed = fullName.trim();
        const parts = trimmed.split(/\s+/);

        if (parts.length < 2) {
            throw new ValidationError('Full name must include both first and last name');
        }

        // Last part is last name, everything else is first name
        const lastName = parts[parts.length - 1];
        const firstName = parts.slice(0, -1).join(' ');

        return PersonName.create(firstName, lastName);
    }

    /**
     * Get the first name
     */
    getFirstName(): string {
        return this.firstName;
    }

    /**
     * Get the last name
     */
    getLastName(): string {
        return this.lastName;
    }

    /**
     * Get full name (first + last)
     */
    getFullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    /**
     * Get initials (first letter of first and last name)
     * Example: "John Doe" -> "JD"
     */
    getInitials(): string {
        const firstInitial = this.firstName.charAt(0).toUpperCase();
        const lastInitial = this.lastName.charAt(0).toUpperCase();
        return `${firstInitial}${lastInitial}`;
    }

    /**
     * Get formal name (Last, First)
     * Example: "Doe, John"
     */
    getFormalName(): string {
        return `${this.lastName}, ${this.firstName}`;
    }

    /**
     * Check if two names are equal
     */
    equals(other: PersonName): boolean {
        if (!other) {
            return false;
        }
        return this.firstName === other.firstName && this.lastName === other.lastName;
    }

    /**
     * String representation (full name)
     */
    toString(): string {
        return this.getFullName();
    }
}
