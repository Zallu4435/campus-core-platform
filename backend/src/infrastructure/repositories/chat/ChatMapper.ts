import { Chat, ChatType } from "../../../domain/chat/entities/Chat";
import { Message, MessageType, MessageStatus } from "../../../domain/chat/entities/Message";
import { IChatSource, IMessageSource } from "./infraTypes";

export class ChatMapper {
    static toChatDomain(raw: IChatSource): Chat {
        return new Chat({
            id: raw._id.toString(),
            type: raw.type as ChatType,
            name: raw.name,
            avatar: raw.avatar,
            description: raw.description,
            participants: raw.participants.map(p => p.toString()),
            admins: raw.admins.map(a => a.toString()),
            creatorId: raw.createdBy.toString(),
            settings: raw.settings,
            lastMessage: raw.lastMessage ? new Message({
                id: raw.lastMessage.id || raw.lastMessage._id?.toString() || '',
                chatId: raw._id.toString(),
                senderId: raw.lastMessage.senderId,
                content: raw.lastMessage.content,
                type: raw.lastMessage.type as MessageType,
                status: raw.lastMessage.status as MessageStatus,
                reactions: [],
                isEdited: raw.lastMessage.isEdited || false,
                isDeleted: false,
                deletedForEveryone: false,
                deletedFor: [],
                createdAt: raw.lastMessage.createdAt,
                updatedAt: raw.lastMessage.createdAt
            }) : undefined,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            blockedUsers: raw.blockedUsers,
            userChatMeta: raw.userChatMeta
        });
    }

    static toMessageDomain(raw: IMessageSource): Message {
        const message = new Message({
            id: raw._id.toString(),
            chatId: raw.chatId.toString(),
            senderId: raw.senderId.toString(),
            content: raw.content,
            type: raw.type as MessageType,
            status: raw.status as MessageStatus,
            reactions: raw.reactions?.map(r => ({
                userId: r.userId.toString(),
                emoji: r.emoji,
                createdAt: r.createdAt
            })) || [],
            isEdited: raw.isEdited || false,
            isDeleted: raw.isDeleted || false,
            deletedForEveryone: raw.deletedForEveryone || false,
            deletedFor: raw.deletedFor?.map(d => d.toString()) || [],
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
            replyTo: raw.replyTo ? {
                id: raw.replyTo.id || raw.replyTo.messageId || raw.replyTo._id?.toString() || '',
                content: raw.replyTo.content,
                senderId: raw.replyTo.senderId,
                senderName: raw.replyTo.senderName || '',
                type: raw.replyTo.type as MessageType,
                createdAt: '' // We don't necessarily have it here in replyTo schema but it's fine
            } : undefined,
            attachments: raw.attachments?.map(a => ({
                type: a.type as MessageType,
                url: a.url,
                name: a.name,
                size: a.size,
                thumbnail: a.thumbnail,
                duration: a.duration
            }))
        });

        return message;
    }
}
