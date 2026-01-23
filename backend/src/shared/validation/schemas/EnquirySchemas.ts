import Joi from 'joi';
import { EnquiryStatus } from '../../../domain/enquiry/entities/EnquiryTypes';

/**
 * Enquiry Validation Schemas
 * Definitive validation rules for all enquiry endpoints
 * Mirrors the DTO structures in src/application/enquiry/dtos/EnquiryRequestDTOs.ts
 */

export const createEnquirySchema = Joi.object({
    body: Joi.object({
        name: Joi.string().trim().min(2).max(100).required().messages({
            'string.empty': 'Name is required',
            'string.min': 'Name must be at least 2 characters',
            'string.max': 'Name cannot exceed 100 characters'
        }),
        email: Joi.string().email().required().lowercase().trim().messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),
        subject: Joi.string().trim().min(5).max(200).required().messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 5 characters',
            'string.max': 'Subject cannot exceed 200 characters'
        }),
        message: Joi.string().trim().min(10).max(2000).required().messages({
            'string.empty': 'Message is required',
            'string.min': 'Message must be at least 10 characters',
            'string.max': 'Message cannot exceed 2000 characters'
        })
    })
});

export const getEnquiriesSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        status: Joi.string().valid(...Object.values(EnquiryStatus)).optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
        search: Joi.string().trim().allow('').optional()
    })
});

export const enquiryIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().required().length(24).hex().messages({
            'string.length': 'Invalid Enquiry ID format',
            'string.hex': 'Invalid Enquiry ID format',
        })
    })
});

export const updateEnquiryStatusSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().required().length(24).hex()
    }),
    body: Joi.object({
        status: Joi.string().valid(...Object.values(EnquiryStatus)).required().messages({
            'any.only': 'Invalid status provided',
            'any.required': 'Status is required'
        })
    })
});

export const sendEnquiryReplySchema = Joi.object({
    params: Joi.object({
        id: Joi.string().required().length(24).hex()
    }),
    body: Joi.object({
        replyMessage: Joi.string().trim().min(5).max(2000).required().messages({
            'string.empty': 'Reply message is required',
            'string.min': 'Reply message must be at least 5 characters'
        })
    })
});
