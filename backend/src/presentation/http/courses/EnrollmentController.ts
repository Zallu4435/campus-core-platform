import { IHttpRequest, IHttpResponse, ICourseEnrollmentController, HttpSuccess, HttpErrors } from "../IHttp";
import { IGetEnrollmentsUseCase, IApproveEnrollmentUseCase, IRejectEnrollmentUseCase, IGetCourseRequestDetailsUseCase } from "../../../application/courses/useCases/IEnrollmentUseCases";
import { GetEnrollmentsRequestDTO, ApproveEnrollmentRequestDTO, RejectEnrollmentRequestDTO, GetCourseRequestDetailsRequestDTO } from "../../../application/courses/dtos/EnrollmentRequestDTOs";

export class EnrollmentController implements ICourseEnrollmentController {
  private _httpSuccess = new HttpSuccess();
  private _httpErrors = new HttpErrors();

  constructor(
    private readonly _getEnrollmentsUseCase: IGetEnrollmentsUseCase,
    private readonly _approveEnrollmentUseCase: IApproveEnrollmentUseCase,
    private readonly _rejectEnrollmentUseCase: IRejectEnrollmentUseCase,
    private readonly _getCourseRequestDetailsUseCase: IGetCourseRequestDetailsUseCase
  ) { }

  async getEnrollments(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page = 1, limit = 10, status } = httpRequest.query;
    const params: GetEnrollmentsRequestDTO = {
      page: Number(page),
      limit: Number(limit),
      status: status as string,
    };
    const result = await this._getEnrollmentsUseCase.execute(params);
    if (!result.success) {
      return this._httpErrors.error_400("Failed to get enrollments");
    }
    return this._httpSuccess.success_200(result.data);
  }

  async getEnrollmentDetails(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const params: GetCourseRequestDetailsRequestDTO = { id };
    const result = await this._getCourseRequestDetailsUseCase.execute(params);
    if (!result.success) {
      return this._httpErrors.error_400("Failed to get enrollment details");
    }
    if (!result.data) {
      return this._httpErrors.error_404("Enrollment not found");
    }
    return this._httpSuccess.success_200(result.data);
  }

  async approveEnrollment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const params: ApproveEnrollmentRequestDTO = { enrollmentId: id };
    const result = await this._approveEnrollmentUseCase.execute(params);
    if (!result.success) {
      return this._httpErrors.error_400("Failed to approve enrollment");
    }
    return this._httpSuccess.success_200({ message: "Enrollment approved successfully" });
  }

  async rejectEnrollment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const params: RejectEnrollmentRequestDTO = { enrollmentId: id };
    const result = await this._rejectEnrollmentUseCase.execute(params);
    if (!result.success) {
      return this._httpErrors.error_400("Failed to reject enrollment");
    }
    return this._httpSuccess.success_200({ message: "Enrollment rejected successfully" });
  }
} 