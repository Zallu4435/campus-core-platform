import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IStudentDashboardController } from "../IHttp";
import {
  IGetAnnouncementsUseCase,
  IGetDeadlinesUseCase,
  IGetCalendarDaysUseCase,
  IGetClassesUseCase,
  IGetNewEventsUseCase,
  IGetUserInfoForDashboardUseCase
} from '../../../application/student/useCases/IStudentDashboardUseCases';

export class StudentDashboardController implements IStudentDashboardController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getAnnouncementsUseCase: IGetAnnouncementsUseCase,
    private _getDeadlinesUseCase: IGetDeadlinesUseCase,
    private _getClassesUseCase: IGetClassesUseCase,
    private _getCalendarDaysUseCase: IGetCalendarDaysUseCase,
    private _getNewEventsUseCase: IGetNewEventsUseCase,
    private _getUserInfoForDashboardUseCase: IGetUserInfoForDashboardUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getAnnouncements(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getAnnouncementsUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }

  async getDeadlines(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getDeadlinesUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }

  async getClasses(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getClassesUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }

  async getNewEvents(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getNewEventsUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }

  async getCalendarDays(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const { month, year } = httpRequest.query || {};
    const data = await this._getCalendarDaysUseCase.execute({
      studentId,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined
    });

    return this._httpSuccess.success_200(data);
  }

  async getUserInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getUserInfoForDashboardUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }
}