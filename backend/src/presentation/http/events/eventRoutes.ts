import { Router } from "express";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getEventsComposer } from "../../../infrastructure/services/events/EventComposers";
import { getEventRequestsComposer } from "../../../infrastructure/services/events/EventRequestComposers";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import {
  getEventsSchema,
  eventIdParamSchema,
  createEventSchema,
  updateEventSchema,
  getEventRequestsSchema,
  eventRequestIdParamSchema
} from "../../../shared/validation/schemas/EventSchemas";

// --- Event Router ---
const eventRouter = Router();
const eventController = getEventsComposer();

eventRouter.get(
  "/",
  authMiddleware,
  validate(getEventsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventController.getEvents.bind(eventController))
);

eventRouter.get(
  "/:id",
  authMiddleware,
  validate(eventIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventController.getEventById.bind(eventController))
);

eventRouter.post(
  "/",
  authMiddleware,
  validate(createEventSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventController.createEvent.bind(eventController))
);

eventRouter.put(
  "/:id",
  authMiddleware,
  validate(updateEventSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventController.updateEvent.bind(eventController))
);

eventRouter.delete(
  "/:id",
  authMiddleware,
  validate(eventIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventController.deleteEvent.bind(eventController))
);

// --- Event Request Router ---
const eventRequestRouter = Router();
const eventRequestController = getEventRequestsComposer();

eventRequestRouter.get(
  "/",
  authMiddleware,
  validate(getEventRequestsSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventRequestController.getEventRequests.bind(eventRequestController))
);

eventRequestRouter.get(
  "/:id",
  authMiddleware,
  validate(eventRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventRequestController.getEventRequestDetails.bind(eventRequestController))
);

eventRequestRouter.post(
  "/:id/approve",
  authMiddleware,
  validate(eventRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventRequestController.approveEventRequest.bind(eventRequestController))
);

eventRequestRouter.post(
  "/:id/reject",
  authMiddleware,
  validate(eventRequestIdParamSchema),
  (req, res, next) =>
    expressAdapter(req, res, next, eventRequestController.rejectEventRequest.bind(eventRequestController))
);

export { eventRouter, eventRequestRouter };
