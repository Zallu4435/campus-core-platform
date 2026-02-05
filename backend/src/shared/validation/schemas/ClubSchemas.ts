import Joi from 'joi';

/**
 * Club Validation Schemas
 * Validation rules for all club-related endpoints
 */

export const getClubsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        category: Joi.string().optional(),
        status: Joi.string().valid('active', 'inactive', 'all').default('all'),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        search: Joi.string().allow('').optional(),
    })
});

export const clubIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Club ID format'
        })
    })
});

export const createClubSchema = Joi.object({
    body: Joi.object({
        name: Joi.string().min(3).max(100).required(),
        type: Joi.string().min(3).max(50).required(),
        createdBy: Joi.string().required(),
        description: Joi.string().max(1000).optional(),
        members: Joi.array().items(Joi.string()).optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        icon: Joi.string().optional(),
        nextMeeting: Joi.string().optional(),
        about: Joi.string().optional(),
        enteredMembers: Joi.number().integer().min(0).optional(),
        role: Joi.string().required(),
        upcomingEvents: Joi.array().items(Joi.object({
            date: Joi.string().required(),
            description: Joi.string().required()
        })).optional(),
        status: Joi.string().valid('active', 'inactive').optional()
    })
});


export const updateClubSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
        name: Joi.string().min(3).max(100).optional(),
        type: Joi.string().min(3).max(50).optional(),
        createdBy: Joi.string().optional(),
        description: Joi.string().max(1000).optional(),
        members: Joi.array().items(Joi.string()).optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        icon: Joi.string().optional(),
        nextMeeting: Joi.string().optional(),
        about: Joi.string().optional(),
        enteredMembers: Joi.number().integer().min(0).optional(),
        role: Joi.string().optional(),
        upcomingEvents: Joi.array().items(Joi.object({
            date: Joi.string().required(),
            description: Joi.string().required()
        })).optional(),
        status: Joi.string().valid('active', 'inactive').optional()
    }).min(1)
});

export const getClubRequestsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().valid('pending', 'approved', 'rejected', 'all').default('all'),
        category: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        search: Joi.string().allow('').optional(),
    })
});

export const clubRequestIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Request ID format'
        })
    })
});
