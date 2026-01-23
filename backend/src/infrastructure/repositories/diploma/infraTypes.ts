import { Document, Types } from 'mongoose';

export interface IDiplomaDocument {
    _id: Types.ObjectId;
    title: string;
    description: string;
    price: number;
    category: string;
    thumbnail: string;
    duration: string;
    prerequisites: string[];
    status: boolean;
    createdAt: Date;
    updatedAt: Date;
    videoIds: Types.ObjectId[];
    students?: Types.ObjectId[];
}

export interface IVideoDocument {
    _id: Types.ObjectId;
    title: string;
    description: string;
    videoUrl: string;
    duration: string;
    module: number;
    status: string;
    diplomaId: Types.ObjectId;
    uploadedAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

export interface DiplomaFilter {
    title?: string | { $regex: string; $options: string };
    description?: string | { $regex: string; $options: string };
    category?: string | { $regex: string; $options: string };
    status?: boolean | string | { $regex: string; $options: string };
    instructor?: string | { $regex: string; $options: string };
    $or?: Array<{
        title?: { $regex: string; $options: string };
        description?: { $regex: string; $options: string };
    }>;
    createdAt?: { $gte?: Date; $lte?: Date };
    updatedAt?: { $gte?: Date; $lte?: Date };
}

export interface DiplomaListResult {
    diplomas: IDiplomaDocument[];
    totalItems: number;
}
