import { Types } from 'mongoose';

export interface IUserSource {
    _id: Types.ObjectId | string;
    firstName?: string;
    lastName?: string;
    email: string;
    password?: string;
    profilePicture?: string;
    blocked?: boolean;
    pending?: boolean;
    fcmTokens?: string[];
    [key: string]: unknown;
}

export interface IFacultySource {
    _id: Types.ObjectId | string;
    fullName?: string;
    email: string;
    password?: string;
    phone?: string;
    department?: string;
    qualification?: string;
    experience?: string;
    aboutMe?: string;
    cvUrl?: string;
    certificatesUrl?: string;
    fcmTokens?: string[];
    [key: string]: unknown;
}

export interface IAdminSource {
    _id: Types.ObjectId | string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    role?: string;
    [key: string]: unknown;
}

export interface IRegisterSource {
    _id: Types.ObjectId | string;
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    pending: boolean;
    profilePicture?: string;
    blocked?: boolean;
    [key: string]: unknown;
}

export type IAuthUserSource = IUserSource | IFacultySource | IAdminSource | IRegisterSource;
