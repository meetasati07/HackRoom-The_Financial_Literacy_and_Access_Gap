"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const user_1 = __importDefault(require("./routes/user"));
const financial_1 = __importDefault(require("./routes/financial"));
const transactions_1 = __importDefault(require("./routes/transactions"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: {
        error: 'Too many requests from this IP, please try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: ['http://localhost:3001', 'http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
app.use((0, cookie_parser_1.default)());
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'HackWave API is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
    });
});
app.use('/api/auth', auth_1.default);
app.use('/api/users', user_1.default);
app.use('/api/financial', financial_1.default);
app.use('/api/transactions', transactions_1.default);
app.use(errorHandler_1.notFound);
app.use(errorHandler_1.errorHandler);
const startServer = async () => {
    try {
        await (0, database_1.connectDB)();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔗 Health check: http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err.message);
    process.exit(1);
});
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err.message);
    process.exit(1);
});
startServer();
exports.default = app;
//# sourceMappingURL=server.js.map