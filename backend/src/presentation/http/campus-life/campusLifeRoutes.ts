import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getCampusLifeComposer } from "../../../infrastructure/services/campus-life/CampusLifeComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validateRequest } from "../../../shared/middlewares/validationMiddleware";
import { CampusLifeSchemas } from "../../../shared/validation/schemas/CampusLifeSchemas";

const campusLifeRouter = Router();
const campusLifeController = getCampusLifeComposer();

campusLifeRouter.use(authMiddleware);

campusLifeRouter.get("/", (req, res, next) =>
  expressAdapter(req, res, next, campusLifeController.getCampusLifeOverview.bind(campusLifeController))
);

campusLifeRouter.get(
  "/events",
  validateRequest(CampusLifeSchemas.getEventsSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.getEvents.bind(campusLifeController))
);

campusLifeRouter.get("/events/:eventId", (req, res, next) =>
  expressAdapter(req, res, next, campusLifeController.getEventById.bind(campusLifeController))
);

campusLifeRouter.post(
  "/events/:eventId/join",
  validateRequest(CampusLifeSchemas.joinEventSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.joinEvent.bind(campusLifeController))
);

campusLifeRouter.get(
  "/sports",
  validateRequest(CampusLifeSchemas.getSportsSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.getSports.bind(campusLifeController))
);

campusLifeRouter.get("/sports/:sportId", (req, res, next) =>
  expressAdapter(req, res, next, campusLifeController.getSportById.bind(campusLifeController))
);

campusLifeRouter.post(
  "/sports/:sportId/join",
  validateRequest(CampusLifeSchemas.joinSportSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.joinSport.bind(campusLifeController))
);

campusLifeRouter.get(
  "/clubs",
  validateRequest(CampusLifeSchemas.getClubsSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.getClubs.bind(campusLifeController))
);

campusLifeRouter.get("/clubs/:clubId", (req, res, next) =>
  expressAdapter(req, res, next, campusLifeController.getClubById.bind(campusLifeController))
);

campusLifeRouter.post(
  "/clubs/:clubId/join",
  validateRequest(CampusLifeSchemas.joinClubSchema),
  (req, res, next) => expressAdapter(req, res, next, campusLifeController.joinClub.bind(campusLifeController))
);

export default campusLifeRouter;