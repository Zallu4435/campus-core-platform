import { Types } from "mongoose";

export interface IVideoSource {
    _id: Types.ObjectId | string;
    title: string;
    description: string;
    videoUrl: string;
    duration: number;
    uploadedAt: Date | string;
    module: number;
    status: string;
    diplomaId?: Types.ObjectId | string | IDiplomaInfoSource;
    [key: string]: unknown;
}

export interface IDiplomaInfoSource {
    _id: Types.ObjectId | string;
    title: string;
    category: string;
    [key: string]: unknown;
}
