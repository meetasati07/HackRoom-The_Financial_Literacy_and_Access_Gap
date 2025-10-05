import mongoose, { Document } from 'mongoose';
export interface ITransaction extends Document {
    _id: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    razorpayPaymentId: string;
    razorpayOrderId: string;
    razorpaySignature: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    description: string;
    category: string;
    merchant: string;
    paymentMethod: string;
    metadata: {
        upiId?: string;
        bankName?: string;
        cardLast4?: string;
        cardType?: string;
        walletName?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}
export interface ITransactionModel extends mongoose.Model<ITransaction> {
    getUserTransactions(userId: string, page?: number, limit?: number, filters?: {
        category?: string;
        status?: string;
        paymentMethod?: string;
        startDate?: Date;
        endDate?: Date;
    }): Promise<{
        transactions: ITransaction[];
        pagination: {
            current: number;
            pages: number;
            total: number;
            hasNext: boolean;
            hasPrev: boolean;
        };
    }>;
    getSpendingAnalytics(userId: string, period?: 'week' | 'month' | 'year'): Promise<{
        period: string;
        totalSpent: number;
        transactionCount: number;
        categoryBreakdown: Array<{
            category: string;
            amount: number;
            count: number;
            average: number;
            percentage: number;
        }>;
    }>;
}
export declare const Transaction: ITransactionModel;
//# sourceMappingURL=Transaction.d.ts.map