import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getFacultyComposer } from "../../../infrastructure/services/faculty/FacultyComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  facultyIdParamSchema,
  facultyIdAndActionParamSchema,
  facultyIdParamWithFacultyIdSchema,
  getFacultyQuerySchema,
  getByTokenQuerySchema,
  downloadCertificateQuerySchema,
  serveDocumentQuerySchema,
  approveFacultyBodySchema
} from "../../../shared/validation/schemas/FacultySchemas";

const facultyRouter = Router();
const facultyController = getFacultyComposer();

facultyRouter.post(
  "/:id/confirm/:action",
  validate(facultyIdAndActionParamSchema, 'params'),
  validate(getByTokenQuerySchema, 'query'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.confirmFacultyOffer.bind(facultyController));
  }
);

facultyRouter.get(
  "/:id/token",
  validate(facultyIdParamSchema, 'params'),
  validate(getByTokenQuerySchema, 'query'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.getFacultyByToken.bind(facultyController));
  }
);

facultyRouter.get(
  "/",
  authMiddleware,
  validate(getFacultyQuerySchema, 'query'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.getFaculty.bind(facultyController));
  }
);

facultyRouter.get(
  "/:id",
  authMiddleware,
  validate(facultyIdParamSchema, 'params'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.getFacultyById.bind(facultyController));
  }
);

facultyRouter.post(
  "/:id/approve",
  authMiddleware,
  validate(facultyIdParamSchema, 'params'),
  validate(approveFacultyBodySchema, 'body'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.approveFaculty.bind(facultyController));
  }
);

facultyRouter.post(
  "/:id/reject",
  authMiddleware,
  validate(facultyIdParamSchema, 'params'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.rejectFaculty.bind(facultyController));
  }
);

facultyRouter.post(
  "/:id/block",
  authMiddleware,
  validate(facultyIdParamSchema, 'params'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.blockFaculty.bind(facultyController));
  }
);

facultyRouter.delete(
  "/:id",
  authMiddleware,
  validate(facultyIdParamSchema, 'params'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.deleteFaculty.bind(facultyController));
  }
);

facultyRouter.get(
  "/:facultyId/document",
  authMiddleware,
  validate(facultyIdParamWithFacultyIdSchema, 'params'),
  validate(downloadCertificateQuerySchema, 'query'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.downloadCertificate.bind(facultyController));
  }
);

facultyRouter.get(
  "/:facultyId/documents",
  authMiddleware,
  validate(facultyIdParamWithFacultyIdSchema, 'params'),
  validate(serveDocumentQuerySchema, 'query'),
  async (req, res, next) => {
    await expressAdapter(req, res, next, facultyController.serveDocument.bind(facultyController));
  }
);

export default facultyRouter;