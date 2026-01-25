import { Types } from "mongoose";

export interface IAttachmentSource {
    filename: string;
    path: string;
    contentType: string;
    size: number;
    [key: string]: unknown;
}

export interface IParamsUserSource {
    _id: Types.ObjectId | string;
    name: string;
    email: string;
    role: string;
    [key: string]: unknown;
}

export interface IRecipientSource extends IParamsUserSource {
    status?: string;
}

export interface IMessageSource {
    _id: Types.ObjectId | string;
    subject: string;
    content: string;
    sender: IParamsUserSource;
    recipients: IRecipientSource[];
    isBroadcast: boolean;
    attachments?: IAttachmentSource[];
    createdAt?: Date | string;
    updatedAt?: Date | string;
    [key: string]: unknown;
}
