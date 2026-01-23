import Joi from 'joi';

export const diplomaSchemas = {
    getDiplomas: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        department: Joi.string().default('all'),
        category: Joi.string().default('all'),
        status: Joi.string().default('all'),
        instructor: Joi.string().default('all'),
        dateRange: Joi.string().default('all'),
        search: Joi.string().allow('', null),
        startDate: Joi.string().isoDate().when('dateRange', { is: 'custom', then: Joi.required() }),
        endDate: Joi.string().isoDate().when('dateRange', { is: 'custom', then: Joi.required() }),
    }),

    createDiploma: Joi.object({
        title: Joi.string().required().trim(),
        description: Joi.string().required(),
        price: Joi.number().min(0).required(),
        category: Joi.string().required().trim(),
        thumbnail: Joi.string().uri().allow('', null),
        duration: Joi.string().required(),
        prerequisites: Joi.array().items(Joi.string()).default([]),
        status: Joi.boolean().default(true),
    }),

    updateDiploma: Joi.object({
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required(),
        title: Joi.string().trim(),
        description: Joi.string(),
        price: Joi.number().min(0),
        category: Joi.string().trim(),
        thumbnail: Joi.string().uri().allow('', null),
        duration: Joi.string(),
        prerequisites: Joi.array().items(Joi.string()),
        status: Joi.boolean(),
    }),

    getUserDiplomas: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        category: Joi.string().default('all'),
        status: Joi.string().default('all'),
        dateRange: Joi.string().default('all'),
    }),

    updateProgress: Joi.object({
        progress: Joi.number().min(0).max(100).required(),
    }),

    diplomaIdParam: Joi.object({
        id: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Diploma ID format'
        }),
    }),

    enrollParam: Joi.object({
        diplomaId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Diploma ID format'
        }),
    }),

    chapterParams: Joi.object({
        courseId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Course ID format'
        }),
        chapterId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Chapter ID format'
        }),
    }),

    courseIdParam: Joi.object({
        courseId: Joi.string().regex(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Course ID format'
        }),
    })
};
