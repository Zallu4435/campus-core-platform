import { Message, UserInfo, Attachment } from "../../../domain/communication/entities/Communication";
import { UserRole, MessageStatus } from "../../../domain/communication/enums/CommunicationEnums";
import {
    GetMessageDetailsResponseDTO,
    AdminSentMessageResponseDTO,
    MessageSummaryDTO
} from "../dtos/CommunicationResponseDTOs";

export class CommunicationDTOMapper {
    static toMessageDetailsDTO(message: Message): GetMessageDetailsResponseDTO {
        const recipients = message.recipients || [];
        const attachments = message.attachments || [];

        const mappedRecipients = recipients.map((r) => ({
            _id: r._id.toString(),
            name: r.name,
            email: r.email,
            role: r.role
        }));

        return {
            _id: message._id.toString(),
            subject: message.subject,
            content: message.content,
            sender: message.sender ? {
                _id: message.sender._id.toString(),
                name: message.sender.name,
                email: message.sender.email,
                role: message.sender.role
            } : ({} as UserInfo), // Should ideally be handled
            recipients: mappedRecipients,
            recipientCount: recipients.length,
            isBroadcast: message.isBroadcast || false,
            attachments,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        };
    }

    static toMessageSummaryDTO(message: Message): MessageSummaryDTO {
        const recipients = message.recipients || [];
        return {
            _id: message._id.toString(),
            subject: message.subject,
            content: message.content,
            sender: message.sender,
            recipients: recipients,
            isBroadcast: message.isBroadcast || false,
            attachments: message.attachments,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt,
            // Helper fields if needed
            recipientsCount: recipients.length
        };
    }

    static toAdminSentMessageDTO(message: Message): AdminSentMessageResponseDTO {
        const recipients = message.recipients || [];
        let recipientsDisplay = '';

        // Logic from original controller/usecase
        if (recipients.length > 0) {
            if (message.isBroadcast || recipients.length > 10) {
                if (recipients.some(r => r.role === UserRole.Student)) {
                    recipientsDisplay = 'All Students';
                } else if (recipients.some(r => r.role === UserRole.Admin)) {
                    recipientsDisplay = 'All Admins';
                } else {
                    recipientsDisplay = 'All Users';
                }
            } else if (recipients.length === 1) {
                recipientsDisplay = recipients[0].email;
            } else {
                recipientsDisplay = 'Multiple Recipients';
            }
        }

        return {
            _id: message._id.toString(),
            subject: message.subject,
            content: message.content,
            recipients: recipientsDisplay,
            recipientCount: recipients.length,
            isBroadcast: message.isBroadcast || false,
            attachments: message.attachments,
            createdAt: message.createdAt,
            updatedAt: message.updatedAt
        };
    }
}
