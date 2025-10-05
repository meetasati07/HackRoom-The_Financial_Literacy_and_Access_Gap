"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transaction = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const transactionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    razorpayPaymentId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    razorpayOrderId: {
        type: String,
        required: true,
        index: true
    },
    razorpaySignature: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: [0, 'Amount cannot be negative']
    },
    currency: {
        type: String,
        required: true,
        default: 'INR',
        enum: ['INR']
    },
    status: {
        type: String,
        required: true,
        enum: ['pending', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true
    },
    description: {
        type: String,
        required: true,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    category: {
        type: String,
        required: true,
        enum: [
            'food', 'entertainment', 'travel', 'shopping', 'savings',
            'insurance', 'emergency', 'misc', 'bills', 'healthcare',
            'education', 'transport', 'utilities', 'subscriptions'
        ],
        index: true
    },
    merchant: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Merchant name cannot exceed 100 characters']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['upi', 'card', 'netbanking', 'wallet', 'emi'],
        index: true
    },
    metadata: {
        upiId: { type: String },
        bankName: { type: String },
        cardLast4: { type: String },
        cardType: { type: String },
        walletName: { type: String }
    }
}, {
    timestamps: true,
    toJSON: {
        transform: function (doc, ret) {
            delete ret.__v;
            return ret;
        }
    }
});
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });
transactionSchema.virtual('formattedAmount').get(function () {
    return `₹${this.amount.toLocaleString()}`;
});
transactionSchema.statics.getUserTransactions = async function (userId, page = 1, limit = 20, filters = {}) {
    const query = { userId: new mongoose_1.default.Types.ObjectId(userId) };
    if (filters.category)
        query.category = filters.category;
    if (filters.status)
        query.status = filters.status;
    if (filters.paymentMethod)
        query.paymentMethod = filters.paymentMethod;
    if (filters.startDate || filters.endDate) {
        query.createdAt = {};
        if (filters.startDate)
            query.createdAt.$gte = filters.startDate;
        if (filters.endDate)
            query.createdAt.$lte = filters.endDate;
    }
    const transactions = await this.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean();
    const total = await this.countDocuments(query);
    return {
        transactions,
        pagination: {
            current: page,
            pages: Math.ceil(total / limit),
            total,
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        }
    };
};
transactionSchema.statics.getSpendingAnalytics = async function (userId, period = 'month') {
    const now = new Date();
    let startDate;
    switch (period) {
        case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            break;
    }
    const analytics = await this.aggregate([
        {
            $match: {
                userId: new mongoose_1.default.Types.ObjectId(userId),
                status: 'completed',
                createdAt: { $gte: startDate, $lte: now }
            }
        },
        {
            $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
                transactionCount: { $sum: 1 },
                averageAmount: { $avg: '$amount' }
            }
        },
        {
            $sort: { totalAmount: -1 }
        }
    ]);
    const totalSpent = analytics.reduce((sum, item) => sum + item.totalAmount, 0);
    return {
        period,
        totalSpent,
        transactionCount: analytics.reduce((sum, item) => sum + item.transactionCount, 0),
        categoryBreakdown: analytics.map(item => ({
            category: item._id,
            amount: item.totalAmount,
            count: item.transactionCount,
            average: Math.round(item.averageAmount),
            percentage: totalSpent > 0 ? Math.round((item.totalAmount / totalSpent) * 100) : 0
        }))
    };
};
exports.Transaction = mongoose_1.default.model('Transaction', transactionSchema);
//# sourceMappingURL=Transaction.js.map