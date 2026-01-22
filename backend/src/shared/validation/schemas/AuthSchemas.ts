import Joi from 'joi';

/**
 * Auth Validation Schemas
 * Definitive validation rules for all authentication endpoints
 * Mirrors the DTO structures in src/application/auth/dtos/AuthRequestDTOs.ts
 */

export const registerSchema = Joi.object({
    firstName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'First name is required',
            'string.min': 'First name must be at least 2 characters',
            'string.max': 'First name cannot exceed 50 characters'
        }),
    lastName: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name must be at least 2 characters',
            'string.max': 'Last name cannot exceed 50 characters'
        }),
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .min(8)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
            'string.empty': 'Password is required'
        })
});

export const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'string.empty': 'Email is required'
        }),
    password: Joi.string()
        .required()
        .messages({
            'string.empty': 'Password is required'
        })
});

export const refreshTokenSchema = Joi.object({
    userId: Joi.string()
        .required()
        .messages({
            'string.empty': 'User ID is required'
        })
});

export const registerFacultySchema = Joi.object({
    fullName: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required(),
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim(),
    phone: Joi.string()
        .pattern(/^\+?[0-9\- ]{7,15}$/)
        .required()
        .messages({
            'string.pattern.base': 'Please provide a valid phone number'
        }),
    department: Joi.string()
        .trim()
        .required(),
    qualification: Joi.string()
        .trim()
        .required(),
    experience: Joi.string()
        .trim()
        .required(),
    aboutMe: Joi.string()
        .trim()
        .required()
        .min(20)
        .messages({
            'string.min': 'About me must be at least 20 characters'
        })
});

export const sendEmailOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
});

export const verifyEmailOtpSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim(),
    otp: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
            'string.length': 'OTP must be exactly 6 digits',
            'string.pattern.base': 'OTP must contain only numbers'
        })
});

export const resetPasswordSchema = Joi.object({
    resetToken: Joi.string()
        .required(),
    newPassword: Joi.string()
        .min(8)
        .required()
        .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)'))
        .messages({
            'string.min': 'Password must be at least 8 characters long',
            'string.pattern.base': 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
        }),
    email: Joi.string()
        .email()
        .optional()
        .lowercase()
        .trim()
});
