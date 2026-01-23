import { EnquiryStatus } from "../../../domain/enquiry/entities/EnquiryTypes";
import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IEnquiryController } from "../IHttp";
import {
  ICreateEnquiryUseCase,
  IGetEnquiriesUseCase,
  IGetEnquiryByIdUseCase,
  IUpdateEnquiryStatusUseCase,
  IDeleteEnquiryUseCase,
  ISendEnquiryReplyUseCase,
} from "../../../application/enquiry/useCases/IEnquiryUseCases";

export class EnquiryController implements IEnquiryController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private _createEnquiryUseCase: ICreateEnquiryUseCase,
    private _getEnquiriesUseCase: IGetEnquiriesUseCase,
    private _getEnquiryByIdUseCase: IGetEnquiryByIdUseCase,
    private _updateEnquiryStatusUseCase: IUpdateEnquiryStatusUseCase,
    private _deleteEnquiryUseCase: IDeleteEnquiryUseCase,
    private _sendEnquiryReplyUseCase: ISendEnquiryReplyUseCase
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async createEnquiry(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const response = await this._createEnquiryUseCase.execute(httpRequest.body);
    return this._httpSuccess.success_201(response);
  }

  async getEnquiries(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { page, limit, status, startDate, endDate, search } = httpRequest.query || {};

    const response = await this._getEnquiriesUseCase.execute({
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      status: status ? (status as EnquiryStatus) : undefined,
      startDate: startDate ? String(startDate) : undefined,
      endDate: endDate ? String(endDate) : undefined,
      search: search ? String(search) : undefined,
    });

    return this._httpSuccess.success_200(response);
  }

  async getEnquiryById(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const response = await this._getEnquiryByIdUseCase.execute({ id });
    return this._httpSuccess.success_200(response);
  }

  async updateEnquiryStatus(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const { status } = httpRequest.body;
    const response = await this._updateEnquiryStatusUseCase.execute({ id, status });
    return this._httpSuccess.success_200(response);
  }

  async deleteEnquiry(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const response = await this._deleteEnquiryUseCase.execute({ id });
    return this._httpSuccess.success_200(response);
  }

  async sendReply(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params;
    const { replyMessage } = httpRequest.body;
    const response = await this._sendEnquiryReplyUseCase.execute({ id, replyMessage });
    return this._httpSuccess.success_200(response);
  }
}