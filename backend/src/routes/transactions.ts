import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import { Transaction } from '../models/Transaction';
import { body, query, param } from 'express-validator';

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

// @route   POST /api/transactions
// @desc    Create a new expense transaction
// @access  Private
router.post('/', authenticate, [
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').isString().isLength({ min: 1, max: 500 }).withMessage('Description is required'),
  body('category').isIn([
    'food', 'entertainment', 'travel', 'shopping', 'savings', 
    'insurance', 'emergency', 'misc', 'bills', 'healthcare',
    'education', 'transport', 'utilities', 'subscriptions'
  ]).withMessage('Invalid category'),
  body('merchant').optional().isString().isLength({ max: 100 }).withMessage('Merchant name cannot exceed 100 characters'),
  body('paymentMethod').optional().isIn(['cash', 'upi', 'card', 'netbanking', 'wallet', 'other']).withMessage('Invalid payment method'),
  body('notes').optional().isString().isLength({ max: 200 }).withMessage('Notes cannot exceed 200 characters')
], validate, async (req: Request, res: Response) => {
  try {
    const { amount, description, category, merchant, paymentMethod, notes } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Create transaction record
    const transaction = new Transaction({
      userId,
      amount: Number(amount),
      description,
      category,
      merchant,
      paymentMethod,
      notes
    });

    await transaction.save();

    return res.json({
      success: true,
      data: {
        transaction,
        message: 'Transaction recorded successfully'
      }
    });
  } catch (error) {
    console.error('Create transaction error:', error);
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
  query('paymentMethod').optional().isIn(['cash', 'upi', 'card', 'netbanking', 'wallet', 'other']).withMessage('Invalid payment method filter'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date')
], validate, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    
    const filters: any = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.paymentMethod) filters.paymentMethod = req.query.paymentMethod;
    if (req.query.startDate) filters.startDate = new Date(req.query.startDate as string);
    if (req.query.endDate) filters.endDate = new Date(req.query.endDate as string);

    // Use the static method from the model
    const result = await Transaction.getUserTransactions(userId!, page, limit, filters);

    res.json({
      success: true,
      data: result
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

export default router;
