import Joi from 'joi';

export const StudentDashboardSchemas = {
    getUserInfo: Joi.object({
        params: Joi.object({
            studentId: Joi.string().required()
        })
    }),
    // Other dashboard endpoints typically don't have complex inputs beyond auth context
};
