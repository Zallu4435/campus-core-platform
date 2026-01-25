import { Types } from "mongoose";

// Source Interfaces
export interface IChatSource {
    _id: Types.ObjectId | string;
    type: string;
    name: string;
    participants: string[];
    admins: string[];
    createdBy: string;
    avatar?: string;
    description?: string;
    lastMessage?: {
        id: string;
        content: string;
        type: string;
        senderId: string;
        status: string;
        createdAt: Date;
    };
    settings: {
        onlyAdminsCanPost: boolean;
        onlyAdminsCanAddMembers: boolean;
        onlyAdminsCanChangeInfo: boolean;
    };
    blockedUsers: { blocker: string; blocked: string }[];
    userChatMeta: {
        userId: string;
        clearedAt?: Date;
        isDeleted?: boolean;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

export interface IMessageSource {
    _id: Types.ObjectId | string;
    chatId: string;
    senderId: string;
    content: string;
    type: string;
    status: string;
    isDeleted: boolean;
    deletedFor: string[];
    deletedForEveryone: boolean;
    reactions: {
        userId: string;
        emoji: string;
        createdAt: Date;
    }[];
    attachments?: {
        type: string;
        url: string;
        name: string;
        size: number;
        thumbnail?: string;
        duration?: number;
    }[];
    replyTo?: {
        messageId: string;
        content: string;
        senderId: string;
    };
    forwardedFrom?: {
        messageId: string;
        chatId: string;
        senderId: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
