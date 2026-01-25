import { Types } from "mongoose";

export interface IAnnouncementSource {
    title: string;
    message: string;
    description?: string;
    createdAt: Date | string;
    [key: string]: unknown;
}

export interface IDeadlineSource {
    title: string;
    dueDate: Date | string;
    [key: string]: unknown;
}

export interface IClassSource {
    title: string;
    startTime: Date | string;
    [key: string]: unknown;
}

export interface IDashboardEventSource {
    title: string;
    date?: Date | string;
    createdAt?: Date | string;
    [key: string]: unknown;
}

export interface IUserInfoSource {
    _id: Types.ObjectId | string;
    firstName: string;
    lastName: string;
    email: string;
    profilePicture?: string;
    degree?: string;
    [key: string]: unknown;
}
