"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const Transaction_1 = require("../models/Transaction");
const razorpay_1 = require("../config/razorpay");
const express_validator_1 = require("express-validator");
const crypto_1 = __importDefault(require("crypto"));
const router = (0, express_1.Router)();
router.get('/test', auth_1.authenticate, async (req, res) => {
    try {
        return res.json({
            success: true,
            message: 'Transaction endpoint is working',
            timestamp: new Date().toISOString(),
            user: req.user?.id
        });
    }
    catch (error) {
        console.error('Test endpoint error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/test-razorpay', auth_1.authenticate, async (req, res) => {
    try {
        const startTime = Date.now();
        const testOrder = await (0, razorpay_1.createRazorpayOrder)(1, 'INR', 'test_connection');
        const endTime = Date.now();
        return res.json({
            success: testOrder.success,
            message: testOrder.success ? 'Razorpay connection working' : 'Razorpay connection failed',
            responseTime: `${endTime - startTime}ms`,
            error: testOrder.error || null
        });
    }
    catch (error) {
        console.error('Razorpay test error:', error);
        return res.status(500).json({
            success: false,
            message: 'Razorpay test failed',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
});
router.post('/create-order', auth_1.authenticate, [
    (0, express_validator_1.body)('amount').isNumeric().withMessage('Amount must be a number'),
    (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
    (0, express_validator_1.body)('category').isIn([
        'food', 'entertainment', 'travel', 'shopping', 'savings',
        'insurance', 'emergency', 'misc', 'bills', 'healthcare',
        'education', 'transport', 'utilities', 'subscriptions'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.body)('merchant').isString().isLength({ min: 1, max: 100 }).withMessage('Merchant name is required'),
    (0, express_validator_1.body)('paymentMethod').isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object')
], validation_1.validate, async (req, res) => {
    try {
        const { amount, description, category, merchant, paymentMethod, metadata } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const receipt = `txn_${Date.now()}_${userId}`;
        const orderResult = await (0, razorpay_1.createRazorpayOrder)(amount, 'INR', receipt, {
            userId,
            description,
            category,
            merchant,
            paymentMethod
        });
        if (!orderResult.success || !orderResult.order) {
            return res.status(400).json({
                success: false,
                message: 'Failed to create payment order',
                error: orderResult.error
            });
        }
        return res.json({
            success: true,
            data: {
                orderId: orderResult.order?.id,
                amount: orderResult.order?.amount,
                currency: orderResult.order?.currency,
                receipt: orderResult.order?.receipt,
                key: process.env.RAZORPAY_KEY_ID
            }
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/verify-payment', auth_1.authenticate, [
    (0, express_validator_1.body)('razorpayOrderId').isString().withMessage('Order ID is required'),
    (0, express_validator_1.body)('razorpayPaymentId').isString().withMessage('Payment ID is required'),
    (0, express_validator_1.body)('razorpaySignature').isString().withMessage('Signature is required'),
    (0, express_validator_1.body)('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
    (0, express_validator_1.body)('category').isIn([
        'food', 'entertainment', 'travel', 'shopping', 'savings',
        'insurance', 'emergency', 'misc', 'bills', 'healthcare',
        'education', 'transport', 'utilities', 'subscriptions'
    ]).withMessage('Invalid category'),
    (0, express_validator_1.body)('merchant').isString().isLength({ min: 1, max: 100 }).withMessage('Merchant name is required'),
    (0, express_validator_1.body)('paymentMethod').isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method'),
    (0, express_validator_1.body)('metadata').optional().isObject().withMessage('Metadata must be an object')
], validation_1.validate, async (req, res) => {
    try {
        const { razorpayOrderId, razorpayPaymentId, razorpaySignature, description, category, merchant, paymentMethod, metadata = {} } = req.body;
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const isValidSignature = (0, razorpay_1.verifyRazorpaySignature)(razorpayOrderId, razorpayPaymentId, razorpaySignature);
        if (!isValidSignature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment signature'
            });
        }
        const paymentResult = await (0, razorpay_1.getPaymentDetails)(razorpayPaymentId);
        if (!paymentResult.success || !paymentResult.payment) {
            return res.status(400).json({
                success: false,
                message: 'Failed to fetch payment details',
                error: paymentResult.error
            });
        }
        const payment = paymentResult.payment;
        const amount = Number(payment.amount) / 100;
        const existingTransaction = await Transaction_1.Transaction.findOne({ razorpayPaymentId });
        if (existingTransaction) {
            return res.status(400).json({
                success: false,
                message: 'Transaction already exists'
            });
        }
        const transaction = new Transaction_1.Transaction({
            userId,
            razorpayPaymentId,
            razorpayOrderId,
            razorpaySignature,
            amount,
            currency: payment.currency,
            status: payment.status === 'captured' ? 'completed' : 'pending',
            description,
            category,
            merchant,
            paymentMethod,
            metadata: {
                upiId: payment.method === 'upi' ? payment.vpa : undefined,
                bankName: payment.bank,
                cardLast4: payment.card?.last4,
                cardType: payment.card?.type,
                walletName: payment.wallet,
                ...metadata
            }
        });
        await transaction.save();
        if (transaction.status === 'completed') {
        }
        return res.json({
            success: true,
            data: {
                transaction: transaction,
                message: 'Payment verified and transaction recorded successfully'
            }
        });
    }
    catch (error) {
        console.error('Verify payment error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/', auth_1.authenticate, [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    (0, express_validator_1.query)('category').optional().isIn([
        'food', 'entertainment', 'travel', 'shopping', 'savings',
        'insurance', 'emergency', 'misc', 'bills', 'healthcare',
        'education', 'transport', 'utilities', 'subscriptions'
    ]).withMessage('Invalid category filter'),
    (0, express_validator_1.query)('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status filter'),
    (0, express_validator_1.query)('paymentMethod').optional().isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method filter'),
    (0, express_validator_1.query)('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
    (0, express_validator_1.query)('endDate').optional().isISO8601().withMessage('End date must be valid ISO date')
], validation_1.validate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const filters = {};
        if (req.query.category)
            filters.category = req.query.category;
        if (req.query.status)
            filters.status = req.query.status;
        if (req.query.paymentMethod)
            filters.paymentMethod = req.query.paymentMethod;
        if (req.query.startDate)
            filters.startDate = new Date(req.query.startDate);
        if (req.query.endDate)
            filters.endDate = new Date(req.query.endDate);
        const query = { userId };
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
        const total = await Transaction_1.Transaction.countDocuments(query);
        const transactions = await Transaction_1.Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);
        res.json({
            success: true,
            data: {
                transactions,
                page,
                limit,
                total
            }
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/analytics', auth_1.authenticate, [
    (0, express_validator_1.query)('period').optional().isIn(['week', 'month', 'year']).withMessage('Period must be week, month, or year')
], validation_1.validate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const period = req.query.period || 'month';
        const analytics = await Transaction_1.Transaction.getSpendingAnalytics(userId, period);
        res.json({
            success: true,
            data: analytics
        });
    }
    catch (error) {
        console.error('Get analytics error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.get('/:id', auth_1.authenticate, [
    (0, express_validator_1.param)('id').isMongoId().withMessage('Invalid transaction ID')
], validation_1.validate, async (req, res) => {
    try {
        const userId = req.user?.id;
        const transactionId = req.params.id;
        const transaction = await Transaction_1.Transaction.findOne({
            _id: transactionId,
            userId
        });
        if (!transaction) {
            return res.status(404).json({
                success: false,
                message: 'Transaction not found'
            });
        }
        return res.json({
            success: true,
            data: transaction
        });
    }
    catch (error) {
        console.error('Get transaction error:', error);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
});
router.post('/webhook', async (req, res) => {
    try {
        const signature = req.headers['x-razorpay-signature'];
        const body = JSON.stringify(req.body);
        const expectedSignature = crypto_1.default
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
            .update(body)
            .digest('hex');
        if (signature !== expectedSignature) {
            return res.status(400).json({ success: false, message: 'Invalid signature' });
        }
        const event = req.body;
        if (event.event === 'payment.captured') {
            const paymentId = event.payload.payment.entity.id;
            await Transaction_1.Transaction.findOneAndUpdate({ razorpayPaymentId: paymentId }, { status: 'completed' });
        }
        else if (event.event === 'payment.failed') {
            const paymentId = event.payload.payment.entity.id;
            await Transaction_1.Transaction.findOneAndUpdate({ razorpayPaymentId: paymentId }, { status: 'failed' });
        }
        return res.json({ success: true, message: 'Webhook processed' });
    }
    catch (error) {
        console.error('Webhook error:', error);
        return res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map