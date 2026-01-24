import { Chat, ChatType } from "../../../domain/chat/entities/Chat";
import { Message, MessageType, MessageStatus } from "../../../domain/chat/entities/Message";
import { IChat } from "../../database/mongoose/chat/ChatModel";
import { IMessage } from "../../database/mongoose/chat/MessageModel";

export class ChatMapper {
    static toChatDomain(raw: any): Chat {
        return new Chat({
            id: raw._id.toString(),
            type: raw.type as ChatType,
            name: raw.name,
            avatar: raw.avatar,
            description: raw.description,
            participants: raw.participants?.map((p: any) => p.toString()) || [],
            admins: raw.admins?.map((a: any) => a.toString()) || [],
            creatorId: raw.createdBy?.toString(),
            settings: raw.settings,
            lastMessage: raw.lastMessage ? new Message({
                id: raw.lastMessage.id?.toString() || raw.lastMessage._id?.toString(),
                chatId: raw._id.toString(), // context might be needed if lastMessage doesn't have it
                senderId: raw.lastMessage.senderId?.toString(),
                content: raw.lastMessage.content,
                type: raw.lastMessage.type as MessageType,
                status: raw.lastMessage.status as MessageStatus,
                reactions: [], // Last message summary usually doesn't have deep fields
                isEdited: false,
                isDeleted: false,
                deletedForEveryone: false,
                deletedFor: [],
                createdAt: raw.lastMessage.createdAt,
                updatedAt: raw.lastMessage.createdAt
            }) : undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            blockedUsers: raw.blockedUsers,
            // rules and joinLink not present in schema yet based on ChatModel analysis, adding optionally if needed or defaulting undefined
        });
    }

    static toMessageDomain(raw: any): Message {
        return new Message({
            id: raw._id.toString(),
            chatId: raw.chatId.toString(),
            senderId: raw.senderId.toString(),
            content: raw.content,
            type: raw.type as MessageType,
            status: raw.status as MessageStatus,
            reactions: raw.reactions?.map((r: any) => ({
                userId: r.userId.toString(),
                emoji: r.emoji,
                createdAt: r.createdAt
            })) || [],
            isEdited: false, // Schema doesn't seem to track isEdited explicitly in analyzed file? Wait, check editMessage logic. 
            // editMessage updates content. Assuming no flag in schema? I'll check schema again or default false.
            // Correction: Schema for MessageModel does NOT have isEdited. I will default to false.
            isDeleted: raw.isDeleted || false,
            deletedForEveryone: raw.deletedForEveryone || false,
            deletedFor: raw.deletedFor?.map((d: any) => d.toString()) || [],
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            attachments: raw.attachments?.map((a: any) => ({
                type: a.type as MessageType,
                url: a.url,
                name: a.name,
                size: a.size,
                thumbnail: a.thumbnail,
                duration: a.duration
            }))
        });
    }
}
