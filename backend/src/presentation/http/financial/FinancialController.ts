import { IHttpRequest, IHttpResponse, HttpSuccess, HttpErrors, IFinancialController } from "../IHttp";
import {
  IGetStudentFinancialInfoUseCase,
  IGetAllPaymentsUseCase,
  IGetOnePaymentUseCase,
  IMakePaymentUseCase,
  IUploadDocumentUseCase,
  IGetPaymentReceiptUseCase,
  ICreateChargeUseCase,
  IGetAllChargesUseCase,
  IUpdateChargeUseCase,
  IDeleteChargeUseCase,
  ICheckPendingPaymentUseCase,
  IClearPendingPaymentUseCase
} from "../../../application/financial/useCases/IFinancialUseCases";

export class FinancialController implements IFinancialController {
  private _httpSuccess = new HttpSuccess();
  private _httpErrors = new HttpErrors();

  constructor(
    private readonly _getStudentFinancialInfoUseCase: IGetStudentFinancialInfoUseCase,
    private readonly _getAllPaymentsUseCase: IGetAllPaymentsUseCase,
    private readonly _getOnePaymentUseCase: IGetOnePaymentUseCase,
    private readonly _makePaymentUseCase: IMakePaymentUseCase,
    private readonly _uploadDocumentUseCase: IUploadDocumentUseCase,
    private readonly _getPaymentReceiptUseCase: IGetPaymentReceiptUseCase,
    private readonly _createChargeUseCase: ICreateChargeUseCase,
    private readonly _getAllChargesUseCase: IGetAllChargesUseCase,
    private readonly _updateChargeUseCase: IUpdateChargeUseCase,
    private readonly _deleteChargeUseCase: IDeleteChargeUseCase,
    private readonly _checkPendingPaymentUseCase: ICheckPendingPaymentUseCase,
    private readonly _clearPendingPaymentUseCase: IClearPendingPaymentUseCase
  ) { }

  async getStudentFinancialInfo(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._getStudentFinancialInfoUseCase.execute({ studentId });
    return this._httpSuccess.success_200(data);
  }

  async getAllPayments(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { startDate, endDate, status, studentId, page = "1", limit = "10" } = httpRequest.query || {};
    const data = await this._getAllPaymentsUseCase.execute({
      startDate: startDate as string,
      endDate: endDate as string,
      status: status as string,
      studentId: studentId as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    return this._httpSuccess.success_200(data);
  }

  async getOnePayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._getOnePaymentUseCase.execute({ paymentId: id });
    return this._httpSuccess.success_200(data);
  }

  async makePayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const { amount, method, term, chargeId, razorpayPaymentId, razorpayOrderId, razorpaySignature } = httpRequest.body || {};

    const data = await this._makePaymentUseCase.execute({
      studentId,
      amount: parseFloat(amount),
      method,
      term,
      chargeId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    });
    return this._httpSuccess.success_201(data);
  }

  async uploadDocument(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const file = httpRequest.file;
    const { type } = httpRequest.body || {};
    const data = await this._uploadDocumentUseCase.execute({ file, type });
    return this._httpSuccess.success_201(data);
  }

  async getPaymentReceipt(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { paymentId } = httpRequest.params || {};
    const studentId = httpRequest.user?.userId;
    const data = await this._getPaymentReceiptUseCase.execute({
      paymentId,
      studentId
    });
    return this._httpSuccess.success_200(data);
  }

  async createCharge(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { title, description, amount, term, dueDate, applicableFor } = httpRequest.body || {};
    const createdBy = httpRequest.user?.userId;
    const data = await this._createChargeUseCase.execute({
      title,
      description,
      amount,
      term,
      dueDate,
      applicableFor,
      createdBy,
    });
    return this._httpSuccess.success_201(data);
  }

  async getAllCharges(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { term, status, search, page = "1", limit = "10" } = httpRequest.query || {};
    const data = await this._getAllChargesUseCase.execute({
      term: term as string,
      status: status as string,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    return this._httpSuccess.success_200(data);
  }

  async updateCharge(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._updateChargeUseCase.execute({ id, data: httpRequest.body });
    return this._httpSuccess.success_200(data);
  }

  async deleteCharge(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const { id } = httpRequest.params || {};
    const data = await this._deleteChargeUseCase.execute({ id });
    return this._httpSuccess.success_200(data);
  }

  async checkPendingPayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._checkPendingPaymentUseCase.execute(studentId as string);
    return this._httpSuccess.success_200(data);
  }

  async clearPendingPayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    const studentId = httpRequest.user?.userId;
    const data = await this._clearPendingPaymentUseCase.execute(studentId as string);
    return this._httpSuccess.success_200(data);
  }
}