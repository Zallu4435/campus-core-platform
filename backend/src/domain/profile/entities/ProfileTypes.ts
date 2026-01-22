// ProfileTypes.ts

export enum ProfileRole {
    Student = 'student',
    Faculty = 'faculty',
    Admin = 'admin'
}

export interface UserProfilePersistence {
    _id: string;
    firstName: string;
    lastName?: string;
    email: string;
    phone?: string;
    profilePicture?: string;
    passwordChangedAt?: Date;
    password?: string;
}
