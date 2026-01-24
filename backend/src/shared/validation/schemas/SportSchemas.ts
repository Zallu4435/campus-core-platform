import Joi from 'joi';
import { SportStatus } from '../../../domain/sports/entities/SportTypes';

/**
 * Sport Validation Schemas
 */

export const getSportsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        sportType: Joi.string().optional(),
        status: Joi.string().optional(),
        coach: Joi.string().optional(),
        startDate: Joi.string().optional(),
        endDate: Joi.string().optional(),
        search: Joi.string().allow('').optional(),
    })
});

export const sportIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Sport ID format'
        })
    })
});

export const createSportSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().min(3).max(100).required(),
        type: Joi.string().required(),
        category: Joi.string().required(),
        organizer: Joi.string().required(),
        organizerType: Joi.string().required(),
        icon: Joi.string().optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        division: Joi.string().optional(),
        headCoach: Joi.string().required(),
        homeGames: Joi.number().integer().min(0).default(0),
        record: Joi.string().optional(),
        upcomingGames: Joi.array().items(Joi.object({
            date: Joi.string().required(),
            description: Joi.string().required()
        })).optional(),
        participants: Joi.number().integer().min(0).default(0),
        status: Joi.string().valid(...Object.values(SportStatus)).optional(),
        playerCount: Joi.number().integer().min(0).optional(),
        formedOn: Joi.string().optional(),
        logo: Joi.string().optional()
    })
});

export const updateSportSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
        title: Joi.string().min(3).max(100).optional(),
        type: Joi.string().optional(),
        category: Joi.string().optional(),
        organizer: Joi.string().optional(),
        organizerType: Joi.string().optional(),
        icon: Joi.string().optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        division: Joi.string().optional(),
        headCoach: Joi.string().optional(),
        homeGames: Joi.number().integer().min(0).optional(),
        record: Joi.string().optional(),
        upcomingGames: Joi.array().items(Joi.object({
            date: Joi.string().required(),
            description: Joi.string().required()
        })).optional(),
        participants: Joi.number().integer().min(0).optional(),
        status: Joi.string().valid(...Object.values(SportStatus)).optional(),
        playerCount: Joi.number().integer().min(0).optional(),
        formedOn: Joi.string().optional(),
        logo: Joi.string().optional()
    }).min(1)
});

export const getSportRequestsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().default('all'),
        type: Joi.string().default('all'),
        startDate: Joi.string().default(''),
        endDate: Joi.string().default(''),
        search: Joi.string().allow('').default('')
    })
});

export const sportRequestIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Request ID format'
        })
    })
});
