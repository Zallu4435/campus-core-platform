import Joi from 'joi';
import { VideoConstants } from '../../../application/video/constants/VideoConstants';

export const getVideosSchema = Joi.object({
    page: Joi.number().integer().min(1).default(VideoConstants.Pagination.DEFAULT_PAGE),
    limit: Joi.number().integer().min(1).max(VideoConstants.Pagination.MAX_LIMIT).default(VideoConstants.Pagination.DEFAULT_LIMIT),
    status: Joi.string().valid('Active', 'Inactive', 'all').optional(),
    category: Joi.string().optional(),
    search: Joi.string().allow('').optional(),
    dateRange: Joi.string().valid(...Object.values(VideoConstants.DateRanges), 'all').optional(),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const createVideoSchema = Joi.object({
    title: Joi.string().required().min(3).max(100),
    category: Joi.string().required(), // This is the diploma category/id
    module: Joi.number().required(),
    status: Joi.string().valid('Active', 'Inactive').required(),
    description: Joi.string().required(),
    duration: Joi.string().required()
    // videoFile is handled by Multer, verified in controller or router level check if needed
});

export const updateVideoSchema = Joi.object({
    title: Joi.string().min(3).max(100).optional(),
    category: Joi.string().optional(),
    module: Joi.number().optional(),
    status: Joi.string().valid('Active', 'Inactive').optional(),
    description: Joi.string().optional(),
    duration: Joi.string().optional(),
    videoUrl: Joi.string().uri().optional()
});
