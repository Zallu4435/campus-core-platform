import Joi from 'joi';

export const getVideosSchema = Joi.object({
    page: Joi.number().min(1).optional(),
    limit: Joi.number().min(1).optional(),
    category: Joi.string().optional(),
    status: Joi.string().optional(),
    search: Joi.string().optional(),
    dateRange: Joi.string().optional(),
    startDate: Joi.string().isoDate().optional(),
    endDate: Joi.string().isoDate().optional(),
});

export const getVideoByIdSchema = Joi.object({
    id: Joi.string().required()
});

export const createVideoSchema = Joi.object({
    title: Joi.string().required(),
    category: Joi.string().required(),
    module: Joi.number().required(),
    status: Joi.string().required(),
    description: Joi.string().required(),
    duration: Joi.string().required(),
    // videoFile is handled by multer
});

export const updateVideoSchema = Joi.object({
    title: Joi.string().optional(),
    category: Joi.string().optional(),
    module: Joi.number().optional(),
    status: Joi.string().optional(),
    description: Joi.string().optional(),
    duration: Joi.string().optional(),
    videoUrl: Joi.string().uri().optional(),
    // videoFile is handled by multer
});
