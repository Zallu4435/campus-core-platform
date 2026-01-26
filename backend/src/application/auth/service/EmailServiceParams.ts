
export interface AdmissionOfferEmailParams {
    to: string;
    name: string;
    programDetails: string;
    startDate: string;
    scholarshipInfo: string;
    additionalNotes: string;
    acceptUrl: string;
    rejectUrl: string;
    expiryDays: number;
}

export interface AdmissionRejectionEmailParams {
    to: string;
    name: string;
    reason: string;
}

export interface FacultyOfferEmailParams {
    to: string;
    name: string;
    department: string;
    position: string;
    startDate: string;
    salary?: string;
    benefits?: string;
    additionalNotes?: string;
    acceptUrl: string;
    rejectUrl: string;
    expiryDays: number;
}

export interface FacultyCredentialsEmailParams {
    to: string;
    name: string;
    email: string;
    password: string;
    loginUrl: string;
    department: string;
    additionalInstructions?: string;
}

export interface PasswordResetOtpEmailParams {
    to: string;
    name: string;
    otp: string;
}

export interface RegistrationConfirmationEmailParams {
    to: string;
    name: string;
    confirmationUrl: string;
}

export interface EnquiryReplyEmailParams {
    to: string;
    name: string;
    originalSubject: string;
    originalMessage: string;
    replyMessage: string;
    adminName?: string;
}