import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
export declare const validate: (schema: Joi.ObjectSchema) => (req: Request, res: Response, next: NextFunction) => void;
export declare const registerSchema: Joi.ObjectSchema<any>;
export declare const loginSchema: Joi.ObjectSchema<any>;
export declare const updateUserSchema: Joi.ObjectSchema<any>;
//# sourceMappingURL=validation.d.ts.map