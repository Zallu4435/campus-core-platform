import Joi from 'joi';
import { CommunicationConstants } from '../../../application/communication/constants/CommunicationConstants';

/**
 * Communication Validation Schemas
 * Definitive validation rules for all communication endpoints
 * Mirrors the DTO structures in src/application/communication/dtos/CommunicationRequestDTOs.ts
 */

export const getInboxMessagesSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).optional(),
        search: Joi.string().allow('').optional(),
        status: Joi.string().valid(
            CommunicationConstants.STATUS.READ,
            CommunicationConstants.STATUS.UNREAD,
            CommunicationConstants.STATUS.ALL
        ).optional()
    }).unknown(true)
});

export const getSentMessagesSchema = Joi.object({
    query: Joi.object({
        page: Joi.number().min(1).optional(),
        limit: Joi.number().min(1).optional(),
        search: Joi.string().allow('').optional(),
        status: Joi.string().valid(
            CommunicationConstants.STATUS.READ,
            CommunicationConstants.STATUS.UNREAD,
            CommunicationConstants.STATUS.DELIVERED,
            CommunicationConstants.STATUS.OPENED,
            CommunicationConstants.STATUS.ALL
        ).optional()
    }).unknown(true)
});

export const sendMessageSchema = Joi.object({
    body: Joi.object({
        subject: Joi.string().trim().required().messages({
            'string.empty': 'Subject is required'
        }),
        message: Joi.string().trim().required().messages({
            'string.empty': 'Message content is required'
        }),
        to: Joi.alternatives().try(
            Joi.string(), // JSON string that will be parsed
            Joi.array().items(Joi.object({
                value: Joi.string().required(),
                label: Joi.string().required()
            }))
        ).required().messages({
            'any.required': 'Recipients are required'
        })
    }).unknown(true)
});

export const markMessageAsReadSchema = Joi.object({
    params: Joi.object({
        messageId: Joi.string().required().length(24).hex().messages({
            'string.length': 'Invalid Message ID format',
            'string.hex': 'Invalid Message ID format',
        })
    }).unknown(true)
});

export const deleteMessageSchema = Joi.object({
    params: Joi.object({
        messageId: Joi.string().required().length(24).hex()
    }).unknown(true)
});

export const getMessageDetailsSchema = Joi.object({
    params: Joi.object({
        messageId: Joi.string().required().length(24).hex()
    }).unknown(true)
});

export const getAllAdminsSchema = Joi.object({
    query: Joi.object({
        search: Joi.string().allow('').optional()
    }).unknown(true)
});

export const fetchUsersSchema = Joi.object({
    query: Joi.object({
        search: Joi.string().allow('').optional()
    }).unknown(true)
});
