import Joi from 'joi';

export const updateProfileSchema = Joi.object({
    firstName: Joi.string().min(2).max(50).optional(),
    lastName: Joi.string().min(2).max(50).optional(),
    email: Joi.string().email().optional(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional()
});

export const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).required(),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
        .messages({ 'any.only': 'Passwords must match' })
});

export const updateProfilePictureSchema = Joi.object({
    // profilePicture is handled by Multer
});
