import { IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../IHttp";
import {
  IGetChatsUseCase,
  IGetChatMessagesUseCase,
  IMarkMessagesAsReadUseCase,
  IAddReactionUseCase,
  IRemoveReactionUseCase,
  IGetChatDetailsUseCase,
  ICreateChatUseCase,
  ICreateGroupChatUseCase,
  IAddGroupMemberUseCase,
  IRemoveGroupMemberUseCase,
  IUpdateGroupAdminUseCase,
  IUpdateGroupSettingsUseCase,
  IUpdateGroupInfoUseCase,
  ILeaveGroupUseCase,
  IEditMessageUseCase,
  IReplyToMessageUseCase,
  IDeleteChatUseCase,
  IBlockChatUseCase,
  IClearChatUseCase,
  ISendMessageUseCase,
  ISearchChatsUseCase,
  ISearchUsersUseCase,
  IDeleteMessageUseCase
} from "../../../application/chat/useCases/IChatUseCases";
import { GetChatsRequestDTO, SearchChatsRequestDTO, GetChatMessagesRequestDTO, SendMessageRequestDTO, MarkMessagesAsReadRequestDTO, AddReactionRequestDTO, RemoveReactionRequestDTO, SearchUsersRequestDTO, CreateChatRequestDTO, CreateGroupChatRequestDTO, AddGroupMemberRequestDTO, RemoveGroupMemberRequestDTO, UpdateGroupAdminRequestDTO, UpdateGroupSettingsRequestDTO, UpdateGroupInfoRequestDTO, LeaveGroupRequestDTO, EditMessageRequestDTO, DeleteMessageRequestDTO, ReplyToMessageRequestDTO } from "../../../application/chat/dtos/ChatRequestDTOs";
import { FileUploadService } from "../../../infrastructure/services/upload/FileUploadService";
import { MessageType } from "../../../domain/chat/entities/Message";
import { cloudinary } from '../../../config/cloudinary.config';
import { socketService } from '../../../app';

export class ChatController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private _getChatsUseCase: IGetChatsUseCase,
    private _searchChatsUseCase: ISearchChatsUseCase,
    private _getChatMessagesUseCase: IGetChatMessagesUseCase,
    private _sendMessageUseCase: ISendMessageUseCase,
    private _markMessagesAsReadUseCase: IMarkMessagesAsReadUseCase,
    private _addReactionUseCase: IAddReactionUseCase,
    private _removeReactionUseCase: IRemoveReactionUseCase,
    private _getChatDetailsUseCase: IGetChatDetailsUseCase,
    private _searchUsersUseCase: ISearchUsersUseCase,
    private _createChatUseCase: ICreateChatUseCase,
    private _createGroupChatUseCase: ICreateGroupChatUseCase,
    private _addGroupMemberUseCase: IAddGroupMemberUseCase,
    private _removeGroupMemberUseCase: IRemoveGroupMemberUseCase,
    private _updateGroupAdminUseCase: IUpdateGroupAdminUseCase,
    private _updateGroupSettingsUseCase: IUpdateGroupSettingsUseCase,
    private _updateGroupInfoUseCase: IUpdateGroupInfoUseCase,
    private _leaveGroupUseCase: ILeaveGroupUseCase,
    private _editMessageUseCase: IEditMessageUseCase,
    private _deleteMessageUseCase: IDeleteMessageUseCase,
    private _replyToMessageUseCase: IReplyToMessageUseCase,
    private _deleteChatUseCase: IDeleteChatUseCase,
    private _blockChatUseCase: IBlockChatUseCase,
    private _clearChatUseCase: IClearChatUseCase
  ) {
    this._httpSuccess = new HttpSuccess();
    this._httpErrors = new HttpErrors();
  }

  async getChats(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }
    const params: GetChatsRequestDTO = {
      userId: req.user.userId,
      page: parseInt(req.query?.page as string) || 1,
      limit: parseInt(req.query?.limit as string) || 10,
    };
    const result = await this._getChatsUseCase.execute(params);
    return this._httpSuccess.success_200(result);
  }

  async searchChats(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }
    const params: SearchChatsRequestDTO = {
      userId: req.user.userId,
      query: req.query?.query as string,
      page: parseInt(req.query?.page as string) || 1,
      limit: parseInt(req.query?.limit as string) || 10,
    };
    const result = await this._searchChatsUseCase.execute(params);
    return this._httpSuccess.success_200(result);
  }

  async getChatMessages(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId || !userId) {
      return this._httpErrors.error_400("Chat ID and user ID are required");
    }
    const params: GetChatMessagesRequestDTO = {
      chatId,
      userId,
      page: parseInt(req.query?.page as string) || 1,
      limit: parseInt(req.query?.limit as string) || 20,
      before: req.query?.before as string
    };
    const result = await this._getChatMessagesUseCase.execute(params);
    return this._httpSuccess.success_200({
      messages: result.data,
      pagination: {
        totalItems: result.totalItems,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        hasMore: result.hasMore,
        oldestMessageTimestamp: result.oldestMessageTimestamp
      }
    });
  }

  async sendMessage(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }
    const { chatId } = req.params;
    if (!chatId) {
      return this._httpErrors.error_400("Chat ID is required");
    }
    let attachments = [] as Array<{ type: string; url: string; name: string; size: number; mimetype: string }>;
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        let attachmentType = 'file';
        // Multer with Cloudinary storage puts the Cloudinary URL in 'path' and public_id in 'filename'
        let url = file.path;

        if (file.mimetype.startsWith('image/')) {
          attachmentType = MessageType.Image;
        } else if (file.mimetype.startsWith('audio/')) {
          attachmentType = 'audio';
        } else if (file.mimetype.startsWith('video/')) {
          attachmentType = 'video';
        } else if ([
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain'
        ].includes(file.mimetype)) {
          attachmentType = 'document';
        }

        attachments.push({
          type: attachmentType,
          url,
          name: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
        });
      }
    }
    const messageContent = req.body.text || req.body.content || '';
    if (!messageContent && attachments.length === 0) {
      return this._httpErrors.error_400("Message content or file is required");
    }
    let replyToParsed = undefined;
    if (req.body.replyTo) {
      if (typeof req.body.replyTo === 'string') {
        try {
          replyToParsed = JSON.parse(req.body.replyTo);
        } catch (e) {
          // If parse fails, assume it's just an ID if strictly needed, but better to rely on replyToId if replyTo is invalid json
        }
      } else {
        replyToParsed = req.body.replyTo;
      }
    } else if (req.body.replyToId) {
      replyToParsed = {
        messageId: req.body.replyToId,
        content: '',
        senderId: ''
      };
    }

    const params: SendMessageRequestDTO = {
      chatId,
      senderId: req.user.userId,
      content: messageContent,
      type: attachments?.length ? (attachments[0].type === MessageType.Image ? MessageType.Image : MessageType.File) : MessageType.Text,
      attachments,
      replyTo: replyToParsed ? {
        messageId: replyToParsed.messageId || replyToParsed.id,
        content: replyToParsed.content,
        senderId: replyToParsed.senderId
      } : undefined
    };
    await this._sendMessageUseCase.execute(params);
    const messagesResult = await this._getChatMessagesUseCase.execute({
      chatId,
      userId: req.user.userId,
      page: 1,
      limit: 1,
    });
    const savedMessage = messagesResult.data && messagesResult.data.length > 0 ? messagesResult.data[0] : null;
    if (savedMessage) {
      socketService.handleNewMessage(savedMessage);
    }

    // Return the actual message object (or null if something went wrong, though it shouldn't)
    // The frontend expects the Message object
    return this._httpSuccess.success_201(savedMessage || { message: "Message sent but could not be retrieved" });
  }

  async markMessagesAsRead(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401();
    }

    const { chatId } = req.params;
    if (!chatId) {
      return this._httpErrors.error_400('Chat ID is required');
    }

    const params: MarkMessagesAsReadRequestDTO = {
      chatId,
      userId: req.user.userId
    };

    await this._markMessagesAsReadUseCase.execute(params);
    socketService.handleMessagesRead(chatId, req.user.userId);

    return this._httpSuccess.success_200({ message: 'Messages marked as read' });
  }

  async addReaction(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { messageId } = req.params;
    if (!messageId) {
      return this._httpErrors.error_400("Message ID is required");
    }

    const { emoji } = req.body;
    if (!emoji) {
      return this._httpErrors.error_400("Emoji is required");
    }

    const params: AddReactionRequestDTO = {
      messageId,
      userId: req.user.userId,
      emoji,
    };

    await this._addReactionUseCase.execute(params);
    const updatedMessage = await require('../../../infrastructure/database/mongoose/chat/MessageModel').MessageModel.findById(messageId).lean();
    if (updatedMessage) {
      socketService.handleNewMessage(updatedMessage);
    }
    return this._httpSuccess.success_200({ message: "Reaction added successfully" });
  }

  async removeReaction(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { messageId } = req.params;
    if (!messageId) {
      return this._httpErrors.error_400("Message ID is required");
    }

    const params: RemoveReactionRequestDTO = {
      messageId,
      userId: req.user.userId,
    };

    await this._removeReactionUseCase.execute(params);
    const updatedMessage = await require('../../../infrastructure/database/mongoose/chat/MessageModel').MessageModel.findById(messageId).lean();
    if (updatedMessage) {
      socketService.handleNewMessage(updatedMessage);
    }
    return this._httpSuccess.success_200({ message: "Reaction removed successfully" });
  }

  async getChatDetails(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId || !userId) {
      return this._httpErrors.error_400("Chat ID and user ID are required");
    }

    const result = await this._getChatDetailsUseCase.execute(chatId, userId);
    if (!result) {
      return this._httpErrors.error_404("Chat not found");
    }

    return this._httpSuccess.success_200(result);
  }

  async searchUsers(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const params: SearchUsersRequestDTO = {
      userId: req.user.userId,
      query: req.query?.query as string,
      page: parseInt(req.query?.page as string) || 1,
      limit: parseInt(req.query?.limit as string) || 20,
    };

    const result = await this._searchUsersUseCase.execute(params);

    return this._httpSuccess.success_200(result);
  }

  async createChat(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const params: CreateChatRequestDTO = {
      creatorId: req.user.userId,
      participantId: req.body.participantId,
      type: req.body.type || 'direct',
      name: req.body.name,
      avatar: req.body.avatar,
    };

    const result = await this._createChatUseCase.execute(params);
    return this._httpSuccess.success_201(result);
  }

  async createGroupChat(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    let { name, description, participants, settings } = req.body;
    if (typeof participants === 'string') {
      participants = JSON.parse(participants);
    }
    if (typeof settings === 'string') {
      settings = JSON.parse(settings);
    }
    const params = {
      name,
      description,
      participants,
      creatorId: req.user.userId,
      settings,
      avatar: undefined
    };
    if (req.file && req.file.path) {
      params.avatar = req.file.path;
    }

    const result = await this._createGroupChatUseCase.execute(params);

    return this._httpSuccess.success_201(result);
  }

  async addGroupMember(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId } = req.params;
    const { userId, addedBy } = req.body;
    if (!chatId || !userId) {
      return this._httpErrors.error_400("Chat ID and user ID are required");
    }

    const params: AddGroupMemberRequestDTO = {
      chatId,
      userId,
      addedBy: req.user.userId
    };

    await this._addGroupMemberUseCase.execute(params);

    const updatedChat = await this._getChatDetailsUseCase.execute(chatId, req.user.userId);
    return this._httpSuccess.success_200(updatedChat);
  }

  async removeGroupMember(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId, userId } = req.params;
    if (!chatId || !userId) {
      return this._httpErrors.error_400("Chat ID and user ID are required");
    }

    const params: RemoveGroupMemberRequestDTO = {
      chatId,
      userId,
      removedBy: req.user.userId
    };

    await this._removeGroupMemberUseCase.execute(params);

    const updatedChat = await this._getChatDetailsUseCase.execute(chatId, req.user.userId);
    return this._httpSuccess.success_200(updatedChat);
  }

  async updateGroupAdmin(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId, userId } = req.params;
    const { isAdmin } = req.body;
    if (!chatId || !userId || typeof isAdmin !== 'boolean') {
      return this._httpErrors.error_400("Chat ID, user ID, and isAdmin flag are required");
    }

    const params: UpdateGroupAdminRequestDTO = {
      chatId,
      userId,
      isAdmin,
      updatedBy: req.user.userId
    };

    await this._updateGroupAdminUseCase.execute(params);

    return this._httpSuccess.success_200({ message: "Admin status updated successfully" });
  }

  async updateGroupSettings(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId } = req.params;
    const { settings } = req.body;
    if (!chatId || !settings) {
      return this._httpErrors.error_400("Chat ID and settings are required");
    }

    const params: UpdateGroupSettingsRequestDTO = {
      chatId,
      settings,
      updatedBy: req.user.userId
    };

    await this._updateGroupSettingsUseCase.execute(params);

    return this._httpSuccess.success_200({ message: "Group settings updated successfully" });
  }

  async updateGroupInfo(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId } = req.params;
    const { name, description, avatar } = req.body;
    if (!chatId || (!name && !description && !avatar)) {
      return this._httpErrors.error_400("Chat ID and at least one field to update are required");
    }

    const params: UpdateGroupInfoRequestDTO = {
      chatId,
      name,
      description,
      avatar,
      updatedBy: req.user.userId
    };

    await this._updateGroupInfoUseCase.execute(params);

    return this._httpSuccess.success_200({ message: "Group info updated successfully" });
  }

  async leaveGroup(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId } = req.params;
    if (!chatId) {
      return this._httpErrors.error_400("Chat ID is required");
    }

    const params: LeaveGroupRequestDTO = {
      chatId,
      userId: req.user.userId
    };

    await this._leaveGroupUseCase.execute(params);

    return this._httpSuccess.success_200({ message: "Successfully left the group" });
  }

  async editMessage(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId, messageId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    await this._editMessageUseCase.execute({
      chatId,
      messageId,
      content,
      userId
    });

    const { MessageModel } = require('../../../infrastructure/database/mongoose/chat/MessageModel');
    const { ChatMapper } = require('../../../infrastructure/repositories/chat/ChatMapper');
    const updatedMessage = await MessageModel.findById(messageId).lean();
    if (updatedMessage) {
      socketService.handleNewMessage(ChatMapper.toMessageDomain(updatedMessage));
    }

    return this._httpSuccess.success_200({ message: 'Message edited successfully' });
  }

  async deleteMessage(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId, messageId } = req.params;
    const { deleteForEveryone } = req.body;
    const userId = req.user.userId;
    await this._deleteMessageUseCase.execute({
      messageId,
      userId,
      deleteForEveryone
    });
    const { MessageModel } = require('../../../infrastructure/database/mongoose/chat/MessageModel');
    const { ChatMapper } = require('../../../infrastructure/repositories/chat/ChatMapper');
    const updatedMessage = await MessageModel.findById(messageId).lean();
    if (updatedMessage) {
      socketService.handleNewMessage(ChatMapper.toMessageDomain(updatedMessage));
    }
    return this._httpSuccess.success_200({ message: 'Message deleted successfully' });
  }

  async replyToMessage(req: IHttpRequest): Promise<IHttpResponse> {
    if (!req.user?.userId) {
      return this._httpErrors.error_401("User not authenticated");
    }

    const { chatId, messageId } = req.params;
    if (!chatId || !messageId) {
      return this._httpErrors.error_400("Chat ID and Message ID are required");
    }

    const { content } = req.body;
    if (!content) {
      return this._httpErrors.error_400("Content is required");
    }

    const params: ReplyToMessageRequestDTO = {
      chatId,
      messageId,
      content,
      userId: req.user.userId
    };

    const newMessage = await this._replyToMessageUseCase.execute(params);

    if (newMessage) {
      socketService.handleNewMessage(newMessage);

      const updatedChat = await this._getChatDetailsUseCase.execute(chatId, req.user.userId);
      if (updatedChat) {
        socketService.handleUpdatedChat(updatedChat);
      }
    }

    return this._httpSuccess.success_200({ message: "Reply sent successfully", data: newMessage });
  }

  async deleteChat(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId || !userId) {
      return this._httpErrors.error_400('Chat ID and user ID are required');
    }
    await this._deleteChatUseCase.execute({ chatId, userId });
    socketService.handleDeletedChat(chatId);
    return { statusCode: 204, body: {} };
  }

  async blockChat(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId || !userId) {
      return this._httpErrors.error_400('Chat ID and user ID are required');
    }
    await this._blockChatUseCase.execute({ chatId, userId });
    const updatedChat = await this._getChatDetailsUseCase.execute(chatId, userId);
    if (updatedChat) {
      socketService.handleUpdatedChat(updatedChat);
    }
    return { statusCode: 204, body: {} };
  }

  async clearChat(req: IHttpRequest): Promise<IHttpResponse> {
    const { chatId } = req.params;
    const userId = req.user?.userId;
    if (!chatId || !userId) {
      return this._httpErrors.error_400('Chat ID and user ID are required');
    }
    await this._clearChatUseCase.execute({ chatId, userId });
    socketService.emitToUser(userId, 'messagesCleared', { chatId });
    return { statusCode: 204, body: {} };
  }
}  