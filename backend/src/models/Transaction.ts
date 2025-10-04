import mongoose, { Document, Schema } from 'mongoose';

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  category: string;
  merchant?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITransactionModel extends mongoose.Model<ITransaction> {
  getUserTransactions(
    userId: string,
    page?: number,
    limit?: number,
    filters?: {
      category?: string;
      paymentMethod?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{
    transactions: ITransaction[];
    pagination: {
      current: number;
      pages: number;
      total: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }>;
  getSpendingAnalytics(
    userId: string,
    period?: 'week' | 'month' | 'year'
  ): Promise<{
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

const transactionSchema = new Schema<ITransaction>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true,
    min: [0, 'Amount cannot be negative']
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
    trim: true,
    maxlength: [100, 'Merchant name cannot exceed 100 characters']
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'card', 'netbanking', 'wallet', 'other'],
    index: true
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, 'Notes cannot exceed 200 characters']
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete (ret as any).__v;
      return ret;
    }
  }
});

// Indexes for better query performance
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ createdAt: -1 });

// Virtual for formatted amount
transactionSchema.virtual('formattedAmount').get(function() {
  return `₹${this.amount.toLocaleString()}`;
});

// Static method to get user transactions
transactionSchema.statics.getUserTransactions = async function(
  userId: string, 
  page: number = 1, 
  limit: number = 20,
  filters: {
    category?: string;
    paymentMethod?: string;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const query: any = { userId: new mongoose.Types.ObjectId(userId) };
  
  if (filters.category) query.category = filters.category;
  if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) query.createdAt.$gte = filters.startDate;
    if (filters.endDate) query.createdAt.$lte = filters.endDate;
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

// Static method to get spending analytics
transactionSchema.statics.getSpendingAnalytics = async function(userId: string, period: 'week' | 'month' | 'year' = 'month') {
  const now = new Date();
  let startDate: Date;

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
        userId: new mongoose.Types.ObjectId(userId),
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

export const Transaction = mongoose.model<ITransaction, ITransactionModel>('Transaction', transactionSchema);
