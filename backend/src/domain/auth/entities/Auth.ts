import { AuthErrorType } from "../enums/AuthErrorType";

export interface UserProps {
    id?: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    profilePicture?: string;
    blocked?: boolean;
    pending?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface FacultyProps {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    department: string;
    qualification: string;
    experience: string;
    aboutMe: string;
    cvUrl?: string;
    certificatesUrl?: string[];
    createdAt?: Date;
    updatedAt?: Date;
}

export class User {
    constructor(
        public readonly id: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public password: string,
        public profilePicture: string | undefined,
        public blocked: boolean,
        public pending: boolean,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(props: UserProps): User {
        if (!props.firstName?.trim()) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.lastName?.trim()) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.email) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.password) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }

        const now = new Date();
        return new User(
            props.id || '',
            props.firstName,
            props.lastName,
            props.email,
            props.password,
            props.profilePicture,
            props.blocked || false,
            props.pending || false,
            props.createdAt || now,
            props.updatedAt || now
        );
    }

    get fullName(): string {
        return `${this.firstName} ${this.lastName}`;
    }

    updateProfile(updates: {
        firstName?: string;
        lastName?: string;
        profilePicture?: string;
    }): void {
        if (updates.firstName !== undefined) this.firstName = updates.firstName;
        if (updates.lastName !== undefined) this.lastName = updates.lastName;
        if (updates.profilePicture !== undefined) this.profilePicture = updates.profilePicture;
        this.updatedAt = new Date();
    }

    changePassword(newPassword: string): void {
        this.password = newPassword;
        this.updatedAt = new Date();
    }

    block(): void {
        this.blocked = true;
        this.updatedAt = new Date();
    }

    unblock(): void {
        this.blocked = false;
        this.updatedAt = new Date();
    }

    confirmEmail(): void {
        this.pending = false;
        this.updatedAt = new Date();
    }

    isBlocked(): boolean {
        return this.blocked;
    }

    isPending(): boolean {
        return this.pending;
    }

    canLogin(): boolean {
        return !this.blocked && !this.pending;
    }
}

export class Faculty {
    constructor(
        public readonly id: string,
        public fullName: string,
        public email: string,
        public phone: string,
        public department: string,
        public qualification: string,
        public experience: string,
        public aboutMe: string,
        public cvUrl: string | undefined,
        public certificatesUrl: string[] | undefined,
        public readonly createdAt: Date,
        public updatedAt: Date
    ) { }

    static create(props: FacultyProps): Faculty {
        if (!props.fullName?.trim()) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.email) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.phone) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }
        if (!props.department?.trim()) {
            throw new Error(AuthErrorType.InvalidCredentials);
        }

        const now = new Date();
        return new Faculty(
            props.id || '',
            props.fullName,
            props.email,
            props.phone,
            props.department,
            props.qualification,
            props.experience,
            props.aboutMe,
            props.cvUrl,
            props.certificatesUrl,
            props.createdAt || now,
            props.updatedAt || now
        );
    }

    updateProfile(updates: {
        fullName?: string;
        phone?: string;
        department?: string;
        qualification?: string;
        experience?: string;
        aboutMe?: string;
    }): void {
        if (updates.fullName !== undefined) this.fullName = updates.fullName;
        if (updates.phone !== undefined) this.phone = updates.phone;
        if (updates.department !== undefined) this.department = updates.department;
        if (updates.qualification !== undefined) this.qualification = updates.qualification;
        if (updates.experience !== undefined) this.experience = updates.experience;
        if (updates.aboutMe !== undefined) this.aboutMe = updates.aboutMe;
        this.updatedAt = new Date();
    }

    updateCv(cvUrl: string): void {
        this.cvUrl = cvUrl;
        this.updatedAt = new Date();
    }

    addCertificate(certificateUrl: string): void {
        if (!this.certificatesUrl) {
            this.certificatesUrl = [];
        }
        this.certificatesUrl.push(certificateUrl);
        this.updatedAt = new Date();
    }

    removeCertificate(certificateUrl: string): void {
        if (this.certificatesUrl) {
            this.certificatesUrl = this.certificatesUrl.filter(url => url !== certificateUrl);
            this.updatedAt = new Date();
        }
    }
}
