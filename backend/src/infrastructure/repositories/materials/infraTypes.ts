import { Types } from "mongoose";

export interface IMaterialSource {
    _id: Types.ObjectId | string;
    title: string;
    description: string;
    subject: string;
    course: string;
    semester: string;
    type: string;
    fileUrl: string;
    thumbnailUrl: string;
    tags: string[];
    difficulty: string;
    estimatedTime: string;
    isNewMaterial: boolean;
    isRestricted: boolean;
    uploadedBy: string;
    uploadedAt: Date | string;
    views: number;
    downloads: number;
    rating: number;
    bookmarks: Array<{ userId: string }>;
    likes: Array<{ userId: string }>;
    [key: string]: unknown;
}
