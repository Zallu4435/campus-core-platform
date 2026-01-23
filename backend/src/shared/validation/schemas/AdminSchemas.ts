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
    additionalInfo: Joi.object({
        scholarshipInfo: Joi.string().allow('').optional(),
        programDetails: Joi.string().allow('').optional(),
        additionalNotes: Joi.string().allow('').optional(),
    }).optional()
});

// rejectAdmissionSchema can be empty if no body is required, or maybe a reason?
// Looking at RejectAdmissionRequestDTO, it only needs ID (from params).
// But usually there might be a reason. Let's check DTO.
// Actually RequestDTO only has id. So schema might strictly forbid body or just be empty.
export const rejectAdmissionSchema = Joi.object({});

export const confirmAdmissionSchema = Joi.object({
    token: Joi.string().required()
    // action is in URL params
});

export const serveDocumentSchema = Joi.object({
    // validation for query/params if needed
});
