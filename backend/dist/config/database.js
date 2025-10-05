"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackwave';
        const conn = await mongoose_1.default.connect(mongoURI);
        console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
        console.log(`🗄️ Database: ${conn.connection.name}`);
        mongoose_1.default.connection.on('error', (err) => {
            console.error('❌ MongoDB connection error:', err);
        });
        mongoose_1.default.connection.on('disconnected', () => {
            console.warn('⚠️ MongoDB disconnected');
        });
        mongoose_1.default.connection.on('reconnected', () => {
            console.log('✅ MongoDB reconnected');
        });
    }
    catch (error) {
        console.error('❌ Database connection failed:', error);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
//# sourceMappingURL=database.js.map