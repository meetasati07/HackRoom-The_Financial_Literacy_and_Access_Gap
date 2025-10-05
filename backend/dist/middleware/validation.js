"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.loginSchema = exports.registerSchema = exports.validate = void 0;
const joi_1 = __importDefault(require("joi"));
const validate = (schema) => {
    return (req, res, next) => {
        console.log('Request body:', req.body);
        console.log('Request body type:', typeof req.body);
        console.log('Request body keys:', Object.keys(req.body || {}));
        const { error } = schema.validate(req.body);
        if (error) {
            const errorMessage = error.details.map(detail => detail.message).join(', ');
            console.log('Validation error:', errorMessage);
            res.status(400).json({
                success: false,
                message: 'Validation Error',
                errors: errorMessage,
            });
            return;
        }
        next();
    };
};
exports.validate = validate;
exports.registerSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .required()
        .messages({
        'string.min': 'Name must be at least 2 characters',
        'string.max': 'Name cannot exceed 50 characters',
        'any.required': 'Name is required',
    }),
    mobile: joi_1.default.string()
        .pattern(/^[0-9]{10}$/)
        .required()
        .messages({
        'string.pattern.base': 'Please enter a valid 10-digit mobile number',
        'any.required': 'Mobile number is required',
    }),
    email: joi_1.default.string()
        .email()
        .required()
        .messages({
        'string.email': 'Please enter a valid email address',
        'any.required': 'Email is required',
    }),
    password: joi_1.default.string()
        .min(6)
        .required()
        .messages({
        'string.min': 'Password must be at least 6 characters',
        'any.required': 'Password is required',
    }),
});
exports.loginSchema = joi_1.default.object({
    identifier: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Mobile number or email is required',
    }),
    password: joi_1.default.string()
        .required()
        .messages({
        'any.required': 'Password is required',
    }),
});
exports.updateUserSchema = joi_1.default.object({
    name: joi_1.default.string()
        .min(2)
        .max(50)
        .optional(),
    email: joi_1.default.string()
        .email()
        .optional(),
    coins: joi_1.default.number()
        .min(0)
        .optional(),
    level: joi_1.default.string()
        .valid('Beginner', 'Intermediate', 'Advanced', 'Expert')
        .optional(),
    completedQuiz: joi_1.default.boolean()
        .optional(),
});
//# sourceMappingURL=validation.js.map