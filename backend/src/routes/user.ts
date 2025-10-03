import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authenticate } from '../middleware/auth';
import { validate, updateUserSchema } from '../middleware/validation';

const router = Router();

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', authenticate, async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        user: {
          id: req.user!._id,
          name: req.user!.name,
          mobile: req.user!.mobile,
          email: req.user!.email,
          coins: req.user!.coins,
          level: req.user!.level,
          completedQuiz: req.user!.completedQuiz,
          createdAt: req.user!.createdAt,
          updatedAt: req.user!.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, validate(updateUserSchema), async (req: Request, res: Response) => {
  try {
    const { name, email, coins, level, completedQuiz } = req.body;
    
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (coins !== undefined) updateData.coins = coins;
    if (level !== undefined) updateData.level = level;
    if (completedQuiz !== undefined) updateData.completedQuiz = completedQuiz;

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          coins: user.coins,
          level: user.level,
          completedQuiz: user.completedQuiz,
        },
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/users/update-coins
// @desc    Update user coins
// @access  Private
router.post('/update-coins', authenticate, async (req: Request, res: Response) => {
  try {
    const { coins } = req.body;

    if (typeof coins !== 'number' || coins < 0) {
      res.status(400).json({
        success: false,
        message: 'Coins must be a non-negative number',
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { coins },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Coins updated successfully',
      data: {
        coins: user.coins,
      },
    });
  } catch (error) {
    console.error('Update coins error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/users/complete-quiz
// @desc    Mark quiz as completed and update level
// @access  Private
router.post('/complete-quiz', authenticate, async (req: Request, res: Response) => {
  try {
    const { coins, level } = req.body;

    if (typeof coins !== 'number' || coins < 0) {
      res.status(400).json({
        success: false,
        message: 'Coins must be a non-negative number',
      });
      return;
    }

    if (!['Beginner', 'Intermediate', 'Advanced', 'Expert'].includes(level)) {
      res.status(400).json({
        success: false,
        message: 'Invalid level',
      });
      return;
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { 
        coins,
        level,
        completedQuiz: true,
      },
      { new: true }
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found',
      });
      return;
    }

    res.json({
      success: true,
      message: 'Quiz completed successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          mobile: user.mobile,
          email: user.email,
          coins: user.coins,
          level: user.level,
          completedQuiz: user.completedQuiz,
        },
      },
    });
  } catch (error) {
    console.error('Complete quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   DELETE /api/users/account
// @desc    Delete user account
// @access  Private
router.delete('/account', authenticate, async (req: Request, res: Response) => {
  try {
    await User.findByIdAndDelete(req.user!._id);

    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Account deleted successfully',
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

export default router;
