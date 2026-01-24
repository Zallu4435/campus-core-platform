import Joi from "joi";

const objectIdPattern = /^[0-9a-fA-F]{24}$/;

export const createVideoSessionSchema = Joi.object({
    title: Joi.string().required().trim(),
    startTime: Joi.date().iso(),
    date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: Joi.string().regex(/^\d{2}:\d{2}$/),
    description: Joi.string().trim().allow(""),
    instructor: Joi.string().trim().allow(""),
    course: Joi.string().trim().allow(""),
    duration: Joi.number().integer().min(0),
    maxAttendees: Joi.number().integer().min(1),
    tags: Joi.array().items(Joi.string()),
    difficulty: Joi.string().valid("beginner", "intermediate", "advanced"),
    isLive: Joi.boolean(),
    hasRecording: Joi.boolean(),
    recordingUrl: Joi.string().uri().allow(""),
}).or("startTime", "date");

export const updateVideoSessionSchema = Joi.object({
    title: Joi.string().trim(),
    startTime: Joi.date().iso(),
    date: Joi.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    time: Joi.string().regex(/^\d{2}:\d{2}$/),
    endTime: Joi.date().iso().allow(null),
    status: Joi.string(),
    description: Joi.string().trim().allow(""),
    instructor: Joi.string().trim().allow(""),
    course: Joi.string().trim().allow(""),
    duration: Joi.number().integer().min(0),
    maxAttendees: Joi.number().integer().min(1),
    tags: Joi.array().items(Joi.string()),
    difficulty: Joi.string().valid("beginner", "intermediate", "advanced"),
    isLive: Joi.boolean(),
    hasRecording: Joi.boolean(),
    recordingUrl: Joi.string().uri().allow(""),
});

export const updateSessionStatusSchema = Joi.object({
    status: Joi.string().required().valid(
        "Scheduled", "Ongoing", "Ended", "Cancelled",
        "scheduled", "live", "ended", "completed", "cancelled"
    ),
});

export const joinVideoSessionSchema = Joi.object({
    participantId: Joi.string().regex(objectIdPattern).required(),
});

export const getSessionAttendanceSchema = Joi.object({
    search: Joi.string().trim().allow(""),
    decision: Joi.string().valid("all", "approved", "denied", "pending", "approve", "deny"),
    attendanceLevel: Joi.string().valid("all", "low", "medium", "high"),
    startDate: Joi.date().iso(),
    endDate: Joi.date().iso(),
});

export const updateAttendanceStatusSchema = Joi.object({
    status: Joi.string().required().valid("approved", "denied", "pending", "approve", "deny"),
    name: Joi.string().required().trim(),
});

export const sessionIdParamSchema = Joi.object({
    id: Joi.string().regex(objectIdPattern).required(),
});

export const sessionAndUserParamSchema = Joi.object({
    sessionId: Joi.string().regex(objectIdPattern).required(),
    userId: Joi.string().regex(objectIdPattern).required(),
});
