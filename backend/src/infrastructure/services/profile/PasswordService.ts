// PasswordService.ts
import * as bcrypt from "bcryptjs";
import { IPasswordService } from "../../../application/profile/services/IPasswordService";

export class PasswordService implements IPasswordService {
    private readonly SALT_ROUNDS = 12;
    private readonly MIN_LENGTH = 8;

    async hash(plainPassword: string): Promise<string> {
        return bcrypt.hash(plainPassword, this.SALT_ROUNDS);
    }

    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    validateStrength(password: string): boolean {
        if (password.length < this.MIN_LENGTH) {
            return false;
        }
        // At least one uppercase, one lowercase, one number
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);

        return hasUpperCase && hasLowerCase && hasNumber;
    }
}
