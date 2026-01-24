import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getAdmissionsComposer } from "../../../infrastructure/services/admission/AdmissionComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { admissionDocumentUpload } from "../../../config/cloudinary.config";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  createApplicationSchema,
  processPaymentSchema,
  confirmPaymentSchema,
  finalizeAdmissionSchema,
  uploadDocumentSchema,
  uploadMultipleDocumentsSchema
} from "../../../shared/validation/schemas/AdmissionSchemas";

const admissionRouter = Router();
const admissionController = getAdmissionsComposer();

admissionRouter.use(authMiddleware);

admissionRouter.post(
  "/applications",
  validate(createApplicationSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.createApplication.bind(admissionController))
);

admissionRouter.get(
  "/applications/user/:userId",
  (req, res, next) => expressAdapter(req, res, next, admissionController.getApplication.bind(admissionController))
);

admissionRouter.post(
  "/applications/:applicationId/sections/:section",
  (req, res, next) => expressAdapter(req, res, next, admissionController.saveSection.bind(admissionController))
);

admissionRouter.post(
  "/payment/process",
  validate(processPaymentSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.processPayment.bind(admissionController))
);

admissionRouter.post(
  "/payment/confirm",
  validate(confirmPaymentSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.confirmPayment.bind(admissionController))
);

admissionRouter.post(
  "/finalize",
  validate(finalizeAdmissionSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.handleFinalSubmit.bind(admissionController))
);

admissionRouter.post(
  "/documents/upload",
  admissionDocumentUpload.single('file'),
  validate(uploadDocumentSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.uploadDocument.bind(admissionController))
);

admissionRouter.post(
  "/documents/upload-multiple",
  admissionDocumentUpload.array('files', 10),
  validate(uploadMultipleDocumentsSchema, 'body'),
  (req, res, next) => expressAdapter(req, res, next, admissionController.uploadMultipleDocuments.bind(admissionController))
);

admissionRouter.get(
  "/documents/:documentId",
  (req, res, next) => expressAdapter(req, res, next, admissionController.serveDocument.bind(admissionController))
);

export default admissionRouter;