import Joi from "joi";
import { NotificationRecipientType } from "../../../domain/notifications/entities/NotificationTypes";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createNotificationSchema = Joi.object({
    title: Joi.string().required().trim().min(3).max(100),
    message: Joi.string().required().trim().min(5).max(1000),
    recipientType: Joi.string()
        .valid(...Object.values(NotificationRecipientType))
        .required(),
    recipientId: Joi.string().when("recipientType", {
        is: NotificationRecipientType.INDIVIDUAL,
        then: Joi.string().required(),
        otherwise: Joi.string().optional().allow("", null),
    }),
    recipientName: Joi.string().optional().allow("", null),
});

export const getAllNotificationsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    recipientType: Joi.string().optional(),
    status: Joi.string().optional(),
    dateRange: Joi.string().optional(),
    isRead: Joi.boolean().optional(),
    search: Joi.string().optional().allow("", null),
});

export const notificationIdParamSchema = Joi.object({
    notificationId: Joi.string().regex(objectIdPattern).required(),
});
