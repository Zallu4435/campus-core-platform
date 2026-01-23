import {
  IGetInboxMessagesUseCase,
  IGetSentMessagesUseCase,
  ISendMessageUseCase,
  IMarkMessageAsReadUseCase,
  IDeleteMessageUseCase,
  IGetMessageDetailsUseCase,
  IGetAllAdminsUseCase,
  IFetchUsersUseCase,
} from "../../../application/communication/useCases/ICommunicationUseCases";
import {
  GetInboxMessagesRequestDTO,
  GetSentMessagesRequestDTO,
  SendMessageRequestDTO,
  MarkMessageAsReadRequestDTO,
  DeleteMessageRequestDTO,
  GetMessageDetailsRequestDTO,
  GetAllAdminsRequestDTO,
  FetchUsersRequestDTO,
} from "../../../application/communication/dtos/CommunicationRequestDTOs";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, ICommunicationController } from "../IHttp";
import { CommunicationConstants } from "../../../application/communication/constants/CommunicationConstants";
import { CommunicationError, MessageNotFoundError, InvalidRecipientError, SenderNotFoundError } from "../../../domain/communication/errors/CommunicationErrors";

export class CommunicationController implements ICommunicationController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getInboxMessagesUseCase: IGetInboxMessagesUseCase,
    private _getSentMessagesUseCase: IGetSentMessagesUseCase,
    private _sendMessageUseCase: ISendMessageUseCase,
    private _markMessageAsReadUseCase: IMarkMessageAsReadUseCase,
    private _deleteMessageUseCase: IDeleteMessageUseCase,
    private _getMessageDetailsUseCase: IGetMessageDetailsUseCase,
    private _getAllAdminsUseCase: IGetAllAdminsUseCase,
    private _fetchUsersUseCase: IFetchUsersUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  private handleError(error: unknown): IHttpResponse {
    if (error instanceof MessageNotFoundError) {
      return this._httpErrors.error_404(error.message);
    }
    if (error instanceof CommunicationError) {
      return this._httpErrors.error_400(error.message);
    }
    if (error instanceof Error) {
      return this._httpErrors.error_500(error.message);
    }
    return this._httpErrors.error_500();
  }

  async getInboxMessages(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { page = CommunicationConstants.DEFAULTS.PAGE, limit = CommunicationConstants.DEFAULTS.LIMIT, search = CommunicationConstants.DEFAULTS.SEARCH, status = CommunicationConstants.STATUS.ALL } = httpRequest.query || {};
      const { userId } = httpRequest.user || {};
      if (!userId) {
        return this._httpErrors.error_401();
      }
      const getInboxMessagesRequestDTO: GetInboxMessagesRequestDTO = {
        userId,
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        status: status as "read" | "unread" | undefined,
      };
      const data = await this._getInboxMessagesUseCase.execute(getInboxMessagesRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getSentMessages(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { page = CommunicationConstants.DEFAULTS.PAGE, limit = CommunicationConstants.DEFAULTS.LIMIT, search = CommunicationConstants.DEFAULTS.SEARCH, status = CommunicationConstants.STATUS.ALL } = httpRequest.query || {};
      const { userId } = httpRequest.user || {};
      if (!userId) {
        return this._httpErrors.error_401();
      }
      const getSentMessagesRequestDTO: GetSentMessagesRequestDTO = {
        userId,
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        status: status as "read" | "unread" | "delivered" | "opened" | undefined,
      };
      const data = await this._getSentMessagesUseCase.execute(getSentMessagesRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async sendMessage(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { subject, message, to } = httpRequest.body || {};

      // Parse the 'to' field if it's a JSON string
      let parsedTo = to;
      if (typeof to === 'string') {
        try {
          parsedTo = JSON.parse(to);
        } catch (error) {
          return this._httpErrors.error_400("Invalid recipient format");
        }
      }

      const { userId, collection: role } = httpRequest.user || {};

      if (!userId || !role) {
        return this._httpErrors.error_401();
      }

      const attachments = (httpRequest.files || []).map((file) => ({
        filename: file.filename,
        path: file.path,
        contentType: file.mimetype,
        size: file.size,
      }));

      const sendMessageRequestDTO: SendMessageRequestDTO = {
        senderId: userId,
        senderRole: role,
        subject,
        content: message,
        to: parsedTo,
        attachments,
      };

      const data = await this._sendMessageUseCase.execute(sendMessageRequestDTO);
      return this._httpSuccess.success_201(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async markMessageAsRead(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { messageId } = httpRequest.params || {};
      const { userId } = httpRequest.user || {};
      if (!messageId || !userId) {
        return this._httpErrors.error_400(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
      }
      const markMessageAsReadRequestDTO: MarkMessageAsReadRequestDTO = {
        messageId,
        userId,
      };
      const data = await this._markMessageAsReadUseCase.execute(markMessageAsReadRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteMessage(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { messageId } = httpRequest.params || {};
      const { userId } = httpRequest.user || {};
      if (!messageId || !userId) {
        return this._httpErrors.error_400(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
      }
      const deleteMessageRequestDTO: DeleteMessageRequestDTO = {
        messageId,
        userId,
      };
      const data = await this._deleteMessageUseCase.execute(deleteMessageRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getMessageDetails(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { messageId } = httpRequest.params || {};
      const { userId } = httpRequest.user || {};
      if (!messageId || !userId) {
        return this._httpErrors.error_400(CommunicationConstants.ERRORS.INVALID_MESSAGE_ID);
      }
      const getMessageDetailsRequestDTO: GetMessageDetailsRequestDTO = {
        messageId,
        userId,
      };
      const data = await this._getMessageDetailsUseCase.execute(getMessageDetailsRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAllAdmins(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { search = "" } = httpRequest.query || {};
      const getAllAdminsRequestDTO: GetAllAdminsRequestDTO = {
        search: String(search),
      };

      const data = await this._getAllAdminsUseCase.execute(getAllAdminsRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async fetchUsers(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { search = "" } = httpRequest.query || {};
      const { userId } = httpRequest.user || {};
      if (!userId) {
        return this._httpErrors.error_401();
      }

      const fetchUsersRequestDTO: FetchUsersRequestDTO = {
        type: "all",
        search: String(search),
        requesterId: userId,
      };

      const data = await this._fetchUsersUseCase.execute(fetchUsersRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAdminInboxMessages(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { page = CommunicationConstants.DEFAULTS.PAGE, limit = CommunicationConstants.DEFAULTS.LIMIT, search = CommunicationConstants.DEFAULTS.SEARCH, status = CommunicationConstants.STATUS.ALL } = httpRequest.query || {};
      const { userId, collection: role } = httpRequest.user || {};
      if (!userId || role !== CommunicationConstants.ROLES.ADMIN) {
        return this._httpErrors.error_403();
      }
      const getInboxMessagesRequestDTO: GetInboxMessagesRequestDTO = {
        userId,
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        status: status as "read" | "unread" | undefined,
      };
      const data = await this._getInboxMessagesUseCase.execute(getInboxMessagesRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getAdminSentMessages(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { page = CommunicationConstants.DEFAULTS.PAGE, limit = CommunicationConstants.DEFAULTS.LIMIT, search = CommunicationConstants.DEFAULTS.SEARCH, status = CommunicationConstants.STATUS.ALL } = httpRequest.query || {};
      const { userId, collection: role } = httpRequest.user || {};
      if (!userId || role !== CommunicationConstants.ROLES.ADMIN) {
        return this._httpErrors.error_403();
      }
      const getSentMessagesRequestDTO: GetSentMessagesRequestDTO = {
        userId,
        page: Number(page),
        limit: Number(limit),
        search: String(search),
        status: status as "read" | "unread" | "delivered" | "opened" | undefined,
      };
      const data = await this._getSentMessagesUseCase.execute(getSentMessagesRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async sendAdminMessage(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { subject, message, to } = httpRequest.body || {};
      const { userId, collection: role } = httpRequest.user || {};
      if (!userId || role !== CommunicationConstants.ROLES.ADMIN) {
        return this._httpErrors.error_403();
      }

      // Parse the to parameter if it's a string
      let recipients;
      try {
        if (typeof to === 'string') {
          recipients = JSON.parse(to);
        } else {
          recipients = to;
        }
      } catch (error) {
        return this._httpErrors.error_400("Invalid recipient format");
      }

      // Get attachments from files
      const attachments = (httpRequest.files || []).map((file) => ({
        filename: file.filename,
        path: file.path,
        contentType: file.mimetype,
        size: file.size,
      }));

      const sendMessageRequestDTO: SendMessageRequestDTO = {
        senderId: userId,
        senderRole: role,
        subject: subject || '',
        content: message || '',
        to: recipients,
        attachments,
      };

      const data = await this._sendMessageUseCase.execute(sendMessageRequestDTO);
      return this._httpSuccess.success_201(data);
    } catch (error) {
      return this.handleError(error);
    }
  }

  async deleteAdminMessage(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      const { messageId } = httpRequest.params || {};
      const { userId, collection: role } = httpRequest.user || {};
      if (!userId || role !== CommunicationConstants.ROLES.ADMIN) {
        return this._httpErrors.error_403();
      }
      const deleteMessageRequestDTO: DeleteMessageRequestDTO = {
        messageId,
        userId,
      };
      const data = await this._deleteMessageUseCase.execute(deleteMessageRequestDTO);
      return this._httpSuccess.success_200(data);
    } catch (error) {
      return this.handleError(error);
    }
  }
}