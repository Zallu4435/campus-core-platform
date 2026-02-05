import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IFacultyController } from "../IHttp";
import {
  IGetFacultyUseCase,
  IGetFacultyByIdUseCase,
  IGetFacultyByTokenUseCase,
  IApproveFacultyUseCase,
  IRejectFacultyUseCase,
  IDeleteFacultyUseCase,
  IConfirmFacultyOfferUseCase,
  IDownloadCertificateUseCase,
  IBlockFacultyUseCase,
  IServeDocumentUseCase,
} from "../../../application/faculty/useCases/IFacultyUseCases";
import { FacultyStatus } from "../../../domain/faculty/enums/FacultyEnums";
import { FacultyConstants } from "../../../application/faculty/constants/FacultyConstants";

export class FacultyController implements IFacultyController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getFacultyUseCase: IGetFacultyUseCase,
    private _getFacultyByIdUseCase: IGetFacultyByIdUseCase,
    private _getFacultyByTokenUseCase: IGetFacultyByTokenUseCase,
    private _approveFacultyUseCase: IApproveFacultyUseCase,
    private _rejectFacultyUseCase: IRejectFacultyUseCase,
    private _deleteFacultyUseCase: IDeleteFacultyUseCase,
    private _confirmFacultyOfferUseCase: IConfirmFacultyOfferUseCase,
    private _downloadCertificateUseCase: IDownloadCertificateUseCase,
    private _blockFacultyUseCase: IBlockFacultyUseCase,
    private _serveDocumentUseCase: IServeDocumentUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getFaculty(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page = FacultyConstants.DEFAULTS.PAGE, limit = FacultyConstants.DEFAULTS.LIMIT, status = FacultyConstants.DEFAULTS.STATUS, department = FacultyConstants.DEFAULTS.DEPARTMENT, dateRange = FacultyConstants.DEFAULTS.DATE_RANGE, search, startDate, endDate } = httpRequest.query || {};

    // Type conversion and validation
    const pageNum = Number(page);
    const limitNum = Number(limit);

    if (isNaN(pageNum) || isNaN(limitNum) || pageNum < 1 || limitNum < 1) {
      return this._httpErrors.error_400();
    }
    const response = await this._getFacultyUseCase.execute({
      page: pageNum,
      limit: limitNum,
      status: status as FacultyStatus,
      department: String(department),
      dateRange: String(dateRange),
      search: search ? String(search) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
    });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async getFacultyById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    if (!id) {
      return this._httpErrors.error_400();
    }
    const response = await this._getFacultyByIdUseCase.execute({ id });
    if (!response.success) {
      return this._httpErrors.error_404(); // Mapped to 404 in case of error, though logic relies on success flag
    }
    return this._httpSuccess.success_200(response.data);
  }

  async getFacultyByToken(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const { token } = httpRequest.query || {};
    if (!id || !token || typeof token !== "string") {
      return this._httpErrors.error_400();
    }
    const response = await this._getFacultyByTokenUseCase.execute({
      facultyId: id,
      token,
    });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    const data = response.data as any;
    if (data.faculty?.id !== id) {
      return this._httpErrors.error_400("Invalid faculty ID for this token");
    }
    return this._httpSuccess.success_200(response.data);
  }

  async approveFaculty(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const { department, position, startDate, salary, benefits, additionalNotes } = httpRequest.body || {};
    if (!id || !department || !startDate) {
      return this._httpErrors.error_400();
    }
    const response = await this._approveFacultyUseCase.execute({
      id,
      additionalInfo: { department, position, startDate, salary, benefits, additionalNotes },
    });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async rejectFaculty(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    if (!id) {
      return this._httpErrors.error_400();
    }
    const response = await this._rejectFacultyUseCase.execute({ id });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async deleteFaculty(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    if (!id) {
      return this._httpErrors.error_400();
    }
    const response = await this._deleteFacultyUseCase.execute({ id });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async confirmFacultyOffer(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id, action } = httpRequest.params || {};
    const { token } = httpRequest.query || {};
    if (!id || !action || !token || typeof token !== "string") {
      return this._httpErrors.error_400();
    }
    if (action !== FacultyConstants.ACTIONS.ACCEPT && action !== FacultyConstants.ACTIONS.REJECT) {
      return this._httpErrors.error_400();
    }
    const response = await this._confirmFacultyOfferUseCase.execute({
      facultyId: id,
      token,
      action: action as "accept" | "reject",
    });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async downloadCertificate(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { facultyId } = httpRequest.params || {};
    const { url, type } = httpRequest.query || {};
    const requestingUserId = httpRequest.user?.id;
    if (!facultyId || !url || typeof url !== "string" || !type || !requestingUserId) {
      return this._httpErrors.error_400();
    }
    const response = await this._downloadCertificateUseCase.execute({
      facultyId,
      certificateUrl: url as string,
      requestingUserId,
      type: String(type),
    });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async blockFaculty(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    if (!id) {
      return this._httpErrors.error_400();
    }
    const response = await this._blockFacultyUseCase.execute({ id });
    if (!response.success) {
      return this._httpErrors.error_400();
    }
    return this._httpSuccess.success_200(response.data);
  }

  async serveDocument(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    try {
      if (!httpRequest.user) {
        return this._httpErrors.error_401();
      }

      const { facultyId } = httpRequest.params || {};
      const { type, documentUrl } = httpRequest.query || {};

      if (!facultyId || !type || !documentUrl) {
        return this._httpErrors.error_400();
      }

      const response = await this._serveDocumentUseCase.execute({
        facultyId: facultyId as string,
        documentUrl: documentUrl as string,
        type: type as string,
        requestingUserId: httpRequest.user.id
      });

      if (!response.success) {
        const errorData = response.data as { error: string };
        return this._httpErrors.error_400(errorData.error);
      }

      const { pdfData, fileName, contentType } = response.data as { pdfData: string, fileName: string, contentType: string };

      // Structure return for express adapter which might handle body
      return {
        statusCode: 200,
        body: {
          data: {
            pdfData,
            fileName,
            contentType
          }
        }
      };
    } catch (error: any) {
      console.error('❌ [FacultyController] serveDocument error:', error);
      return this._httpErrors.error_500(error.message || "Internal Server Error");
    }
  }
}