import Joi from 'joi';
import { COURSE_LIMITS } from '../../../application/courses/constants/CourseConstants';

/**
 * Course Validation Schemas
 * Definitive validation rules for all course endpoints
 * Mirrors the DTO structures in src/application/courses/dtos/CourseRequestDTOs.ts
 */

export const createCourseSchema = Joi.object({
    title: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .required()
        .messages({
            'string.min': 'Course title must be at least 5 characters',
            'string.max': 'Course title cannot exceed 100 characters',
            'string.empty': 'Course title is required'
        }),
    specialization: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Specialization is required'
        }),
    faculty: Joi.string()
        .trim()
        .required() // This assumes faculty ID or Name is passed as string
        .messages({
            'string.empty': 'Faculty assignment is required'
        }),
    credits: Joi.number()
        .integer()
        .min(1)
        .max(COURSE_LIMITS.MAX_CREDITS)
        .required()
        .messages({
            'number.min': 'Credits must be at least 1',
            'number.max': `Credits cannot exceed ${COURSE_LIMITS.MAX_CREDITS}`,
            'number.base': 'Credits must be a number'
        }),
    schedule: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Schedule is required'
        }),
    maxEnrollment: Joi.number()
        .integer()
        .min(1)
        .max(COURSE_LIMITS.MAX_ENROLLMENT)
        .required()
        .messages({
            'number.min': 'Max enrollment must be at least 1',
            'number.max': `Max enrollment cannot exceed ${COURSE_LIMITS.MAX_ENROLLMENT}`,
            'number.base': 'Max enrollment must be a number'
        }),
    currentEnrollment: Joi.number()
        .integer()
        .min(0)
        .default(0),
    description: Joi.string()
        .trim()
        .min(10)
        .required()
        .messages({
            'string.min': 'Description must be at least 10 characters',
            'string.empty': 'Description is required'
        }),
    term: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Term is required'
        }),
    prerequisites: Joi.array()
        .items(Joi.string().trim())
        .optional()
});

export const updateCourseSchema = Joi.object({
    id: Joi.string().optional(), // Often params.id is used, but if body has it, validate it
    title: Joi.string()
        .trim()
        .min(5)
        .max(100)
        .optional(),
    specialization: Joi.string()
        .trim()
        .optional(),
    faculty: Joi.string()
        .trim()
        .optional(),
    credits: Joi.number()
        .integer()
        .min(1)
        .max(COURSE_LIMITS.MAX_CREDITS)
        .optional(),
    schedule: Joi.string()
        .trim()
        .optional(),
    maxEnrollment: Joi.number()
        .integer()
        .min(1)
        .max(COURSE_LIMITS.MAX_ENROLLMENT)
        .optional(),
    currentEnrollment: Joi.number()
        .integer()
        .min(0)
        .optional(),
    description: Joi.string()
        .trim()
        .min(10)
        .optional(),
    term: Joi.string()
        .trim()
        .optional(),
    prerequisites: Joi.array()
        .items(Joi.string().trim())
        .optional()
}).min(1); // Ensure at least one field is being updated

export const getCoursesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(COURSE_LIMITS.DEFAULT_PAGE_SIZE),
    search: Joi.string().trim().optional().allow(''),
    specialization: Joi.string().trim().optional().allow(''),
    faculty: Joi.string().trim().optional().allow(''),
    term: Joi.string().trim().optional().allow('')
});

export const getEnrollmentsQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(COURSE_LIMITS.DEFAULT_PAGE_SIZE),
    status: Joi.string().valid('Pending', 'Approved', 'Rejected').optional(),
    specialization: Joi.string().trim().optional(),
    term: Joi.string().trim().optional()
});

// No body schema typically needed for approve/reject if only ID is in params
// But if there's a body (e.g. reason for rejection), add it here.
