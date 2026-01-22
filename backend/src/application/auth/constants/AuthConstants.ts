export enum AuthCollection {
    REGISTER = "register",
    ADMIN = "admin",
    USER = "user",
    FACULTY = "faculty"
}

export enum TokenType {
    ACCESS = "access",
    REFRESH = "refresh",
    PASSWORD_RESET = "password-reset",
    CONFIRMATION = "confirmation"
}

export const AUTH_MESSAGES = {
    REGISTRATION_SUCCESS: "Registration successful. Please check your email to confirm your account.",
    FACULTY_REGISTRATION_PENDING: "Faculty registration submitted successfully.",
    EMAIL_CONFIRMED: "Email confirmed successfully. You can now log in.",
    ALREADY_CONFIRMED: "User account is already confirmed.",
    LOGOUT_SUCCESS: "Logged out successfully",
    LOGOUT_ALL_SUCCESS: "Logged out from all devices",
    OTP_SENT: "OTP sent successfully",
    PASSWORD_RESET_SUCCESS: "Password reset successfully",
};

export const AUTH_EXPIRIES = {
    CONFIRMATION_TOKEN: "1d",
    ACCESS_TOKEN: "1h",
    REFRESH_TOKEN: "30d",
    PASSWORD_RESET_TOKEN: "15m",
    OTP_STORE: 10 * 60 * 1000, // 10 minutes in ms
    ACCESS_TOKEN_COOKIE_MS: 60 * 60 * 1000, // 1 hour in ms (matches ACCESS_TOKEN)
};

export const FACULTY_UPLOAD_CONSTANTS = {
    FIELDS: {
        CV: "cv",
        CERTIFICATES: "certificates"
    },
    LIMITS: {
        CV_MAX_COUNT: 1,
        CERTIFICATES_MAX_COUNT: 5,
        FILE_SIZE: 10 * 1024 * 1024 // 10MB
    },
    ALLOWED_FORMATS: ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png']
};
