import bcrypt from "bcryptjs";
import { IPasswordService } from "../../../application/auth/service/IPasswordService";
import Logger from "../../../shared/utils/logger";

/**
 * Bcrypt implementation of IPasswordService
 * Handles password hashing and comparison using bcrypt
 */
export class BcryptPasswordService implements IPasswordService {
    private readonly saltRounds: number;

    constructor(saltRounds: number = 10) {
        this.saltRounds = saltRounds;
    }

    /**
     * Hash a plain text password using bcrypt
     */
    async hash(plainPassword: string): Promise<string> {
        try {
            const salt = await bcrypt.genSalt(this.saltRounds);
            const hashedPassword = await bcrypt.hash(plainPassword, salt);
            Logger.debug(`Password hashed successfully`);
            return hashedPassword;
        } catch (error) {
            Logger.error(`Error hashing password: ${error}`);
            throw new Error('Failed to hash password');
        }
    }

    /**
     * Compare a plain text password with a hashed password
     */
    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        try {
            const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
            Logger.debug(`Password comparison result: ${isMatch}`);
            return isMatch;
        } catch (error) {
            Logger.error(`Error comparing passwords: ${error}`);
            throw new Error('Failed to compare passwords');
        }
    }

    /**
     * Validate password strength requirements
     * Requirements:
     * - At least 8 characters
     * - At least one uppercase letter
     * - At least one lowercase letter
     * - At least one number
     */
    meetsRequirements(password: string): boolean {
        if (!password || password.length < 8) {
            return false;
        }

        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasUpperCase && hasLowerCase && hasNumber;
    }
}

// Export singleton instance
export const passwordService = new BcryptPasswordService();
