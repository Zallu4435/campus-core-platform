import {
  IGetSportRequestsUseCase,
  IApproveSportRequestUseCase,
  IRejectSportRequestUseCase,
  IGetSportRequestDetailsUseCase,
  IJoinSportUseCase
} from "../../../application/sports/useCases/ISportRequestUseCases";
import {
  GetSportRequestsRequestDTO,
  ApproveSportRequestRequestDTO,
  RejectSportRequestRequestDTO,
  GetSportRequestDetailsRequestDTO,
  JoinSportRequestDTO
} from "../../../application/sports/dtos/SportRequestDTOs";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, ISportRequestController } from "../IHttp";

export class SportRequestController implements ISportRequestController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getSportRequestsUseCase: IGetSportRequestsUseCase,
    private _approveSportRequestUseCase: IApproveSportRequestUseCase,
    private _rejectSportRequestUseCase: IRejectSportRequestUseCase,
    private _getSportRequestDetailsUseCase: IGetSportRequestDetailsUseCase,
    private _joinSportUseCase: IJoinSportUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getSportRequests(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      page = "1",
      limit = "10",
      status = "all",
      type = "all",
      startDate = "",
      endDate = "",
      search = ""
    } = httpRequest.query || {};

    const getSportRequestsRequestDTO: GetSportRequestsRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      status: String(status),
      type: String(type),
      startDate: String(startDate),
      endDate: String(endDate),
      search: String(search),
    };

    const response = await this._getSportRequestsUseCase.execute(getSportRequestsRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async approveSportRequest(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const approveSportRequestRequestDTO: ApproveSportRequestRequestDTO = { id };
    const response = await this._approveSportRequestUseCase.execute(approveSportRequestRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async rejectSportRequest(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const rejectSportRequestRequestDTO: RejectSportRequestRequestDTO = { id };
    const response = await this._rejectSportRequestUseCase.execute(rejectSportRequestRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async getSportRequestDetails(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const getSportRequestDetailsRequestDTO: GetSportRequestDetailsRequestDTO = { id };
    const response = await this._getSportRequestDetailsUseCase.execute(getSportRequestDetailsRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async joinSport(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { sportId } = httpRequest.params || {};
    const userId = httpRequest.user?.id; // Using strict property access
    const { whyJoin, additionalInfo } = httpRequest.body || {};

    if (!sportId || !userId) {
      return this._httpErrors.error_400();
    }

    const joinSportRequestDTO: JoinSportRequestDTO = {
      sportId,
      userId,
      whyJoin,
      additionalInfo
    };

    const response = await this._joinSportUseCase.execute(joinSportRequestDTO);
    return this._httpSuccess.success_201(response);
  }
}