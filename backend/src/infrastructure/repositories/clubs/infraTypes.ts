import { Types } from "mongoose";

export interface IClubSource {
    _id: Types.ObjectId | string;
    name: string;
    type: string;
    description?: string;
    members?: string[];
    admins?: string[];
    // ... other fields matching ClubModel
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown; // Allow flexibility for now, or define strictly
}

export interface IClubRequestSource {
    _id: Types.ObjectId | string;
    clubId: Types.ObjectId | string | IClubSource;
    userId: Types.ObjectId | string | { _id: Types.ObjectId | string; firstName: string; lastName: string; email: string };
    status: string;
    whyJoin: string;
    additionalInfo?: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
