import { otpStorage } from "../../services/otpStorage";
import { InvalidOtpError } from "../../../domain/auth/errors/AuthErrors";
import { IOtpService } from "../../../application/auth/service/IOtpService";

export class OtpService implements IOtpService {
    constructor(private readonly otpStore: typeof otpStorage) { }

    generateOtp(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    storeOtp(email: string, otp: string): void {
        this.otpStore.storeOtp(email, otp);
    }

    verifyOtp(email: string, otp: string): boolean {
        const storedOtp = this.otpStore.getOtp(email);

        if (!storedOtp || storedOtp.otp !== otp) {
            throw new InvalidOtpError();
        }

        this.otpStore.clearOtp(email);
        return true;
    }

    clearOtp(email: string): void {
        this.otpStore.clearOtp(email);
    }
}