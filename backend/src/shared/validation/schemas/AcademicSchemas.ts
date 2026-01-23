import Joi from 'joi';

export const getCoursesSchema = Joi.object({
    search: Joi.string().optional().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(50).default(10),
});

export const registerCourseSchema = Joi.object({
    reason: Joi.string().optional().allow('').max(500),
});

export const requestTranscriptSchema = Joi.object({
    deliveryMethod: Joi.string().valid('electronic', 'mail').required(),
    address: Joi.string().when('deliveryMethod', {
        is: 'mail',
        then: Joi.required(),
        otherwise: Joi.optional().allow('')
    }),
    email: Joi.string().email().when('deliveryMethod', {
        is: 'electronic',
        then: Joi.required(),
        otherwise: Joi.optional().allow('')
    })
});

export const academicHistorySchema = Joi.object({
    startTerm: Joi.string().optional(),
    endTerm: Joi.string().optional()
});
