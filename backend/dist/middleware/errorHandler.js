"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = exports.CustomError = void 0;
class CustomError extends Error {
    constructor(message, statusCode = 500) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.CustomError = CustomError;
const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;
    console.error('❌ Error:', err);
    if (err.name === 'CastError') {
        const message = 'Resource not found';
        error = new CustomError(message, 404);
    }
    if (err.name === 'MongoError' && err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new CustomError(message, 400);
    }
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map((val) => val.message).join(', ');
        error = new CustomError(message, 400);
    }
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token';
        error = new CustomError(message, 401);
    }
    if (err.name === 'TokenExpiredError') {
        const message = 'Token expired';
        error = new CustomError(message, 401);
    }
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new CustomError(`Not found - ${req.originalUrl}`, 404);
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map