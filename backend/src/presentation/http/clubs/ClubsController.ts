import {
  IGetClubsUseCase,
  IGetClubByIdUseCase,
  ICreateClubUseCase,
  IUpdateClubUseCase,
  IDeleteClubUseCase,
} from "../../../application/clubs/useCases/IClubUseCases";
import {
  GetClubsRequestDTO,
  GetClubByIdRequestDTO,
  CreateClubRequestDTO,
  UpdateClubRequestDTO,
  DeleteClubRequestDTO,
} from "../../../application/clubs/dtos/ClubRequestDTOs";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IClubsController } from "../IHttp";

export class ClubsController implements IClubsController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getClubsUseCase: IGetClubsUseCase,
    private _getClubByIdUseCase: IGetClubByIdUseCase,
    private _createClubUseCase: ICreateClubUseCase,
    private _updateClubUseCase: IUpdateClubUseCase,
    private _deleteClubUseCase: IDeleteClubUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getClubs(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page, limit, category, status, startDate, endDate, search } = httpRequest.query || {};

    const getClubsRequestDTO: GetClubsRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      category: category ? String(category) : undefined,
      status: status ? String(status) : undefined,
      startDate: startDate ? new Date(String(startDate)) : undefined,
      endDate: endDate ? new Date(String(endDate)) : undefined,
      search: search ? String(search) : undefined,
    };

    const response = await this._getClubsUseCase.execute(getClubsRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async getClubById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const getClubByIdRequestDTO: GetClubByIdRequestDTO = { id };
    const response = await this._getClubByIdUseCase.execute(getClubByIdRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async createClub(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const clubData = httpRequest.body || {};
    const createClubRequestDTO: CreateClubRequestDTO = clubData;
    const response = await this._createClubUseCase.execute(createClubRequestDTO);
    return this._httpSuccess.success_201(response);
  }

  async updateClub(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const clubData = httpRequest.body || {};
    const updateClubRequestDTO: UpdateClubRequestDTO = { id, ...clubData };
    const response = await this._updateClubUseCase.execute(updateClubRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async deleteClub(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const deleteClubRequestDTO: DeleteClubRequestDTO = { id };
    const response = await this._deleteClubUseCase.execute(deleteClubRequestDTO);
    return this._httpSuccess.success_200(response);
  }
}