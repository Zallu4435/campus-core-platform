export interface IOtpService {
    generateOtp(): string;
    storeOtp(email: string, otp: string): void;
    verifyOtp(email: string, otp: string): boolean;
    clearOtp(email: string): void;
}
