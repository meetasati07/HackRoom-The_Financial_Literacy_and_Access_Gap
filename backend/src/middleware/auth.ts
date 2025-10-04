import jwt, { type Secret, type SignOptions } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { User, IUser } from '../models/User';

// Extend Request interface to include user
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

// Generate JWT token
export const generateToken = (userId: string, mobile: string): string => {
  const payload: JWTPayload = {
    userId,
    mobile,
  };
  
  const secret = (process.env.JWT_SECRET || '') as Secret;
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '7d') as unknown as SignOptions['expiresIn'] };
  return jwt.sign(payload, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (userId: string): string => {
  const secret = (process.env.JWT_REFRESH_SECRET || '') as Secret;
  const options: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') as unknown as SignOptions['expiresIn'] };
  return jwt.sign({ userId }, secret, options);
};

// Verify JWT token
export const verifyToken = (token: string): JWTPayload => {
  try {
    const secret = (process.env.JWT_SECRET || '') as Secret;
    return jwt.verify(token, secret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    // Debug: Log authorization header
    console.log('Authorization header:', authHeader);
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('No valid authorization header found');
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Debug: Log token
    console.log('Extracted token:', token);
    console.log('Token length:', token.length);
    
    if (!token) {
      console.log('Empty token after Bearer prefix removal');
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }
    
    // Verify token
    console.log('Attempting to verify token...');
    const decoded = verifyToken(token);
    console.log('Token decoded successfully:', decoded);
    
    // Find user by ID
    console.log('Looking for user with ID:', decoded.userId);
    const user = await User.findById(decoded.userId);
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('User not found in database');
      res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.',
      });
      return;
    }
    
    // Add user to request object
    req.user = user;
    console.log('Authentication successful for user:', user.name);
    next();
  } catch (error) {
    console.log('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Token is not valid.',
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      next();
      return;
    }
    
    const token = authHeader.substring(7);
    
    if (!token) {
      next();
      return;
    }
    
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId);
    
    if (user) {
      req.user = user;
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
