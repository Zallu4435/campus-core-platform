import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IAdminAdmissionController } from "../IHttp";
import {
  IApproveAdmissionUseCase,
  IBlockAdmissionUseCase,
  IConfirmAdmissionOfferUseCase,
  IDeleteAdmissionUseCase,
  IGetAdmissionByIdUseCase,
  IGetAdmissionByTokenUseCase,
  IGetAdmissionsUseCase,
  IRejectAdmissionUseCase,
  IServeAdmissionDocumentUseCase
} from "../../../application/admin/useCases/IAdmissionUseCases";

export class AdminAdmissionController implements IAdminAdmissionController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _getAdmissionsUseCase: IGetAdmissionsUseCase,
    private _getAdmissionByIdUseCase: IGetAdmissionByIdUseCase,
    private _getAdmissionByTokenUseCase: IGetAdmissionByTokenUseCase,
    private _approveAdmissionUseCase: IApproveAdmissionUseCase,
    private _rejectAdmissionUseCase: IRejectAdmissionUseCase,
    private _deleteAdmissionUseCase: IDeleteAdmissionUseCase,
    private _confirmAdmissionOfferUseCase: IConfirmAdmissionOfferUseCase,
    private _blockAdmissionUseCase: IBlockAdmissionUseCase,
    private _serveAdmissionDocumentUseCase: IServeAdmissionDocumentUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async getAdmissions(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page = 1, limit = 5, status = "all", program = "all", dateRange = "all", startDate, endDate, search } = httpRequest.query || {};
    const data = await this._getAdmissionsUseCase.execute({
      page: Number(page),
      limit: Number(limit),
      status: status as any,
      program: String(program),
      dateRange: dateRange as any,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    });
    return this._httpSuccess.success_200(data);
  }

  async getAdmissionById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._getAdmissionByIdUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async getAdmissionByToken(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const { token } = httpRequest.query || {};
    const data = await this._getAdmissionByTokenUseCase.execute({
      admissionId: id,
      token: token as string,
    });
    return this._httpSuccess.success_200(data);
  }

  async approveAdmission(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const { programDetails, startDate, scholarshipInfo, additionalNotes } = httpRequest.body || {};
    const data = await this._approveAdmissionUseCase.execute({
      id,
      additionalInfo: { programDetails, startDate, scholarshipInfo, additionalNotes },
    });
    return this._httpSuccess.success_200(data);
  }

  async rejectAdmission(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._rejectAdmissionUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async deleteAdmission(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._deleteAdmissionUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async confirmAdmissionOffer(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id, action } = httpRequest.params || {};
    const { token } = httpRequest.query || {};
    const data = await this._confirmAdmissionOfferUseCase.execute({
      admissionId: id,
      token: token as string,
      action: action as "accept" | "reject",
    });
    return this._httpSuccess.success_200(data);
  }

  async serveDocument(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { documentId } = httpRequest.params || {};
    const { admissionId } = httpRequest.query || {};

    const data = await this._serveAdmissionDocumentUseCase.execute({
      admissionId: admissionId as string,
      documentId
    });

    return {
      statusCode: 200,
      body: {
        data
      }
    };
  }

  async blockAdmission(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._blockAdmissionUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }
}