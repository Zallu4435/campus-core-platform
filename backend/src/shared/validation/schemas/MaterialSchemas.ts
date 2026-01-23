import Joi from 'joi';
import { MaterialType, MaterialDifficulty } from '../../../domain/materials/entities/MaterialTypes';

/**
 * Material Validation Schemas
 * Definitive validation rules for all material endpoints
 */

export const createMaterialSchema = Joi.object({
    body: Joi.object({
        title: Joi.string().trim().min(3).max(200).required(),
        description: Joi.string().trim().min(10).max(2000).required(),
        subject: Joi.string().trim().required(),
        course: Joi.string().trim().required(),
        semester: Joi.number().integer().min(1).max(12).required(),
        type: Joi.string().valid(...Object.values(MaterialType)).required(),
        difficulty: Joi.string().valid(...Object.values(MaterialDifficulty)).required(),
        estimatedTime: Joi.string().trim().required(),
        isNewMaterial: Joi.boolean().default(true),
        isRestricted: Joi.boolean().default(false),
        uploadedBy: Joi.string().optional(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        ).optional()
    })
});

export const updateMaterialSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().length(24).hex().required()
    }),
    body: Joi.object({
        title: Joi.string().trim().min(3).max(200),
        description: Joi.string().trim().min(10).max(2000),
        subject: Joi.string().trim(),
        course: Joi.string().trim(),
        semester: Joi.number().integer().min(1).max(12),
        type: Joi.string().valid(...Object.values(MaterialType)),
        difficulty: Joi.string().valid(...Object.values(MaterialDifficulty)),
        estimatedTime: Joi.string().trim(),
        isNewMaterial: Joi.boolean(),
        isRestricted: Joi.boolean(),
        tags: Joi.alternatives().try(
            Joi.array().items(Joi.string().trim()),
            Joi.string().trim()
        )
    })
});

export const getMaterialsQuerySchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        subject: Joi.string().trim().optional(),
        course: Joi.string().trim().optional(),
        semester: Joi.number().integer().optional(),
        search: Joi.string().trim().allow('').optional(),
        status: Joi.string().valid('all', 'restricted', 'unrestricted').optional(),
        dateRange: Joi.string().valid('all', 'last_week', 'last_month', 'last_3_months', 'custom').optional(),
        startDate: Joi.date().iso().optional(),
        endDate: Joi.date().iso().min(Joi.ref('startDate')).optional()
    })
});

export const materialIdParamSchema = Joi.object({
    params: Joi.object({
        id: Joi.string().length(24).hex().required()
    })
});

export const getUserMaterialsQuerySchema = Joi.object({
    query: Joi.object({
        page: Joi.number().integer().min(1).optional(),
        limit: Joi.number().integer().min(1).max(100).optional(),
        subject: Joi.string().trim().optional(),
        course: Joi.string().trim().optional(),
        semester: Joi.number().integer().optional(),
        type: Joi.string().trim().optional(),
        difficulty: Joi.string().trim().optional(),
        search: Joi.string().trim().allow('').optional(),
        sortBy: Joi.string().trim().optional(),
        sortOrder: Joi.string().valid('asc', 'desc').optional()
    })
});
