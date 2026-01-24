import Joi from 'joi';

// Dashboard endpoints currently only rely on Auth Token (req.user), so no public params/body to validate.
// We define empty schemas to allow for future expansion (e.g., date filtering) and to maintain pattern.

export const getDashboardStatsSchema = Joi.object({});

export const getDashboardDataSchema = Joi.object({});

export const getWeeklyAttendanceSchema = Joi.object({});

export const getCoursePerformanceSchema = Joi.object({});

export const getSessionDistributionSchema = Joi.object({});

export const getRecentActivitiesSchema = Joi.object({});
