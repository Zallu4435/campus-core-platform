import Joi from 'joi';

/**
 * Financial Validation Schemas
 * Validation rules for all financial endpoints
 */

// Student Routes
export const makePaymentSchema = Joi.object({
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'Amount must be greater than 0',
            'any.required': 'Amount is required'
        }),
    method: Joi.string()
        .valid('Credit Card', 'Bank Transfer', 'Financial Aid', 'Razorpay', 'stripe')
        .required()
        .messages({
            'any.only': 'Invalid payment method',
            'any.required': 'Payment method is required'
        }),
    term: Joi.string()
        .required()
        .messages({
            'any.required': 'Term is required'
        }),
    chargeId: Joi.string()
        .required()
        .messages({
            'any.required': 'Charge ID is required'
        }),
    razorpayPaymentId: Joi.string().optional(),
    razorpayOrderId: Joi.string().optional(),
    razorpaySignature: Joi.string().optional()
});

export const uploadDocumentSchema = Joi.object({
    type: Joi.string()
        .optional()
        .messages({
            'string.base': 'Type must be a string'
        })
});

export const getPaymentReceiptSchema = Joi.object({
    paymentId: Joi.string()
        .required()
        .messages({
            'any.required': 'Payment ID is required'
        })
});

// Admin Routes
export const getAllPaymentsSchema = Joi.object({
    startDate: Joi.string().optional(),
    endDate: Joi.string().optional(),
    status: Joi.string()
        .valid('Completed', 'Pending', 'Failed')
        .optional(),
    studentId: Joi.string().optional(),
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional()
});

export const getOnePaymentSchema = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'any.required': 'Payment ID is required'
        })
});

export const getAllChargesSchema = Joi.object({
    term: Joi.string().optional(),
    status: Joi.string().optional(),
    search: Joi.string().optional(),
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .optional(),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .optional()
});

export const createChargeSchema = Joi.object({
    title: Joi.string()
        .required()
        .messages({
            'any.required': 'Title is required'
        }),
    description: Joi.string()
        .required()
        .messages({
            'any.required': 'Description is required'
        }),
    amount: Joi.number()
        .positive()
        .required()
        .messages({
            'number.positive': 'Amount must be greater than 0',
            'any.required': 'Amount is required'
        }),
    term: Joi.string()
        .required()
        .messages({
            'any.required': 'Term is required'
        }),
    dueDate: Joi.date()
        .required()
        .messages({
            'any.required': 'Due date is required'
        }),
    applicableFor: Joi.string()
        .required()
        .messages({
            'any.required': 'Applicable for is required'
        })
});

export const updateChargeSchema = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'any.required': 'Charge ID is required'
        })
});

export const updateChargeBodySchema = Joi.object({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    amount: Joi.number()
        .positive()
        .optional()
        .messages({
            'number.positive': 'Amount must be greater than 0'
        }),
    term: Joi.string().optional(),
    dueDate: Joi.date().optional(),
    applicableFor: Joi.string().optional()
});

export const deleteChargeSchema = Joi.object({
    id: Joi.string()
        .required()
        .messages({
            'any.required': 'Charge ID is required'
        })
});
