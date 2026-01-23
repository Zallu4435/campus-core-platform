import {
  IGetDiplomasUseCase,
  IGetDiplomaByIdUseCase,
  ICreateDiplomaUseCase,
  IUpdateDiplomaUseCase,
  IDeleteDiplomaUseCase,
  IEnrollStudentUseCase,
  IUnenrollStudentUseCase
} from "../../../application/diploma/useCases/IDiplomaUseCases";
import { IDiplomaController, IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors } from "../IHttp";
import { DIPLOMA_LIMITS } from "../../../application/diploma/constants/DiplomaConstants";

export class DiplomaController implements IDiplomaController {
  private _httpSuccess: HttpSuccess;
  private _httpErrors: HttpErrors;

  constructor(
    private readonly _getDiplomasUseCase: IGetDiplomasUseCase,
    private readonly _getDiplomaByIdUseCase: IGetDiplomaByIdUseCase,
    private readonly _createDiplomaUseCase: ICreateDiplomaUseCase,
    private readonly _updateDiplomaUseCase: IUpdateDiplomaUseCase,
    private readonly _deleteDiplomaUseCase: IDeleteDiplomaUseCase,
    private readonly _enrollStudentUseCase: IEnrollStudentUseCase,
    private readonly _unenrollStudentUseCase: IUnenrollStudentUseCase
  ) {

    this._httpSuccess = new HttpSuccess();
    this._httpErrors = new HttpErrors();
  }

  async getDiplomas(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const {
      page = DIPLOMA_LIMITS.DEFAULT_PAGE_SIZE,
      limit = DIPLOMA_LIMITS.DEFAULT_PAGE_SIZE,
      department = "all",
      category = "all",
      status = "all",
      instructor = "all",
      dateRange = "all",
      startDate,
      endDate,
      search
    } = httpRequest.query;

    const data = await this._getDiplomasUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      department: String(department),
      category: String(category),
      status: String(status),
      instructor: String(instructor),
      dateRange: String(dateRange),
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    });

    return this._httpSuccess.success_200(data);
  }

  async getDiplomaById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._getDiplomaByIdUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async createDiploma(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const data = await this._createDiplomaUseCase.execute(httpRequest.body);
    return this._httpSuccess.success_201(data);
  }

  async updateDiploma(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._updateDiplomaUseCase.execute({
      id,
      ...httpRequest.body,
    });
    return this._httpSuccess.success_200(data);
  }

  async deleteDiploma(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const data = await this._deleteDiplomaUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async enrollStudent(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();

    const { diplomaId } = httpRequest.params;
    const studentId = httpRequest.user.id;

    const data = await this._enrollStudentUseCase.execute({
      diplomaId,
      studentId
    });
    return this._httpSuccess.success_200(data);
  }

  async unenrollStudent(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();

    const { diplomaId } = httpRequest.params;
    const studentId = httpRequest.user.id;

    const data = await this._unenrollStudentUseCase.execute({
      diplomaId,
      studentId
    });
    return this._httpSuccess.success_200(data);
  }
}

