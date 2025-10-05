"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.authenticate = exports.verifyToken = exports.generateRefreshToken = exports.generateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const generateToken = (userId, mobile) => {
    const payload = {
        userId,
        mobile,
    };
    const secret = (process.env.JWT_SECRET || '');
    const options = { expiresIn: (process.env.JWT_EXPIRE || '7d') };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateToken = generateToken;
const generateRefreshToken = (userId) => {
    const secret = (process.env.JWT_REFRESH_SECRET || '');
    const options = { expiresIn: (process.env.JWT_REFRESH_EXPIRE || '30d') };
    return jsonwebtoken_1.default.sign({ userId }, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyToken = (token) => {
    try {
        const secret = (process.env.JWT_SECRET || '');
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        throw new Error('Invalid token');
    }
};
exports.verifyToken = verifyToken;
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        console.log('Authorization header:', authHeader);
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('No valid authorization header found');
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const token = authHeader.substring(7);
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
        console.log('Attempting to verify token...');
        const decoded = (0, exports.verifyToken)(token);
        console.log('Token decoded successfully:', decoded);
        console.log('Looking for user with ID:', decoded.userId);
        const user = await User_1.User.findById(decoded.userId);
        console.log('User found:', user ? 'Yes' : 'No');
        if (!user) {
            console.log('User not found in database');
            res.status(401).json({
                success: false,
                message: 'Token is not valid. User not found.',
            });
            return;
        }
        req.user = user;
        console.log('Authentication successful for user:', user.name);
        next();
    }
    catch (error) {
        console.log('Authentication error:', error);
        res.status(401).json({
            success: false,
            message: 'Token is not valid.',
        });
    }
};
exports.authenticate = authenticate;
const optionalAuth = async (req, res, next) => {
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
        const decoded = (0, exports.verifyToken)(token);
        const user = await User_1.User.findById(decoded.userId);
        if (user) {
            req.user = user;
        }
        next();
    }
    catch (error) {
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map