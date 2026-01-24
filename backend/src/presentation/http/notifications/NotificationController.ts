import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, INotificationController } from '../IHttp';
import {
  ICreateNotificationUseCase,
  IGetAllNotificationsUseCase,
  IGetIndividualNotificationUseCase,
  IDeleteNotificationUseCase,
  IMarkNotificationAsReadUseCase,
  IMarkAllNotificationsAsReadUseCase,
} from '../../../application/notifications/useCases/INotificationUseCases';
import { NotificationMapper } from '../../../infrastructure/repositories/notifications/mappers/NotificationMapper';

export class NotificationController implements INotificationController {
  private _httpErrors = new HttpErrors();
  private _httpSuccess = new HttpSuccess();

  constructor(
    private _createNotificationUseCase: ICreateNotificationUseCase,
    private _getAllNotificationsUseCase: IGetAllNotificationsUseCase,
    private _getIndividualNotificationUseCase: IGetIndividualNotificationUseCase,
    private _deleteNotificationUseCase: IDeleteNotificationUseCase,
    private _markNotificationAsReadUseCase: IMarkNotificationAsReadUseCase,
    private _markAllNotificationsAsReadUseCase: IMarkAllNotificationsAsReadUseCase
  ) { }

  async createNotification(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const createdBy = httpRequest.user?.userId;
    if (!createdBy) return this._httpErrors.error_401();

    const result = await this._createNotificationUseCase.execute({
      ...httpRequest.body,
      createdBy
    });
    return this._httpSuccess.success_201(result);
  }

  async getAllNotifications(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    const collection = httpRequest.user?.collection;
    if (!userId || !collection) return this._httpErrors.error_401();

    const result = await this._getAllNotificationsUseCase.execute({
      ...httpRequest.query,
      userId,
      collection,
      page: Number(httpRequest.query.page || 1),
      limit: Number(httpRequest.query.limit || 10),
    });

    return this._httpSuccess.success_200({
      ...result,
      notifications: NotificationMapper.toResponseDTOList(result.notifications, userId)
    });
  }

  async getIndividualNotification(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const userId = httpRequest.user?.userId;
    const { notificationId } = httpRequest.params;
    const result = await this._getIndividualNotificationUseCase.execute({ notificationId });

    return this._httpSuccess.success_200({
      notification: NotificationMapper.toResponseDTO(result.notification, userId)
    });
  }

  async deleteNotification(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { notificationId } = httpRequest.params;
    const authenticatedUserId = httpRequest.user?.userId;
    const collection = httpRequest.user?.collection;
    if (!authenticatedUserId || !collection) return this._httpErrors.error_401();

    const result = await this._deleteNotificationUseCase.execute({ notificationId, authenticatedUserId, collection });
    return this._httpSuccess.success_200(result);
  }

  async markNotificationAsRead(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { notificationId } = httpRequest.params;
    const authenticatedUserId = httpRequest.user?.userId;
    const collection = httpRequest.user?.collection;
    if (!authenticatedUserId || !collection) return this._httpErrors.error_401();

    const result = await this._markNotificationAsReadUseCase.execute({ notificationId, authenticatedUserId, collection });
    return this._httpSuccess.success_200(result);
  }

  async markAllNotificationsAsRead(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const authenticatedUserId = httpRequest.user?.userId;
    const collection = httpRequest.user?.collection;
    if (!authenticatedUserId || !collection) return this._httpErrors.error_401();

    const result = await this._markAllNotificationsAsReadUseCase.execute({ authenticatedUserId, collection });
    return this._httpSuccess.success_200(result);
  }
}