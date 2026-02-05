import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getSportsComposer } from "../../../infrastructure/services/sports/SportComposers";
import { getSportRequestsComposer } from "../../../infrastructure/services/sports/SportRequestComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validateRequest } from "../../../shared/middlewares/validationMiddleware";
import {
  getSportsSchema,
  sportIdParamSchema,
  createSportSchema,
  updateSportSchema,
  getSportRequestsSchema,
  sportRequestIdParamSchema
} from "../../../shared/validation/schemas/SportSchemas";

// --- Sport Router ---
const sportRouter = Router();
const sportController = getSportsComposer();

sportRouter.get(
  "/",
  authMiddleware,
  validateRequest(getSportsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportController.getSports.bind(sportController))
);

sportRouter.get(
  "/:id",
  authMiddleware,
  validateRequest(sportIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportController.getSportById.bind(sportController))
);

sportRouter.post(
  "/",
  authMiddleware,
  validateRequest(createSportSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportController.createSport.bind(sportController))
);

sportRouter.put(
  "/:id",
  authMiddleware,
  validateRequest(updateSportSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportController.updateSport.bind(sportController))
);

sportRouter.delete(
  "/:id",
  authMiddleware,
  validateRequest(sportIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportController.deleteSport.bind(sportController))
);

// --- Sport Request Router ---
const sportRequestRouter = Router();
const sportRequestController = getSportRequestsComposer();

sportRequestRouter.get(
  "/",
  authMiddleware,
  validateRequest(getSportRequestsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportRequestController.getSportRequests.bind(sportRequestController))
);

sportRequestRouter.get(
  "/:id",
  authMiddleware,
  validateRequest(sportRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportRequestController.getSportRequestDetails.bind(sportRequestController))
);

sportRequestRouter.post(
  "/:id/approve",
  authMiddleware,
  validateRequest(sportRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportRequestController.approveSportRequest.bind(sportRequestController))
);

sportRequestRouter.post(
  "/:id/reject",
  authMiddleware,
  validateRequest(sportRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportRequestController.rejectSportRequest.bind(sportRequestController))
);

// Add joinSport route
sportRequestRouter.post(
  "/join/:id", // Standardized to use :id for sportId in params
  authMiddleware,
  validateRequest(sportIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, sportRequestController.joinSport.bind(sportRequestController))
);

export { sportRouter, sportRequestRouter };