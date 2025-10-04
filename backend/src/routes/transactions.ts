import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { Transaction } from '../models/Transaction';
import { createRazorpayOrder, verifyRazorpaySignature, getPaymentDetails } from '../config/razorpay';
import { body, query, param } from 'express-validator';
import crypto from 'crypto';

const router = Router();

// @route   GET /api/transactions/test
// @desc    Test endpoint to check server response time
// @access  Private
router.get('/test', authenticate, async (req: Request, res: Response) => {
  try {
    return res.json({
      success: true,
      message: 'Transaction endpoint is working',
      timestamp: new Date().toISOString(),
      user: req.user?.id
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/transactions/test-razorpay
// @desc    Test Razorpay connection
// @access  Private
router.get('/test-razorpay', authenticate, async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Test Razorpay connection with minimal order
    const testOrder = await createRazorpayOrder(1, 'INR', 'test_connection');
    const endTime = Date.now();
    
    return res.json({
      success: testOrder.success,
      message: testOrder.success ? 'Razorpay connection working' : 'Razorpay connection failed',
      responseTime: `${endTime - startTime}ms`,
      error: testOrder.error || null
    });
  } catch (error) {
    console.error('Razorpay test error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Razorpay test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// @route   POST /api/transactions/create-order
// @desc    Create a Razorpay order for payment
// @access  Private
router.post('/create-order', authenticate, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('category').isIn([
    'food', 'entertainment', 'travel', 'shopping', 'savings', 
    'insurance', 'emergency', 'misc', 'bills', 'healthcare',
    'education', 'transport', 'utilities', 'subscriptions'
  ]).withMessage('Invalid category'),
  body('merchant').isString().isLength({ min: 1, max: 100 }).withMessage('Merchant name is required'),
  body('paymentMethod').isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], validate, async (req: Request, res: Response) => {
  try {
    const { amount, description, category, merchant, paymentMethod, metadata } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Create Razorpay order
    const receipt = `txn_${Date.now()}_${userId}`;
    const orderResult = await createRazorpayOrder(
      amount,
      'INR',
      receipt,
      {
        userId,
        description,
        category,
        merchant,
        paymentMethod
      }
    );

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
        orderId: (orderResult.order as any)?.id,
        amount: (orderResult.order as any)?.amount,
        currency: (orderResult.order as any)?.currency,
        receipt: (orderResult.order as any)?.receipt,
        key: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/transactions/verify-payment
// @desc    Verify Razorpay payment and save transaction
// @access  Private
router.post('/verify-payment', authenticate, [
  body('razorpayOrderId').isString().withMessage('Order ID is required'),
  body('razorpayPaymentId').isString().withMessage('Payment ID is required'),
  body('razorpaySignature').isString().withMessage('Signature is required'),
  body('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('category').isIn([
    'food', 'entertainment', 'travel', 'shopping', 'savings', 
    'insurance', 'emergency', 'misc', 'bills', 'healthcare',
    'education', 'transport', 'utilities', 'subscriptions'
  ]).withMessage('Invalid category'),
  body('merchant').isString().isLength({ min: 1, max: 100 }).withMessage('Merchant name is required'),
  body('paymentMethod').isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method'),
  body('metadata').optional().isObject().withMessage('Metadata must be an object')
], validate, async (req: Request, res: Response) => {
  try {
    const {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      description,
      category,
      merchant,
      paymentMethod,
      metadata = {}
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Verify Razorpay signature
    const isValidSignature = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValidSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature'
      });
    }

    // Get payment details from Razorpay
    const paymentResult = await getPaymentDetails(razorpayPaymentId);
    if (!paymentResult.success || !paymentResult.payment) {
      return res.status(400).json({
        success: false,
        message: 'Failed to fetch payment details',
        error: paymentResult.error
      });
    }

    const payment = paymentResult.payment;
    const amount = Number(payment.amount) / 100; // Convert from paise to rupees

    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ razorpayPaymentId });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        message: 'Transaction already exists'
      });
    }

    // Create transaction record
    const transaction = new Transaction({
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

    // Update user coins based on transaction (optional)
    if (transaction.status === 'completed') {
      // You can add logic here to update user coins or other rewards
      // For example: add coins based on transaction amount or category
    }

    return res.json({
      success: true,
      data: {
        transaction: transaction,
        message: 'Payment verified and transaction recorded successfully'
      }
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/transactions
// @desc    Get user's transaction history
// @access  Private
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('category').optional().isIn([
    'food', 'entertainment', 'travel', 'shopping', 'savings', 
    'insurance', 'emergency', 'misc', 'bills', 'healthcare',
    'education', 'transport', 'utilities', 'subscriptions'
  ]).withMessage('Invalid category filter'),
  query('status').optional().isIn(['pending', 'completed', 'failed', 'cancelled']).withMessage('Invalid status filter'),
  query('paymentMethod').optional().isIn(['upi', 'card', 'netbanking', 'wallet', 'emi']).withMessage('Invalid payment method filter'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date')
], validate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.status) filters.status = req.query.status;
    if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    // Manually build the query for user transactions with pagination and filters
    const query: any = { userId };
    if (filters.category) query.category = filters.category;
    if (filters.status) query.status = filters.status;
    if (filters.paymentMethod) query.paymentMethod = filters.paymentMethod;
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
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
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/transactions/analytics
// @desc    Get spending analytics for user
// @access  Private
router.get('/analytics', authenticate, [
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Period must be week, month, or year')
], validate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const period = (req.query.period as 'week' | 'month' | 'year') || 'month';

    const analytics = await Transaction.getSpendingAnalytics(userId!, period);

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/transactions/:id
// @desc    Get specific transaction details
// @access  Private
router.get('/:id', authenticate, [
  param('id').isMongoId().withMessage('Invalid transaction ID')
], validate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const transactionId = req.params.id;

    const transaction = await Transaction.findOne({
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
  } catch (error) {
    console.error('Get transaction error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   POST /api/transactions/webhook
// @desc    Razorpay webhook for payment status updates
// @access  Public (but verified with signature)
router.post('/webhook', async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-razorpay-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    
    if (event.event === 'payment.captured') {
      const paymentId = event.payload.payment.entity.id;
      
      // Update transaction status
      await Transaction.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: 'completed' }
      );
    } else if (event.event === 'payment.failed') {
      const paymentId = event.payload.payment.entity.id;
      
      // Update transaction status
      await Transaction.findOneAndUpdate(
        { razorpayPaymentId: paymentId },
        { status: 'failed' }
      );
    }

    return res.json({ success: true, message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook error:', error);
    return res.status(500).json({ success: false, message: 'Webhook processing failed' });
  }
});

export default router;
