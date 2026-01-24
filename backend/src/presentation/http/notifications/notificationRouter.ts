import { Router } from "express";
import { authMiddleware } from "../../../shared/middlewares/authMiddleware";
import { validate } from "../../../shared/middlewares/validationMiddleware";
import { expressAdapter } from "../../adapters/ExpressAdapter";
import { getNotificationComposer } from "../../../infrastructure/services/notifications/NotificationComposers";
import {
  createNotificationSchema,
  getAllNotificationsSchema,
  notificationIdParamSchema
} from "../../../shared/validation/schemas/NotificationSchemas";

const notificationRouter = Router();
const notificationController = getNotificationComposer();

notificationRouter.post(
  "/",
  authMiddleware,
  validate(createNotificationSchema, "body"),
  (req, res, next) => expressAdapter(req, res, next, notificationController.createNotification.bind(notificationController))
);

notificationRouter.get(
  "/",
  authMiddleware,
  validate(getAllNotificationsSchema, "query"),
  (req, res, next) => expressAdapter(req, res, next, notificationController.getAllNotifications.bind(notificationController))
);

notificationRouter.get(
  "/:notificationId",
  authMiddleware,
  validate(notificationIdParamSchema, "params"),
  (req, res, next) => expressAdapter(req, res, next, notificationController.getIndividualNotification.bind(notificationController))
);

notificationRouter.delete(
  "/:notificationId",
  authMiddleware,
  validate(notificationIdParamSchema, "params"),
  (req, res, next) => expressAdapter(req, res, next, notificationController.deleteNotification.bind(notificationController))
);

notificationRouter.patch(
  "/:notificationId/read",
  authMiddleware,
  validate(notificationIdParamSchema, "params"),
  (req, res, next) => expressAdapter(req, res, next, notificationController.markNotificationAsRead.bind(notificationController))
);

notificationRouter.patch(
  "/read-all",
  authMiddleware,
  (req, res, next) => expressAdapter(req, res, next, notificationController.markAllNotificationsAsRead.bind(notificationController))
);

export default notificationRouter;