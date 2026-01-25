import { Types } from "mongoose";

export interface ISportSource {
    _id: Types.ObjectId | string;
    title: string;
    type: string;
    headCoach: string;
    category: string;
    division: string;
    participants: number;
    description: string;
    image?: string;
    schedule: string;
    location: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    matches: Array<{
        opponent: string;
        date: Date | string;
        result?: string;
        location?: string;
    }>;
    achievements: Array<{
        title: string;
        date: Date | string;
        description: string;
    }>;
    [key: string]: unknown;
}

export interface ISportRequestSource {
    _id: Types.ObjectId | string;
    sportId: Types.ObjectId | string | ISportSource;
    userId: Types.ObjectId | string;
    status: string;
    whyJoin: string;
    additionalInfo: string;
    createdAt: Date | string;
    updatedAt: Date | string;
    [key: string]: unknown;
}
