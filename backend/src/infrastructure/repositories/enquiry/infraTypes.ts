import { Types } from "mongoose";

export interface IEnquirySource {
    _id: Types.ObjectId | string;
    name: string;
    email: string;
    subject: string;
    message: string;
    status: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown;
}
