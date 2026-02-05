import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getClubsComposer } from "../../../infrastructure/services/clubs/ClubComposers";
import { getClubRequestsComposer } from "../../../infrastructure/services/clubs/ClubRequestComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validateRequest } from "../../../shared/middlewares/validationMiddleware";
import {
  getClubsSchema,
  clubIdParamSchema,
  createClubSchema,
  updateClubSchema,
  getClubRequestsSchema,
  clubRequestIdParamSchema
} from "../../../shared/validation/schemas/ClubSchemas";

// --- Club Router ---
const clubRouter = Router();
const clubController = getClubsComposer();

clubRouter.get(
  "/",
  authMiddleware,
  validateRequest(getClubsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.getClubs.bind(clubController))
);

clubRouter.get(
  "/:id",
  authMiddleware,
  validateRequest(clubIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.getClubById.bind(clubController))
);

clubRouter.post(
  "/",
  authMiddleware,
  validateRequest(createClubSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.createClub.bind(clubController))
);

clubRouter.put(
  "/:id",
  authMiddleware,
  validateRequest(updateClubSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.updateClub.bind(clubController))
);

clubRouter.delete(
  "/:id",
  authMiddleware,
  validateRequest(clubIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.deleteClub.bind(clubController))
);

// --- Club Request Router ---
const clubRequestRouter = Router();
const clubRequestController = getClubRequestsComposer();

clubRequestRouter.get(
  "/",
  authMiddleware,
  validateRequest(getClubRequestsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.getClubRequests.bind(clubRequestController))
);

clubRequestRouter.get(
  "/:id",
  authMiddleware,
  validateRequest(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.getClubRequestDetails.bind(clubRequestController))
);

clubRequestRouter.post(
  "/:id/approve",
  authMiddleware,
  validateRequest(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.approveClubRequest.bind(clubRequestController))
);

clubRequestRouter.post(
  "/:id/reject",
  authMiddleware,
  validateRequest(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.rejectClubRequest.bind(clubRequestController))
);

export { clubRouter, clubRequestRouter };