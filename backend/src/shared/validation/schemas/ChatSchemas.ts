import Joi from 'joi';

export const getChatsSchema = Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
});

export const searchChatsSchema = Joi.object({
    query: Joi.string().allow(''),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1)
});

export const getChatMessagesSchema = Joi.object({
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1),
    before: Joi.string().isoDate()
});

export const sendMessageSchema = Joi.object({
    text: Joi.string().allow('').optional(),
    content: Joi.string().allow('').optional(),
    // attachments handling relies on multer/files usually, body might have type if needed
}).or('text', 'content'); // At least one should be present if logic requires, but controller handles files too.

export const createChatSchema = Joi.object({
    participantId: Joi.string().required(),
    type: Joi.string().valid('direct', 'group').default('direct'),
    name: Joi.string().optional(),
    avatar: Joi.string().optional()
});

export const createGroupChatSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    participants: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string() // for JSON stringified array
    ).required(),
    settings: Joi.alternatives().try(
        Joi.object(),
        Joi.string()
    ).optional()
});

// ... Add more schemas as needed for other endpoints
