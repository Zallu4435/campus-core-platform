import { ICommunicationRepository } from '../repositories/ICommunicationRepository';
import {
  GetInboxMessagesRequestDTO,
  GetSentMessagesRequestDTO,
  SendMessageRequestDTO,
  MarkMessageAsReadRequestDTO,
  DeleteMessageRequestDTO,
  GetMessageDetailsRequestDTO,
  GetAllAdminsRequestDTO,
  FetchUsersRequestDTO,
} from "../dtos/CommunicationRequestDTOs";
import {
  GetInboxMessagesResponseDTO,
  GetSentMessagesResponseDTO,
  SendMessageResponseDTO,
  MarkMessageAsReadResponseDTO,
  DeleteMessageResponseDTO,
  GetMessageDetailsResponseDTO,
  GetAllAdminsResponseDTO,
  FetchUsersResponseDTO
} from "../dtos/CommunicationResponseDTOs";
import {
  IGetInboxMessagesUseCase,
  IGetSentMessagesUseCase,
  ISendMessageUseCase,
  IMarkMessageAsReadUseCase,
  IDeleteMessageUseCase,
  IGetMessageDetailsUseCase,
  IGetAllAdminsUseCase,
  IFetchUsersUseCase
} from "./ICommunicationUseCases";
import { CommunicationConstants } from '../constants/CommunicationConstants';
import { CommunicationDTOMapper } from '../dtos/CommunicationDTOMapper';
import { Message, Attachment } from '../../../domain/communication/entities/Communication';
import { CommunicationError, MessageNotFoundError } from '../../../domain/communication/errors/CommunicationErrors';

export class GetInboxMessagesUseCase implements IGetInboxMessagesUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: GetInboxMessagesRequestDTO): Promise<GetInboxMessagesResponseDTO> {
    const { userId, page, limit, search, status } = params;

    if (!userId || userId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_USER_ID);
    }
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_PAGE_LIMIT);
    }

    const result = await this._repository.getInboxMessages(userId, page, limit, search, status);

    const mappedMessages = result.messages.map((message) => CommunicationDTOMapper.toMessageSummaryDTO(message));

    return {
      messages: mappedMessages,
      pagination: {
        total: result.totalItems,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    };
  }
}

export class GetSentMessagesUseCase implements IGetSentMessagesUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: GetSentMessagesRequestDTO): Promise<GetSentMessagesResponseDTO> {
    const { userId, page, limit, search, status } = params;

    if (!userId || userId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_USER_ID);
    }
    if (isNaN(page) || page < 1 || isNaN(limit) || limit < 1) {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_PAGE_LIMIT);
    }

    const result = await this._repository.getSentMessages(userId, page, limit, search, status);

    if (!result.messages || !Array.isArray(result.messages)) {
      throw new CommunicationError(CommunicationConstants.ERRORS.FAILED_TO_RETRIEVE_MESSAGES);
    }

    try {
      const mappedMessages = result.messages.map((message) => CommunicationDTOMapper.toAdminSentMessageDTO(message));
      return {
        messages: mappedMessages,
        pagination: {
          total: result.totalItems,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      };
    } catch (error) {
      if (error instanceof Error) throw new CommunicationError(error.message);
      throw new CommunicationError(CommunicationConstants.ERRORS.FAILED_TO_PROCESS_DATA);
    }
  }
}

import { IStorageService } from '../../../application/shared/services/IStorageService';
import Logger from '../../../shared/utils/logger';

export class SendMessageUseCase implements ISendMessageUseCase {
  constructor(
    private readonly _repository: ICommunicationRepository,
    private readonly _storageService: IStorageService
  ) { }

  async execute(params: SendMessageRequestDTO): Promise<SendMessageResponseDTO> {
    if (!params.senderId || params.senderId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_SENDER_ID);
    }
    if (!params.subject || !params.content || !params.to.length) {
      throw new CommunicationError(CommunicationConstants.ERRORS.MISSING_REQUIRED_FIELDS);
    }

    let sentMessage: Message;
    const attachments: Attachment[] = params.attachments || [];

    try {
      if (params.senderRole === CommunicationConstants.ROLES.STUDENT || params.senderRole === 'user') {
        sentMessage = await this._repository.sendUserMessage(
          params.senderId,
          params.senderRole,
          params.to,
          params.subject,
          params.content,
          attachments
        );
      } else {
        sentMessage = await this._repository.sendMessage(
          params.senderId,
          params.senderRole,
          params.to,
          params.subject,
          params.content,
          attachments
        );
      }

      const mappedMessage = CommunicationDTOMapper.toMessageDetailsDTO(sentMessage);

      return mappedMessage as unknown as SendMessageResponseDTO;

    } catch (error) {
      // Cleanup: If DB Message creation fails, delete uploaded files
      if (attachments && attachments.length > 0) {
        Logger.warn('⚠️ Communication Message creation failed. Deleting uploaded attachments...');
        for (const attachment of attachments) {
          if (attachment.path) { // Note: Communication module uses 'path' for the url in attachment object
            await this._storageService.deleteFile(attachment.path);
          }
        }
      }
      // Re-throw known domain errors or convert infrastructure errors
      if (error instanceof Error) throw error;
      throw new CommunicationError("Failed to send message");
    }
  }
}

export class MarkMessageAsReadUseCase implements IMarkMessageAsReadUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: MarkMessageAsReadRequestDTO): Promise<MarkMessageAsReadResponseDTO> {
    if (!params.messageId || params.messageId.trim() === "" || !params.userId || params.userId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
    }
    // Check existence if strict
    // await this._repository.getMessageDetails...
    // Repository method logic handles update, if no match it's no-op in Mongo or throws?
    // User requested "throw error from Usecase".

    // For marking as read, strict validation often requires checking if message exists first.
    // However, for performance, fire-and-forget is common.
    // Clean Architecture Strict option:
    const message = await this._repository.getMessageDetails(params.messageId);
    if (!message) throw new MessageNotFoundError(params.messageId);

    // Authorization check could also be here: assertIsRecipient(message, userId)

    await this._repository.markMessageAsRead(params.messageId, params.userId);
    return { success: true, message: CommunicationConstants.MESSAGES.MARKED_AS_READ };
  }
}

export class DeleteMessageUseCase implements IDeleteMessageUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: DeleteMessageRequestDTO): Promise<DeleteMessageResponseDTO> {
    if (!params.messageId || params.messageId.trim() === "" || !params.userId || params.userId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
    }

    // Check existence
    const message = await this._repository.getMessageDetails(params.messageId);
    if (!message) throw new MessageNotFoundError(params.messageId);

    await this._repository.deleteMessage(params.messageId, params.userId);
    return { success: true, message: CommunicationConstants.MESSAGES.DELETED_SUCCESSFULLY };
  }
}

export class GetMessageDetailsUseCase implements IGetMessageDetailsUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: GetMessageDetailsRequestDTO): Promise<GetMessageDetailsResponseDTO> {
    if (!params.messageId || params.messageId.trim() === "") {
      throw new CommunicationError(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
    }
    const message = await this._repository.getMessageDetails(params.messageId);
    if (!message) {
      throw new MessageNotFoundError(params.messageId);
    }
    // Access control check
    if (!message.canAccess(params.userId)) {
      throw new CommunicationError(CommunicationConstants.ERRORS.UNAUTHORIZED);
    }

    return CommunicationDTOMapper.toMessageDetailsDTO(message);
  }
}

export class GetAllAdminsUseCase implements IGetAllAdminsUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: GetAllAdminsRequestDTO): Promise<GetAllAdminsResponseDTO> {
    const admins = await this._repository.getAllAdmins(params.search);
    return { admins };
  }
}

export class FetchUsersUseCase implements IFetchUsersUseCase {
  constructor(private readonly _repository: ICommunicationRepository) { }

  async execute(params: FetchUsersRequestDTO): Promise<FetchUsersResponseDTO> {
    const users = await this._repository.fetchUsers(params.type, params.search);
    const mappedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name
    }));
    return { users: mappedUsers };
  }
}
