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
import {
  CreateApplicationUseCase,
  GetApplicationUseCase,
  SaveSectionUseCase,
  ProcessPaymentUseCase,
  ConfirmPaymentUseCase,
  FinalizeAdmissionUseCase,
  UploadDocumentUseCase,
  UploadMultipleDocumentsUseCase,
  ServeDocumentUseCase,
} from "../../../application/admission/useCases/AdmissionUseCases";
import { IAdmissionsRepository } from "../../../application/admission/repositories/IAdmissionsRepository";
import { AdmissionsRepository } from "../../repositories/admission/AdmissionsRepository";
import { validationService } from "../shared/ValidationService";
import { storageService } from "../shared/CloudinaryStorageService";
import { AdmissionController } from "../../../presentation/http/admission/AdmissionController";
import { IAdmissionController } from "../../../presentation/http/IHttp";

export function getAdmissionsComposer(): IAdmissionController {
  const repository: IAdmissionsRepository = new AdmissionsRepository();
  const createApplicationUseCase: ICreateApplicationUseCase = new CreateApplicationUseCase(repository, validationService);
  const getApplicationUseCase: IGetApplicationUseCase = new GetApplicationUseCase(repository, validationService);
  const saveSectionUseCase: ISaveSectionUseCase = new SaveSectionUseCase(repository);
  const processPaymentUseCase: IProcessPaymentUseCase = new ProcessPaymentUseCase(repository);
  const confirmPaymentUseCase: IConfirmPaymentUseCase = new ConfirmPaymentUseCase(repository);
  const finalizeAdmissionUseCase: IFinalizeAdmissionUseCase = new FinalizeAdmissionUseCase(repository);
  const uploadDocumentUseCase: IUploadDocumentUseCase = new UploadDocumentUseCase(repository);
  const uploadMultipleDocumentsUseCase: IUploadMultipleDocumentsUseCase = new UploadMultipleDocumentsUseCase(repository);
  const serveDocumentUseCase: IServeDocumentUseCase = new ServeDocumentUseCase(repository, storageService);

  return new AdmissionController(
    createApplicationUseCase,
    getApplicationUseCase,
    saveSectionUseCase,
    processPaymentUseCase,
    confirmPaymentUseCase,
    finalizeAdmissionUseCase,
    uploadDocumentUseCase,
    uploadMultipleDocumentsUseCase,
    serveDocumentUseCase
  );
}