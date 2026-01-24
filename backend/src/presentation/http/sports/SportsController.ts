import { IGetSportsUseCase, IGetSportByIdUseCase, ICreateSportUseCase, IUpdateSportUseCase, IDeleteSportUseCase } from "../../../application/sports/useCases/ISportUseCases";
import { GetSportsRequestDTO, GetSportByIdRequestDTO, CreateSportRequestDTO, UpdateSportRequestDTO, DeleteSportRequestDTO } from "../../../application/sports/dtos/SportRequestDTOs";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, ISportsController } from "../IHttp";

export class SportsController implements ISportsController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getSportsUseCase: IGetSportsUseCase,
    private _getSportByIdUseCase: IGetSportByIdUseCase,
    private _createSportUseCase: ICreateSportUseCase,
    private _updateSportUseCase: IUpdateSportUseCase,
    private _deleteSportUseCase: IDeleteSportUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getSports(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      page = "1",
      limit = "10",
      sportType,
      status,
      coach,
      startDate,
      endDate,
      search
    } = httpRequest.query || {};

    const getSportsRequestDTO: GetSportsRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      sportType: sportType ? String(sportType) : undefined,
      status: status ? String(status) : undefined,
      coach: coach ? String(coach) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    };

    const response = await this._getSportsUseCase.execute(getSportsRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async getSportById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const getSportByIdRequestDTO: GetSportByIdRequestDTO = { id };
    const response = await this._getSportByIdUseCase.execute(getSportByIdRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async createSport(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const createSportRequestDTO: CreateSportRequestDTO = httpRequest.body;
    const response = await this._createSportUseCase.execute(createSportRequestDTO);
    return this._httpSuccess.success_201(response);
  }

  async updateSport(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const updateSportRequestDTO: UpdateSportRequestDTO = { id, ...httpRequest.body };
    const response = await this._updateSportUseCase.execute(updateSportRequestDTO);
    return this._httpSuccess.success_200(response);
  }

  async deleteSport(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const deleteSportRequestDTO: DeleteSportRequestDTO = { id };
    const response = await this._deleteSportUseCase.execute(deleteSportRequestDTO);
    return this._httpSuccess.success_200(response);
  }
}