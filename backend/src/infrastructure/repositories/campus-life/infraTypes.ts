import { Types } from "mongoose";

export interface IJoinRequestSource {
    _id: Types.ObjectId | string;
    userId: string;
    clubId?: string;
    eventId?: string;
    sportId?: string;
    status: string;
    whyJoin: string;
    additionalInfo: string;
    createdAt: Date;
    [key: string]: unknown;
}
export interface ICampusLifeSource {
    _id: Types.ObjectId | string;
    // Common fields or union of all types if generic mapping is used
    [key: string]: unknown;
}

export interface ICampusEventSource extends ICampusLifeSource {
    title: string;
    description: string;
    date: Date | string;
    organizer: string;
    status: string;
    // ... other fields as needed
}

export interface ITeamSource extends ICampusLifeSource {
    name: string;
    type: string;
    division: string;
    headCoach: string;
}

export interface IClubSource extends ICampusLifeSource {
    name: string;
    type: string;
    status: string;
}
