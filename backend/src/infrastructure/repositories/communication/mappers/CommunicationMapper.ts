import { Message, UserInfo, Attachment } from "../../../../domain/communication/entities/Communication";
import { UserRole, MessageStatus } from "../../../../domain/communication/enums/CommunicationEnums";
import { IMessageSource, IParamsUserSource, IRecipientSource, IAttachmentSource } from "../infraTypes";
import mongoose from "mongoose";

export class CommunicationMapper {
    static toDomain(raw: IMessageSource | null): Message | null {
        if (!raw) return null;

        const sender: UserInfo = {
            id: raw.sender._id.toString(),
            name: raw.sender.name,
            email: raw.sender.email,
            role: raw.sender.role as UserRole
        };

        const recipients: UserInfo[] = raw.recipients.map((r) => ({
            id: r._id.toString(),
            name: r.name,
            email: r.email,
            role: r.role as UserRole,
            status: r.status as MessageStatus,
        }));

        const attachments: Attachment[] = raw.attachments ? raw.attachments.map(a => ({
            filename: a.filename,
            path: a.path,
            contentType: a.contentType,
            size: a.size
        })) : [];

        return new Message(
            raw._id.toString(),
            raw.subject,
            raw.content,
            sender,
            recipients,
            raw.isBroadcast,
            attachments,
            raw.createdAt instanceof Date ? raw.createdAt.toISOString() : ((raw.createdAt as string) || new Date().toISOString()),
            raw.updatedAt instanceof Date ? raw.updatedAt.toISOString() : ((raw.updatedAt as string) || new Date().toISOString())
        );
    }

    static toPersistence(domain: Message): Partial<IMessageSource> {
        return {
            _id: domain.id ? new mongoose.Types.ObjectId(domain.id) : undefined,
            subject: domain.subject,
            content: domain.content,
            sender: {
                _id: new mongoose.Types.ObjectId(domain.sender.id),
                name: domain.sender.name,
                email: domain.sender.email,
                role: domain.sender.role,
            },
            recipients: domain.recipients.map(r => ({
                _id: new mongoose.Types.ObjectId(r.id),
                name: r.name,
                email: r.email,
                role: r.role,
                status: r.status || MessageStatus.Unread,
            })),
            isBroadcast: domain.isBroadcast,
            attachments: domain.attachments as unknown as IAttachmentSource[],
        };
    }
}
