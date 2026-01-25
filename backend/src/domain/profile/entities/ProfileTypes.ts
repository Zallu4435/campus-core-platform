// ProfileTypes.ts

export enum ProfileRole {
    Student = 'student',
    Faculty = 'faculty',
    Admin = 'admin'
}

export interface UserProfileData {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    passwordChangedAt?: Date;
    password?: string;
}
