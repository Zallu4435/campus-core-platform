import { Types } from "mongoose";

export interface ISiteSectionSource {
    _id: Types.ObjectId | string;
    sectionKey: string;
    image?: string;
    link?: string;
    title?: string;
    description?: string;
    category?: string;
    isActive?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown;
}
