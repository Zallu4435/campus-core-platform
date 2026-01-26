import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HttpErrors } from '../../presentation/http/IHttp';

/**
 * Validation Middleware
 * Validates request data against a Joi schema
 * 
 * @param schema - Joi validation schema
 * @param source - 'body' | 'query' | 'params' (default: 'body')
 */
export const validate = (schema: Joi.ObjectSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return (req: Request, res: Response, next: NextFunction) => {
        const data = req[source];

        // Abort early if keys are missing from source (unless schema allows empty)
        const { error, value } = schema.validate(data, {
            abortEarly: false, // Return all errors
            stripUnknown: true, // Remove unknown fields
            errors: {
                wrap: {
                    label: ''
                }
            }
        });

        if (error) {
            const httpErrors = new HttpErrors();

            // Format errors into a readable string or object
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');

            // Return 400 Bad Request with validation details
            const response = httpErrors.error_400(errorMessage);
            res.status(response.statusCode).json(response);
            return;
        }

        // Replace request data with validated (and stripped) data
        updateRequestData(req, source, value);
        next();
    };
};

/**
 * Helper to safely update request data (since some properties like query/params might be getters)
 */
const updateRequestData = (req: Request, source: 'body' | 'query' | 'params', value: any) => {
    try {
        req[source] = value;
    } catch (error: any) {
        // If the property is read-only (getter-only), mutate the existing object
        if (source !== 'body' && req[source] && typeof req[source] === 'object') {
            const target = req[source] as any;
            // Clear existing keys
            Object.keys(target).forEach(key => delete target[key]);
            // Assign new values
            Object.assign(target, value);
        } else {
            throw error;
        }
    }
};


/**
 * Validate Request - Multi-source validation
 * Validates body, params, and query simultaneously
 * 
 * @param schema - Joi schema with body, params, and/or query properties
 */
export const validateRequest = (schema: Joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const dataToValidate: Record<string, unknown> = {};

        // Extract schema keys to know what to validate
        const schemaDescription = schema.describe();
        const keys = schemaDescription.keys as Record<string, Joi.Description> | undefined;

        if (keys?.body) {
            dataToValidate.body = req.body;
        }
        if (keys?.params) {
            dataToValidate.params = req.params;
        }
        if (keys?.query) {
            dataToValidate.query = req.query;
        }

        const { error, value } = schema.validate(dataToValidate, {
            abortEarly: false,
            stripUnknown: true,
            errors: {
                wrap: {
                    label: ''
                }
            }
        });

        if (error) {
            const httpErrors = new HttpErrors();
            const errorMessage = error.details
                .map((detail) => detail.message)
                .join(', ');

            const response = httpErrors.error_400(errorMessage);
            res.status(response.statusCode).json(response);
            return;
        }

        // Update request with validated values
        if (value.body) updateRequestData(req, 'body', value.body);
        if (value.params) updateRequestData(req, 'params', value.params);
        if (value.query) updateRequestData(req, 'query', value.query);

        next();
    };
};
