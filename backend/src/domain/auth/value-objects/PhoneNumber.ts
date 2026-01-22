import { InvalidPhoneNumberError } from '../errors/AuthErrors';

/**
 * PhoneNumber Value Object
 * Encapsulates phone number validation and formatting
 * Ensures all phone numbers in the system are valid
 */
export class PhoneNumber {
    private readonly value: string;

    private constructor(phone: string) {
        this.value = phone;
    }

    /**
     * Create a new PhoneNumber value object
     * @param phone - The phone number string to validate and create
     * @throws InvalidPhoneNumberError if phone format is invalid
     */
    static create(phone: string): PhoneNumber {
        if (!phone) {
            throw new InvalidPhoneNumberError(phone || '(empty)');
        }

        const trimmedPhone = phone.trim();

        if (!this.isValid(trimmedPhone)) {
            throw new InvalidPhoneNumberError(phone);
        }

        // Normalize: remove all non-digit characters
        const normalized = trimmedPhone.replace(/\D/g, '');

        return new PhoneNumber(normalized);
    }

    /**
     * Validate phone number format
     * Accepts various formats: +1234567890, (123) 456-7890, 123-456-7890, etc.
     * @param phone - The phone number string to validate
     * @returns true if valid, false otherwise
     */
    static isValid(phone: string): boolean {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        // Remove all non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');

        // Check length (10-15 digits is reasonable for most international numbers)
        const hasValidLength = digitsOnly.length >= 10 && digitsOnly.length <= 15;

        // Check that original string contains valid phone characters
        const validCharsRegex = /^[\d\s\-\+\(\)]+$/;
        const hasValidChars = validCharsRegex.test(phone);

        return hasValidLength && hasValidChars;
    }

    /**
     * Get the phone number value (normalized, digits only)
     */
    getValue(): string {
        return this.value;
    }

    /**
     * Get formatted phone number for display
     * Format: (123) 456-7890 for 10-digit numbers
     * For other lengths, returns as-is
     */
    getFormatted(): string {
        if (this.value.length === 10) {
            return `(${this.value.slice(0, 3)}) ${this.value.slice(3, 6)}-${this.value.slice(6)}`;
        }

        // For international or other formats, just add spacing
        if (this.value.length > 10) {
            return `+${this.value}`;
        }

        return this.value;
    }

    /**
     * Get international format (with + prefix)
     */
    getInternational(): string {
        return `+${this.value}`;
    }

    /**
     * Check if two phone numbers are equal
     */
    equals(other: PhoneNumber): boolean {
        if (!other) {
            return false;
        }
        return this.value === other.value;
    }

    /**
     * String representation (formatted)
     */
    toString(): string {
        return this.getFormatted();
    }
}
