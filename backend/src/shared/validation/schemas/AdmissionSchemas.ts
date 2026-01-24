import Joi from 'joi';

export const createApplicationSchema = Joi.object({
    userId: Joi.string().required(),
});

export const saveSectionSchema = Joi.object({
    // applicationId and section are in params usually, but if in body depends on route
    // Assuming body content 'data' is passed
});

// Since SaveSection data is dynamic depending on section, we might validate only that 'data' exists 
// or validate section names if they are in body. 
// However, the Controller takes section from params.
// So we mainly validate that body has data.

export const processPaymentSchema = Joi.object({
    applicationId: Joi.string().required(),
    paymentDetails: Joi.object({
        method: Joi.string().required(),
        amount: Joi.number().required(),
        currency: Joi.string().required(),
        paymentMethodId: Joi.string().optional(),
        returnUrl: Joi.string().optional()
    }).required()
});

export const confirmPaymentSchema = Joi.object({
    paymentId: Joi.string().required(),
    stripePaymentIntentId: Joi.string().required()
});

export const finalizeAdmissionSchema = Joi.object({
    applicationId: Joi.string().required(),
    paymentId: Joi.string().required()
});

export const uploadDocumentSchema = Joi.object({
    applicationId: Joi.string().required(),
    documentType: Joi.string().required(),
});

export const uploadMultipleDocumentsSchema = Joi.object({
    applicationId: Joi.string().required(),
});
