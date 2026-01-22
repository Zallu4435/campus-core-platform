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
        req[source] = value;
        next();
    };
};
