import Joi from 'joi';
import { AdminConstants } from '../../../application/admin/constants/AdminConstants';

export const getAdmissionsSchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    status: Joi.string().valid('all', 'Approved', 'Pending', 'Rejected', 'Offered').default('all'),
    program: Joi.string().allow('').optional(),
    search: Joi.string().allow('').optional(),
    dateRange: Joi.string().valid(...Object.keys(AdminConstants.FILTER_RANGES).map(k => k.toLowerCase()), 'custom', 'all').default('all'),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional()
});

export const getAdmissionByTokenSchema = Joi.object({
    token: Joi.string().required()
});

export const approveAdmissionSchema = Joi.object({
    programDetails: Joi.string().allow('').optional(),
    startDate: Joi.string().allow('').optional(),
    scholarshipInfo: Joi.string().allow('').optional(),
    additionalNotes: Joi.string().allow('').optional(),
});

export const rejectAdmissionSchema = Joi.object({
    reason: Joi.string().allow('').optional()
});

export const confirmAdmissionSchema = Joi.object({
    token: Joi.string().required()
    // action is in URL params
});

export const serveDocumentSchema = Joi.object({
    // validation for query/params if needed
});
