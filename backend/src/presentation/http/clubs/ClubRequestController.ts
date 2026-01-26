import {
  IGetClubRequestsUseCase,
  IApproveClubRequestUseCase,
  IRejectClubRequestUseCase,
  IGetClubRequestDetailsUseCase
} from "../../../application/clubs/useCases/IClubRequestUseCases";
import {
  GetClubRequestsRequestDTO,
  ApproveClubRequestRequestDTO,
  RejectClubRequestRequestDTO,
  GetClubRequestDetailsRequestDTO,
} from "../../../application/clubs/dtos/ClubRequestDTOs";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IClubRequestController } from "../IHttp";

export class ClubRequestController implements IClubRequestController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getClubRequestsUseCase: IGetClubRequestsUseCase,
    private _approveClubRequestUseCase: IApproveClubRequestUseCase,
    private _rejectClubRequestUseCase: IRejectClubRequestUseCase,
    private _getClubRequestDetailsUseCase: IGetClubRequestDetailsUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getClubRequests(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page, limit, status, category, startDate, endDate, search } = httpRequest.query || {};

    const getClubRequestsRequestDTO: GetClubRequestsRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      status: status ? String(status) : undefined,
      type: category ? String(category) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    };

    const response = await this._getClubRequestsUseCase.execute(getClubRequestsRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async approveClubRequest(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const approveClubRequestRequestDTO: ApproveClubRequestRequestDTO = { id };
    const response = await this._approveClubRequestUseCase.execute(approveClubRequestRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async rejectClubRequest(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const rejectClubRequestRequestDTO: RejectClubRequestRequestDTO = { id };
    const response = await this._rejectClubRequestUseCase.execute(rejectClubRequestRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async getClubRequestDetails(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const getClubRequestDetailsRequestDTO: GetClubRequestDetailsRequestDTO = { id };
    const response = await this._getClubRequestDetailsUseCase.execute(getClubRequestDetailsRequestDTO);
    return this._httpSuccess.success_200(response);
  }
}