import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
declare global {
    namespace Express {
        interface Request {
            user?: IUser;
        }
    }
}
export interface JWTPayload {
    userId: string;
    mobile: string;
    iat?: number;
    exp?: number;
}
export declare const generateToken: (userId: string, mobile: string) => string;
export declare const generateRefreshToken: (userId: string) => string;
export declare const verifyToken: (token: string) => JWTPayload;
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map