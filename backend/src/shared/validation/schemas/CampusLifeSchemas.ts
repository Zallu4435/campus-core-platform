import Joi from 'joi';

/**
 * Campus Life Validation Schemas
 * Validation rules for all campus-life endpoints
 */

export const CampusLifeSchemas = {
    /**
     * Join Event Schema
     * Validates POST /campus-life/events/:eventId/join
     */
    joinEventSchema: Joi.object({
        body: Joi.object({
            reason: Joi.string()
                .trim()
                .min(10)
                .max(500)
                .required()
                .messages({
                    'string.empty': 'Reason is required',
                    'string.min': 'Reason must be at least 10 characters',
                    'string.max': 'Reason must not exceed 500 characters',
                    'any.required': 'Reason is required'
                }),
            additionalInfo: Joi.string()
                .trim()
                .max(1000)
                .optional()
                .allow('')
                .messages({
                    'string.max': 'Additional info must not exceed 1000 characters'
                })
        }),
        params: Joi.object({
            eventId: Joi.string()
                .required()
                .messages({
                    'string.empty': 'Event ID is required'
                })
        })
    }),

    /**
     * Join Sport Schema
     * Validates POST /campus-life/sports/:sportId/join
     */
    joinSportSchema: Joi.object({
        body: Joi.object({
            reason: Joi.string()
                .trim()
                .min(10)
                .max(500)
                .required()
                .messages({
                    'string.empty': 'Reason is required',
                    'string.min': 'Reason must be at least 10 characters',
                    'string.max': 'Reason must not exceed 500 characters'
                }),
            additionalInfo: Joi.string()
                .trim()
                .max(1000)
                .optional()
                .allow('')
        }),
        params: Joi.object({
            sportId: Joi.string()
                .required()
                .messages({
                    'string.empty': 'Sport ID is required'
                })
        })
    }),

    /**
     * Join Club Schema
     * Validates POST /campus-life/clubs/:clubId/join
     */
    joinClubSchema: Joi.object({
        body: Joi.object({
            reason: Joi.string()
                .trim()
                .min(10)
                .max(500)
                .required()
                .messages({
                    'string.empty': 'Reason is required',
                    'string.min': 'Reason must be at least 10 characters',
                    'string.max': 'Reason must not exceed 500 characters'
                }),
            additionalInfo: Joi.string()
                .trim()
                .max(1000)
                .optional()
                .allow('')
        }),
        params: Joi.object({
            clubId: Joi.string()
                .required()
                .messages({
                    'string.empty': 'Club ID is required'
                })
        })
    }),

    /**
     * Get Events Schema
     * Validates GET /campus-life/events
     */
    getEventsSchema: Joi.object({
        query: Joi.object({
            page: Joi.number()
                .integer()
                .min(1)
                .default(1)
                .messages({
                    'number.min': 'Page must be at least 1'
                }),
            limit: Joi.number()
                .integer()
                .min(1)
                .max(100)
                .default(10)
                .messages({
                    'number.min': 'Limit must be at least 1',
                    'number.max': 'Limit must not exceed 100'
                }),
            search: Joi.string()
                .allow('')
                .optional(),
            status: Joi.string()
                .valid('upcoming', 'past', 'all')
                .default('all')
                .messages({
                    'any.only': 'Status must be one of: upcoming, past, all'
                })
        })
    }),

    /**
     * Get Sports Schema
     * Validates GET /campus-life/sports
     */
    getSportsSchema: Joi.object({
        query: Joi.object({
            type: Joi.string()
                .valid('VARSITY SPORTS', 'INTRAMURAL SPORTS')
                .optional()
                .messages({
                    'any.only': 'Type must be either VARSITY SPORTS or INTRAMURAL SPORTS'
                }),
            search: Joi.string()
                .allow('')
                .optional()
        })
    }),

    /**
     * Get Clubs Schema
     * Validates GET /campus-life/clubs
     */
    getClubsSchema: Joi.object({
        query: Joi.object({
            search: Joi.string()
                .allow('')
                .optional(),
            type: Joi.string()
                .optional(),
            status: Joi.string()
                .valid('active', 'inactive', 'all')
                .default('all')
                .messages({
                    'any.only': 'Status must be one of: active, inactive, all'
                })
        })
    })
};
