/**
 * SessionService - Domain Service
 * Encapsulates session-related business logic and rules
 * This is a stateless service that contains domain knowledge about sessions
 */
export class SessionService {
    // Business Rules: Session duration constants
    private static readonly SESSION_DURATION_DAYS = 30;
    private static readonly MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;
    private static readonly WARNING_THRESHOLD_DAYS = 1;

    /**
     * Calculate session expiry date from a given start date
     * @param from - The start date (defaults to now)
     * @returns The expiry date
     */
    static calculateExpiryDate(from: Date = new Date()): Date {
        return new Date(
            from.getTime() +
            this.SESSION_DURATION_DAYS * this.MILLISECONDS_PER_DAY
        );
    }

    /**
     * Check if a session has expired
     * @param expiryDate - The session expiry date
     * @returns true if expired, false otherwise
     */
    static isExpired(expiryDate: Date): boolean {
        return expiryDate < new Date();
    }

    /**
     * Check if a session is about to expire soon (within warning threshold)
     * @param expiryDate - The session expiry date
     * @returns true if expiring soon, false otherwise
     */
    static isExpiringSoon(expiryDate: Date): boolean {
        const warningTime = new Date(
            Date.now() + this.WARNING_THRESHOLD_DAYS * this.MILLISECONDS_PER_DAY
        );
        return expiryDate < warningTime && !this.isExpired(expiryDate);
    }

    /**
     * Get remaining session time in milliseconds
     * @param expiryDate - The session expiry date
     * @returns Remaining time in milliseconds (0 if expired)
     */
    static getRemainingTime(expiryDate: Date): number {
        return Math.max(0, expiryDate.getTime() - Date.now());
    }

    /**
     * Get remaining session time in days
     * @param expiryDate - The session expiry date
     * @returns Remaining time in days (0 if expired)
     */
    static getRemainingDays(expiryDate: Date): number {
        const remainingMs = this.getRemainingTime(expiryDate);
        return Math.floor(remainingMs / this.MILLISECONDS_PER_DAY);
    }

    /**
     * Get remaining session time in hours
     * @param expiryDate - The session expiry date
     * @returns Remaining time in hours (0 if expired)
     */
    static getRemainingHours(expiryDate: Date): number {
        const remainingMs = this.getRemainingTime(expiryDate);
        return Math.floor(remainingMs / (60 * 60 * 1000));
    }

    /**
     * Get session duration in days (business rule)
     * @returns Session duration in days
     */
    static getSessionDurationDays(): number {
        return this.SESSION_DURATION_DAYS;
    }

    /**
     * Validate that a session is still valid
     * @param expiryDate - The session expiry date
     * @throws SessionExpiredError if session has expired
     */
    static validateNotExpired(expiryDate: Date): void {
        if (this.isExpired(expiryDate)) {
            const { SessionExpiredError } = require('../errors/AuthErrors');
            throw new SessionExpiredError();
        }
    }

    /**
     * Calculate when to send expiry warning
     * @param expiryDate - The session expiry date
     * @returns Date when warning should be sent
     */
    static getWarningDate(expiryDate: Date): Date {
        return new Date(
            expiryDate.getTime() -
            this.WARNING_THRESHOLD_DAYS * this.MILLISECONDS_PER_DAY
        );
    }

    /**
     * Format remaining time as human-readable string
     * @param expiryDate - The session expiry date
     * @returns Human-readable time remaining (e.g., "5 days", "2 hours")
     */
    static formatRemainingTime(expiryDate: Date): string {
        if (this.isExpired(expiryDate)) {
            return 'Expired';
        }

        const days = this.getRemainingDays(expiryDate);
        const hours = this.getRemainingHours(expiryDate);

        if (days > 0) {
            return `${days} day${days === 1 ? '' : 's'}`;
        }

        if (hours > 0) {
            return `${hours} hour${hours === 1 ? '' : 's'}`;
        }

        const minutes = Math.floor(this.getRemainingTime(expiryDate) / (60 * 1000));
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    }
}
