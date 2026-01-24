import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getClubsComposer } from "../../../infrastructure/services/clubs/ClubComposers";
import { getClubRequestsComposer } from "../../../infrastructure/services/clubs/ClubRequestComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
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
  validate(getClubsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.getClubs.bind(clubController))
);

clubRouter.get(
  "/:id",
  authMiddleware,
  validate(clubIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.getClubById.bind(clubController))
);

clubRouter.post(
  "/",
  authMiddleware,
  validate(createClubSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.createClub.bind(clubController))
);

clubRouter.put(
  "/:id",
  authMiddleware,
  validate(updateClubSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.updateClub.bind(clubController))
);

clubRouter.delete(
  "/:id",
  authMiddleware,
  validate(clubIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubController.deleteClub.bind(clubController))
);

// --- Club Request Router ---
const clubRequestRouter = Router();
const clubRequestController = getClubRequestsComposer();

clubRequestRouter.get(
  "/",
  authMiddleware,
  validate(getClubRequestsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.getClubRequests.bind(clubRequestController))
);

clubRequestRouter.get(
  "/:id",
  authMiddleware,
  validate(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.getClubRequestDetails.bind(clubRequestController))
);

clubRequestRouter.post(
  "/:id/approve",
  authMiddleware,
  validate(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.approveClubRequest.bind(clubRequestController))
);

clubRequestRouter.post(
  "/:id/reject",
  authMiddleware,
  validate(clubRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, clubRequestController.rejectClubRequest.bind(clubRequestController))
);

export { clubRouter, clubRequestRouter };