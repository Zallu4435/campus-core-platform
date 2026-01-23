import Joi from 'joi';
import { AssignmentStatus, SubmissionStatus } from '../../../domain/assignments/enums/AssignmentEnums';

/**
 * Assignment Validation Schemas
 * Validation rules for all assignment endpoints
 */

export const createAssignmentSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .required()
        .messages({
            'string.empty': 'Assignment title is required',
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 200 characters'
        }),
    subject: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            'string.empty': 'Subject is required',
            'string.min': 'Subject must be at least 2 characters',
            'string.max': 'Subject cannot exceed 100 characters'
        }),
    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .required()
        .messages({
            'string.empty': 'Description is required',
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 2000 characters'
        }),
    maxMarks: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .required()
        .messages({
            'number.base': 'Maximum marks must be a number',
            'number.min': 'Maximum marks must be at least 1',
            'number.max': 'Maximum marks cannot exceed 1000'
        }),
    dueDate: Joi.date()
        .iso()
        .min('now')
        .required()
        .messages({
            'date.base': 'Due date must be a valid date',
            'date.min': 'Due date must be in the future'
        })
});

export const updateAssignmentSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(3)
        .max(200)
        .optional()
        .messages({
            'string.min': 'Title must be at least 3 characters',
            'string.max': 'Title cannot exceed 200 characters'
        }),
    subject: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .optional()
        .messages({
            'string.min': 'Subject must be at least 2 characters',
            'string.max': 'Subject cannot exceed 100 characters'
        }),
    description: Joi.string()
        .trim()
        .min(10)
        .max(2000)
        .optional()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.max': 'Description cannot exceed 2000 characters'
        }),
    maxMarks: Joi.number()
        .integer()
        .min(1)
        .max(1000)
        .optional()
        .messages({
            'number.base': 'Maximum marks must be a number',
            'number.min': 'Maximum marks must be at least 1',
            'number.max': 'Maximum marks cannot exceed 1000'
        }),
    dueDate: Joi.date()
        .iso()
        .optional()
        .messages({
            'date.base': 'Due date must be a valid date'
        }),
    status: Joi.string()
        .valid(...Object.values(AssignmentStatus))
        .optional()
        .messages({
            'any.only': `Status must be one of: ${Object.values(AssignmentStatus).join(', ')}`
        })
});

export const reviewSubmissionSchema = Joi.object({
    marks: Joi.number()
        .min(0)
        .required()
        .messages({
            'number.base': 'Marks must be a number',
            'number.min': 'Marks cannot be negative',
            'any.required': 'Marks are required'
        }),
    feedback: Joi.string()
        .trim()
        .min(5)
        .max(1000)
        .required()
        .messages({
            'string.empty': 'Feedback is required',
            'string.min': 'Feedback must be at least 5 characters',
            'string.max': 'Feedback cannot exceed 1000 characters'
        }),
    status: Joi.string()
        .valid(...Object.values(SubmissionStatus))
        .required()
        .messages({
            'any.only': `Status must be one of: ${Object.values(SubmissionStatus).join(', ')}`,
            'any.required': 'Status is required'
        }),
    isLate: Joi.boolean()
        .optional()
        .default(false)
});

export const getAssignmentsQuerySchema = Joi.object({
    subject: Joi.string()
        .trim()
        .optional(),
    status: Joi.string()
        .valid(...Object.values(AssignmentStatus))
        .optional(),
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10),
    search: Joi.string()
        .trim()
        .optional()
});

export const getSubmissionsQuerySchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .default(1),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .optional()
        .default(10),
    search: Joi.string()
        .trim()
        .optional(),
    status: Joi.string()
        .valid(...Object.values(SubmissionStatus))
        .optional()
});

export const assignmentIdParamSchema = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'string.empty': 'Assignment ID is required'
        })
});

export const submissionIdParamSchema = Joi.object({
    assignmentId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Assignment ID is required'
        }),
    submissionId: Joi.string()
        .required()
        .messages({
            'string.empty': 'Submission ID is required'
        })
});
