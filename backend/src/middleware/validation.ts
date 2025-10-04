import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

// Validation middleware factory
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Debug: Log the request body
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

// Registration validation schema
export const registerSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required',
    }),
  mobile: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required()
    .messages({
      'string.pattern.base': 'Please enter a valid 10-digit mobile number',
      'any.required': 'Mobile number is required',
    }),
  email: Joi.string()
    .email()
    .required()
    .messages({
      'string.email': 'Please enter a valid email address',
      'any.required': 'Email is required',
    }),
  password: Joi.string()
    .min(6)
    .required()
    .messages({
      'string.min': 'Password must be at least 6 characters',
      'any.required': 'Password is required',
    }),
});

// Login validation schema
export const loginSchema = Joi.object({
  identifier: Joi.string()
    .required()
    .messages({
      'any.required': 'Mobile number or email is required',
    }),
  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

// Update user validation schema
export const updateUserSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .optional(),
  email: Joi.string()
    .email()
    .optional(),
  coins: Joi.number()
    .min(0)
    .optional(),
  level: Joi.string()
    .valid('Beginner', 'Intermediate', 'Advanced', 'Expert')
    .optional(),
  completedQuiz: Joi.boolean()
    .optional(),
});
