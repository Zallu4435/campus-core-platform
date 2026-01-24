import { IHttpRequest, IHttpResponse, HttpErrors, HttpSuccess, IAdmissionController } from "../IHttp";
import {
  ICreateApplicationUseCase,
  IGetApplicationUseCase,
  ISaveSectionUseCase,
  IProcessPaymentUseCase,
  IConfirmPaymentUseCase,
  IFinalizeAdmissionUseCase,
  IUploadDocumentUseCase,
  IUploadMultipleDocumentsUseCase,
  IServeDocumentUseCase,
} from "../../../application/admission/useCases/IAdmissionUseCases";

export class AdmissionController implements IAdmissionController {
  private _httpErrors: HttpErrors;
  private _httpSuccess: HttpSuccess;

  constructor(
    private readonly _createApplicationUseCase: ICreateApplicationUseCase,
    private readonly _getApplicationUseCase: IGetApplicationUseCase,
    private readonly _saveSectionUseCase: ISaveSectionUseCase,
    private readonly _processPaymentUseCase: IProcessPaymentUseCase,
    private readonly _confirmPaymentUseCase: IConfirmPaymentUseCase,
    private readonly _finalizeAdmissionUseCase: IFinalizeAdmissionUseCase,
    private readonly _uploadDocumentUseCase: IUploadDocumentUseCase,
    private readonly _uploadMultipleDocumentsUseCase: IUploadMultipleDocumentsUseCase,
    private readonly _serveDocumentUseCase: IServeDocumentUseCase,
  ) {
    this._httpErrors = new HttpErrors();
    this._httpSuccess = new HttpSuccess();
  }

  async createApplication(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { userId: registerId } = httpRequest.user;
    const { userId } = httpRequest.body || {};
    if (!userId || userId !== registerId) {
      return this._httpErrors.error_400("Register ID mismatch");
    }
    const result = await this._createApplicationUseCase.execute({ userId });
    return this._httpSuccess.success_201(result);
  }

  async getApplication(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { userId: registerId } = httpRequest.user;
    const { userId } = httpRequest.params || {};
    if (userId !== registerId) return this._httpErrors.error_403();
    const result = await this._getApplicationUseCase.execute({ userId });
    return this._httpSuccess.success_200(result);
  }

  async saveSection(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { applicationId, section } = httpRequest.params || {};
    const data = httpRequest.body;
    if (!applicationId || !section) return this._httpErrors.error_400("Application ID and Section required");
    const result = await this._saveSectionUseCase.execute({ applicationId, section, data });
    return this._httpSuccess.success_200(result);
  }

  async processPayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { applicationId, paymentDetails } = httpRequest.body || {};
    if (!applicationId || !paymentDetails) return this._httpErrors.error_400("Application ID and Payment Details required");
    const result = await this._processPaymentUseCase.execute({ applicationId, paymentDetails });
    return this._httpSuccess.success_200(result);
  }

  async confirmPayment(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { paymentId, stripePaymentIntentId } = httpRequest.body || {};
    if (!paymentId || !stripePaymentIntentId) return this._httpErrors.error_400("Payment ID and Stripe Intent ID required");
    const result = await this._confirmPaymentUseCase.execute({ paymentId, stripePaymentIntentId });
    return this._httpSuccess.success_200(result);
  }

  async handleFinalSubmit(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { applicationId, paymentId } = httpRequest.body || {};
    if (!applicationId || !paymentId) return this._httpErrors.error_400("Application ID and Payment ID required");
    const result = await this._finalizeAdmissionUseCase.execute({ applicationId, paymentId });
    return this._httpSuccess.success_200({ message: "Admission finalized", admission: result });
  }

  async uploadDocument(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { applicationId, documentType } = httpRequest.body || {};
    const file = httpRequest.file;
    if (!applicationId || !documentType || !file) return this._httpErrors.error_400("Application ID, Document Type and File required");
    const result = await this._uploadDocumentUseCase.execute({ applicationId, documentType, file });
    return this._httpSuccess.success_200(result);
  }

  async uploadMultipleDocuments(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { applicationId } = httpRequest.body || {};
    const files = httpRequest.files || [];
    if (!applicationId || !files || (files as Express.Multer.File[]).length === 0) {
      return this._httpErrors.error_400("Application ID and files required");
    }
    const result = await this._uploadMultipleDocumentsUseCase.execute({
      applicationId,
      files: files as Express.Multer.File[],
      documentTypes: Array((files as Express.Multer.File[]).length).fill('general')
    });
    return this._httpSuccess.success_200(result);
  }

  async serveDocument(httpRequest: IHttpRequest): Promise<IHttpResponse> {
    if (!httpRequest.user) return this._httpErrors.error_401();
    const { userId } = httpRequest.user;
    const { documentId } = httpRequest.params || {};
    if (!documentId) {
      return this._httpErrors.error_400("Document ID required");
    }
    const result = await this._serveDocumentUseCase.execute({ userId, documentId });
    if (!result) return this._httpErrors.error_404("Document not found or inaccessible");

    return this._httpSuccess.success_200(result);
  }
}