import Joi from 'joi';
import { OrganizerType, EventType, Timeframe, EventStatus } from '../../../domain/events/entities/EventTypes';

/**
 * Event Validation Schemas
 */

export const getEventsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        type: Joi.string().optional(),
        status: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        search: Joi.string().allow('').optional(),
        organizerType: Joi.string().optional(),
        dateRange: Joi.string().optional(),
    })
});

export const eventIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Event ID format'
        })
    })
});

export const createEventSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().min(3).max(100).required(),
        organizer: Joi.string().min(2).max(100).required(),
        organizerType: Joi.string().valid(...Object.values(OrganizerType)).required(),
        eventType: Joi.string().valid(...Object.values(EventType)).required(),
        date: Joi.string().required(),
        time: Joi.string().required(),
        location: Joi.string().min(3).max(200).required(),
        timeframe: Joi.string().valid(...Object.values(Timeframe)).optional(),

        status: Joi.string().valid(...Object.values(EventStatus)).optional(),
        icon: Joi.string().optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        description: Joi.string().max(2000).optional(),
        fullTime: Joi.boolean().optional(),
        additionalInfo: Joi.string().optional(),
        requirements: Joi.string().optional(),
        maxParticipants: Joi.number().integer().min(0).optional(),
        registrationRequired: Joi.boolean().optional(),
        participants: Joi.number().integer().min(0).optional()
    })
});

export const updateEventSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required()
    }),
    body: Joi.object({
        title: Joi.string().min(3).max(100).optional(),
        organizer: Joi.string().min(2).max(100).optional(),
        organizerType: Joi.string().valid(...Object.values(OrganizerType)).optional(),
        eventType: Joi.string().valid(...Object.values(EventType)).optional(),
        date: Joi.string().optional(),
        time: Joi.string().optional(),
        location: Joi.string().min(3).max(200).optional(),
        timeframe: Joi.string().valid(...Object.values(Timeframe)).optional(),
        status: Joi.string().valid(...Object.values(EventStatus)).optional(),
        icon: Joi.string().optional(),
        color: Joi.string().pattern(/^#[0-9A-F]{6}$/i).optional(),
        description: Joi.string().max(2000).optional(),
        fullTime: Joi.boolean().optional(),
        additionalInfo: Joi.string().optional(),
        requirements: Joi.string().optional(),
        maxParticipants: Joi.number().integer().min(0).optional(),
        registrationRequired: Joi.boolean().optional(),
        participants: Joi.number().integer().min(0).optional()
    }).min(1)
});

export const getEventRequestsSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(10),
        status: Joi.string().default('all'),
        type: Joi.string().optional(),
        startDate: Joi.date().optional(),
        endDate: Joi.date().optional(),
        search: Joi.string().allow('').optional(),
        organizerType: Joi.string().optional(),
        dateRange: Joi.string().optional()
    })
});

export const eventRequestIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().pattern(/^[a-fA-F0-9]{24}$/).required().messages({
            'string.pattern.base': 'Invalid Request ID format'
        })
    })
});
