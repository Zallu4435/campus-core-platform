import Joi from 'joi';
import { SITE_MANAGEMENT_CONSTANTS } from '../../../application/site-management/constants/SiteManagementConstants';

/**
 * Site Management Validation Schemas
 */
export const SiteManagementSchemas = {
    getSectionsSchema: Joi.object({
        query: Joi.object({
            sectionKey: Joi.string()
                .valid(...Object.values(SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS))
                .optional(),
            page: Joi.number()
                .integer()
                .min(1)
                .default(SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.PAGE),
            limit: Joi.number()
                .integer()
                .min(1)
                .max(SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.MAX_LIMIT)
                .default(SITE_MANAGEMENT_CONSTANTS.DEFAULT_QUERY_PARAMS.LIMIT),
            search: Joi.string().allow('').optional(),
            category: Joi.string().allow('').optional(),
            status: Joi.string().allow('').optional(),
            dateRange: Joi.string().allow('').optional(),
            startDate: Joi.date().iso().optional(),
            endDate: Joi.date().iso().optional(),
        })
    }),

    createSectionSchema: Joi.object({
        body: Joi.object({
            sectionKey: Joi.string()
                .valid(...Object.values(SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS))
                .required(),
            title: Joi.string().required().trim(),
            description: Joi.string().required().trim(),
            content: Joi.string().optional(),
            link: Joi.string().allow('').optional(),
            category: Joi.string().allow('').optional(),
            position: Joi.string().optional(),
        })
    }),

    updateSectionSchema: Joi.object({
        params: Joi.object({
            id: Joi.string().required()
        }),
        body: Joi.object({
            sectionKey: Joi.string()
                .valid(...Object.values(SITE_MANAGEMENT_CONSTANTS.SECTION_KEYS))
                .optional(),
            title: Joi.string().optional().trim(),
            description: Joi.string().optional().trim(),
            content: Joi.string().optional(),
            link: Joi.string().allow('').optional(),
            category: Joi.string().allow('').optional(),
            position: Joi.string().optional(),
            image: Joi.string().optional(),
        })
    })
};
