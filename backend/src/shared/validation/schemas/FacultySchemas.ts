import Joi from 'joi';
import { FacultyStatus, FacultyRejectedBy } from '../../../domain/faculty/enums/FacultyEnums';
import { FacultyConstants } from '../../../application/faculty/constants/FacultyConstants';

// --- Params Schemas ---
export const facultyIdParamSchema = Joi.object({
    id: Joi.string().required().messages({ 'string.empty': 'Faculty ID is required' })
});

export const facultyIdAndActionParamSchema = Joi.object({
    id: Joi.string().required(),
    action: Joi.string().valid(FacultyConstants.ACTIONS.ACCEPT, FacultyConstants.ACTIONS.REJECT).required()
});

export const facultyIdParamWithFacultyIdSchema = Joi.object({
    facultyId: Joi.string().required()
});

// --- Query Schemas ---
export const getFacultyQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(FacultyConstants.DEFAULTS.PAGE),
    limit: Joi.number().integer().min(1).max(100).default(FacultyConstants.DEFAULTS.LIMIT),
    status: Joi.string().valid(...Object.values(FacultyStatus), 'all').default(FacultyConstants.DEFAULTS.STATUS),
    department: Joi.string().trim().default(FacultyConstants.DEFAULTS.DEPARTMENT),
    dateRange: Joi.string().valid(...Object.values(FacultyConstants.DATE_RANGES), 'all').default(FacultyConstants.DEFAULTS.DATE_RANGE),
    search: Joi.string().trim().optional().allow(''),
    startDate: Joi.date().iso().optional(),
    endDate: Joi.date().iso().optional(),
});

export const getByTokenQuerySchema = Joi.object({
    token: Joi.string().required()
});

export const downloadCertificateQuerySchema = Joi.object({
    url: Joi.string().uri().required(),
    type: Joi.string().valid(FacultyConstants.DOCUMENT_TYPES.CV, FacultyConstants.DOCUMENT_TYPES.CERTIFICATE).required()
});

export const serveDocumentQuerySchema = Joi.object({
    documentUrl: Joi.string().uri().required(),
    type: Joi.string().required()
});

// --- Body Schemas ---
export const approveFacultyBodySchema = Joi.object({
    department: Joi.string().required(),
    position: Joi.string().optional(),
    startDate: Joi.date().iso().required(),
    salary: Joi.number().optional(),
    benefits: Joi.string().optional(),
    additionalNotes: Joi.string().optional().allow('')
});
