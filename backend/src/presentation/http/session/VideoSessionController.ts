import { IVideoSessionController, IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess } from '../IHttp';
import {
  ICreateVideoSessionUseCase,
  IJoinVideoSessionUseCase,
  IGetVideoSessionUseCase,
  IUpdateVideoSessionUseCase,
  IDeleteVideoSessionUseCase,
  IGetAllVideoSessionsUseCase,
  IGetUserSessionsUseCase,
  IUpdateVideoSessionStatusUseCase,
  IGetSessionAttendanceUseCase,
  IUpdateAttendanceStatusUseCase,
  IRecordAttendanceJoinUseCase,
  IRecordAttendanceLeaveUseCase
} from '../../../application/session/useCases/IVideoSessionUseCases';
import { VideoSessionStatus } from '../../../domain/session/enums/VideoSessionStatus';
import { GetSessionAttendanceRequestDTO } from '../../../application/session/dtos/VideoSessionRequestDTOs';

export class VideoSessionController implements IVideoSessionController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _createUseCase: ICreateVideoSessionUseCase,
    private _joinUseCase: IJoinVideoSessionUseCase,
    private _getUseCase: IGetVideoSessionUseCase,
    private _updateUseCase: IUpdateVideoSessionUseCase,
    private _deleteUseCase: IDeleteVideoSessionUseCase,
    private _getAllUseCase: IGetAllVideoSessionsUseCase,
    private _getUserSessionsUseCase: IGetUserSessionsUseCase,
    private _updateStatusUseCase: IUpdateVideoSessionStatusUseCase,
    private _getSessionAttendanceUseCase: IGetSessionAttendanceUseCase,
    private _updateAttendanceStatusUseCase: IUpdateAttendanceStatusUseCase,
    private _recordAttendanceJoinUseCase: IRecordAttendanceJoinUseCase,
    private _recordAttendanceLeaveUseCase: IRecordAttendanceLeaveUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async createSession(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const facultyId = httpRequest.user?.userId;
    if (!facultyId) {
      return this._httpErrors.error_401('Faculty ID not found in request');
    }
    const result = await this._createUseCase.execute({
      ...httpRequest.body,
      hostId: facultyId
    });
    return this._httpSuccess.success_201(result);
  }

  async joinSession(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id: sessionId } = httpRequest.params;
    const { participantId } = httpRequest.body;
    const result = await this._joinUseCase.execute({
      sessionId,
      participantId,
    });
    return this._httpSuccess.success_200(result);
  }

  async getSession(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const session = await this._getUseCase.execute(httpRequest.params.id);
    if (!session) return this._httpErrors.error_404('Session not found');
    return this._httpSuccess.success_200(session);
  }

  async updateSession(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const session = await this._updateUseCase.execute({
      sessionId: httpRequest.params.id,
      data: httpRequest.body
    });
    if (!session) return this._httpErrors.error_404('Session not found');
    return this._httpSuccess.success_200(session);
  }

  async deleteSession(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    await this._deleteUseCase.execute({ sessionId: httpRequest.params.id });
    return { statusCode: 204, body: {} };
  }

  async getAllSessions(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { search, status, instructor, course } = httpRequest.query;
    const sessions = await this._getAllUseCase.execute({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      instructor: instructor ? String(instructor) : undefined,
      course: course ? String(course) : undefined
    });
    return this._httpSuccess.success_200(sessions);
  }

  async getUserSessions(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { search, status, instructor, course } = httpRequest.query;
    const userId = httpRequest.user?.userId;
    const result = await this._getUserSessionsUseCase.execute({
      search: search ? String(search) : undefined,
      status: status ? String(status) : undefined,
      instructor: instructor ? String(instructor) : undefined,
      course: course ? String(course) : undefined,
      userId
    });
    return this._httpSuccess.success_200(result);
  }

  async updateSessionStatus(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { status } = httpRequest.body;

    let mappedStatus: VideoSessionStatus;
    if (status === 'live' || status === 'Ongoing') {
      mappedStatus = VideoSessionStatus.Ongoing;
    } else if (status === 'upcoming' || status === 'scheduled' || status === 'Scheduled') {
      mappedStatus = VideoSessionStatus.Scheduled;
    } else if (status === 'completed' || status === 'ended' || status === 'Ended') {
      mappedStatus = VideoSessionStatus.Ended;
    } else if (status === 'cancelled' || status === 'Cancelled') {
      mappedStatus = VideoSessionStatus.Cancelled;
    } else {
      return this._httpErrors.error_400('Invalid session status');
    }

    const session = await this._updateStatusUseCase.execute(httpRequest.params.id, mappedStatus);
    if (!session) return this._httpErrors.error_404('Session not found');
    return this._httpSuccess.success_200(session);
  }

  async getSessionAttendance(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const sessionId = httpRequest.params.id || httpRequest.params.sessionId;
    const attendance = await this._getSessionAttendanceUseCase.execute(sessionId, httpRequest.query as GetSessionAttendanceRequestDTO);
    return this._httpSuccess.success_200(attendance);
  }

  async updateAttendanceStatus(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const sessionId = httpRequest.params.id || httpRequest.params.sessionId;
    const userId = httpRequest.params.userId;
    const { status, name } = httpRequest.body;
    await this._updateAttendanceStatusUseCase.execute(sessionId, userId, status, name);
    return this._httpSuccess.success_200({ message: 'Attendance status updated' });
  }

  async recordAttendanceJoin(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const sessionId = httpRequest.params.id;
    const userId = httpRequest.user?.userId;
    if (!userId) {
      return this._httpErrors.error_401('User ID not found in request');
    }
    await this._recordAttendanceJoinUseCase.execute(sessionId, userId);
    return this._httpSuccess.success_200({ message: 'Join recorded' });
  }

  async recordAttendanceLeave(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const sessionId = httpRequest.params.id;
    const userId = httpRequest.user?.userId;
    if (!userId) {
      return this._httpErrors.error_401('User ID not found in request');
    }
    await this._recordAttendanceLeaveUseCase.execute(sessionId, userId);
    return this._httpSuccess.success_200({ message: 'Leave recorded' });
  }
}