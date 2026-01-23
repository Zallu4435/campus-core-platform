import {
  IGetCampusLifeOverviewUseCase,
  IGetEventsUseCase,
  IGetEventByIdUseCase,
  IGetSportsUseCase,
  IGetSportByIdUseCase,
  IGetClubsUseCase,
  IGetClubByIdUseCase,
  IJoinClubUseCase,
  IJoinSportUseCase,
  IJoinEventUseCase,
} from "../../../application/campus-life/useCases/ICampusLifeUseCases";
import { IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../../http/IHttp";
import { ICampusLifeController } from "../../http/IHttp";
import { CAMPUS_LIFE_CONSTANTS } from "../../../application/campus-life/constants/CampusLifeConstants";

export class CampusLifeController implements ICampusLifeController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private readonly _getCampusLifeOverviewUseCase: IGetCampusLifeOverviewUseCase,
    private readonly _getEventsUseCase: IGetEventsUseCase,
    private readonly _getEventByIdUseCase: IGetEventByIdUseCase,
    private readonly _getSportsUseCase: IGetSportsUseCase,
    private readonly _getSportByIdUseCase: IGetSportByIdUseCase,
    private readonly _getClubsUseCase: IGetClubsUseCase,
    private readonly _getClubByIdUseCase: IGetClubByIdUseCase,
    private readonly _joinClubUseCase: IJoinClubUseCase,
    private readonly _joinSportUseCase: IJoinSportUseCase,
    private readonly _joinEventUseCase: IJoinEventUseCase
  ) {
    this._httpSuccess = new HttpSuccess();
    this._httpErrors = new HttpErrors();
  }

  async getCampusLifeOverview(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getCampusLifeOverviewUseCase.execute({});
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getEvents(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      page = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.PAGE,
      limit = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.LIMIT,
      search = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.SEARCH,
      status = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.STATUS
    } = httpRequest.query;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getEventsUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      search: String(search),
      status: String(status) as 'upcoming' | 'past' | 'all',
      userId: httpRequest.user.id,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getEventById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { eventId } = httpRequest.params;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    // Admin check moved to middleware
    const result = await this._getEventByIdUseCase.execute({ eventId });
    if (!result.success) {
      return this._httpErrors.error_404();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getSports(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { type, search = "" } = httpRequest.query;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getSportsUseCase.execute({
      type: type ? String(type) as 'VARSITY SPORTS' | 'INTRAMURAL SPORTS' : undefined,
      search: String(search),
      userId: httpRequest.user.id,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getSportById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { sportId } = httpRequest.params;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getSportByIdUseCase.execute({ sportId });
    if (!result.success) {
      return this._httpErrors.error_404();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getClubs(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      search = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.SEARCH,
      type,
      status = CAMPUS_LIFE_CONSTANTS.DEFAULT_QUERY_PARAMS.STATUS
    } = httpRequest.query;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getClubsUseCase.execute({
      search: String(search),
      type: type ? String(type) : undefined,
      status: String(status) as 'active' | 'inactive' | 'all',
      userId: httpRequest.user.id,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getClubById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { clubId } = httpRequest.params;
    if (!httpRequest.user) {
      return this._httpErrors.error_401();
    }
    const result = await this._getClubByIdUseCase.execute({ clubId });
    if (!result.success) {
      return this._httpErrors.error_404();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async joinClub(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { clubId } = httpRequest.params;
    const { reason, additionalInfo } = httpRequest.body;
    const studentId = httpRequest.user?.userId;
    if (!httpRequest.user || !studentId) {
      return this._httpErrors.error_401();
    }
    const result = await this._joinClubUseCase.execute({
      clubId,
      studentId,
      reason,
      additionalInfo,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async joinSport(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { sportId } = httpRequest.params;
    const { reason, additionalInfo } = httpRequest.body;
    const studentId = httpRequest.user?.userId;
    if (!httpRequest.user || !studentId) {
      return this._httpErrors.error_401();
    }
    const result = await this._joinSportUseCase.execute({
      sportId,
      studentId,
      reason,
      additionalInfo,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }

  async joinEvent(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { eventId } = httpRequest.params;
    const { reason, additionalInfo } = httpRequest.body;
    const studentId = httpRequest.user?.userId;
    if (!httpRequest.user || !studentId) {
      return this._httpErrors.error_401();
    }
    const result = await this._joinEventUseCase.execute({
      eventId,
      studentId,
      reason,
      additionalInfo,
    });
    if (!result.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(result.data);
  }
}