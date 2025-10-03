import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { generateToken, generateRefreshToken, authenticate } from '../middleware/auth';
import { validate, registerSchema, loginSchema } from '../middleware/validation';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ mobile }, { email }]
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: existingUser.mobile === mobile 
          ? 'User with this mobile number already exists'
          : 'User with this email already exists',
      });
      return;
    }

    // Create new user
    const user = new User({
      name,
      mobile,
      email,
      password,
    });

    await user.save();

    // Generate tokens
    const token = generateToken(user._id.toString(), user.mobile);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Add refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
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
        token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    // Find user by mobile or email
    const user = await User.findOne({
      $or: [{ mobile: identifier }, { email: identifier }]
    }).select('+password');

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
      return;
    }

    // Generate tokens
    const token = generateToken(user._id.toString(), user.mobile);
    const refreshToken = generateRefreshToken(user._id.toString());

    // Add refresh token to user
    user.refreshTokens.push(refreshToken);
    await user.save();

    // Set refresh token as httpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: 'Login successful',
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
        token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticate, async (req: Request, res: Response) => {
  try {
    console.log('Logout request received');
    console.log('User ID:', req.user!._id);
    
    const refreshToken = req.cookies.refreshToken;
    console.log('Refresh token from cookies:', refreshToken);

    // Always clear the cookie, even if no refresh token
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    if (refreshToken) {
      console.log('Removing refresh token from user...');
      try {
        const updateResult = await User.findByIdAndUpdate(req.user!._id.toString(), {
          $pull: { refreshTokens: refreshToken }
        });
        console.log('Update result:', updateResult);
      } catch (updateError) {
        console.log('Update error (non-critical):', updateError);
        // Continue with logout even if update fails
      }
    } else {
      console.log('No refresh token found in cookies');
    }

    console.log('Sending logout success response');
    res.json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    console.error('Logout error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error during logout',
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req: Request, res: Response) => {
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
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh access token
// @access  Public
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      res.status(401).json({
        success: false,
        message: 'No refresh token provided',
      });
      return;
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as { userId: string };
    
    // Find user and check if refresh token exists
    const user = await User.findById(decoded.userId);
    if (!user || !user.refreshTokens.includes(refreshToken)) {
      res.status(401).json({
        success: false,
        message: 'Invalid refresh token',
      });
      return;
    }

    // Generate new access token
    const newToken = generateToken(user._id.toString(), user.mobile);

    res.json({
      success: true,
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
    });
  }
});

export default router;
