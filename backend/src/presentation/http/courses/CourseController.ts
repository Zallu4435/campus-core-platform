import { IHttpRequest, IHttpResponse, ICourseController, HttpSuccess, HttpErrors } from "../IHttp";
import { IGetCoursesUseCase, IGetCourseByIdUseCase, ICreateCourseUseCase, IUpdateCourseUseCase, IDeleteCourseUseCase } from "../../../application/courses/useCases/ICourseUseCases";
import { GetCoursesRequestDTO, GetCourseByIdRequestDTO, CreateCourseRequestDTO, UpdateCourseRequestDTO, DeleteCourseRequestDTO } from "../../../application/courses/dtos/CourseRequestDTOs";
import { COURSE_LIMITS } from "../../../application/courses/constants/CourseConstants";

export class CourseController implements ICourseController {
  private _httpSuccess = new HttpSuccess();
  private _httpErrors = new HttpErrors();

  constructor(
    private readonly _getCoursesUseCase: IGetCoursesUseCase,
    private readonly _getCourseByIdUseCase: IGetCourseByIdUseCase,
    private readonly _createCourseUseCase: ICreateCourseUseCase,
    private readonly _updateCourseUseCase: IUpdateCourseUseCase,
    private readonly _deleteCourseUseCase: IDeleteCourseUseCase
  ) { }

  async getCourses(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page = 1, limit = COURSE_LIMITS.DEFAULT_PAGE_SIZE, search, specialization, faculty, term } = httpRequest.query;
    const params: GetCoursesRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      search: search as string,
      specialization: specialization as string,
      faculty: faculty as string,
      term: term as string,
    };
    const data = await this._getCoursesUseCase.execute(params);
    return this._httpSuccess.success_200(data);
  }

  async getCourseById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const params: GetCourseByIdRequestDTO = { id };
    const data = await this._getCourseByIdUseCase.execute(params);
    return this._httpSuccess.success_200(data);
  }

  async createCourse(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { _id: _omitId, id: _omitStringId, ...body } = (httpRequest.body || {}) as Record<string, unknown>;
    const params: CreateCourseRequestDTO = body as CreateCourseRequestDTO;
    const data = await this._createCourseUseCase.execute(params);
    return this._httpSuccess.success_201(data);
  }

  async updateCourse(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    // Prevent client from overriding identifiers in the payload
    const { _id: _omitId, id: _omitStringId, ...body } = (httpRequest.body || {}) as Record<string, unknown>;
    const params: UpdateCourseRequestDTO = {
      id,
      ...body,
    };
    const data = await this._updateCourseUseCase.execute(params);
    return this._httpSuccess.success_200(data);
  }

  async deleteCourse(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const params: DeleteCourseRequestDTO = { id };
    await this._deleteCourseUseCase.execute(params);
    return { statusCode: 204, body: { data: null } };
  }
} 