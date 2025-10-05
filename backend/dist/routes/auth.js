"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.post('/register', (0, validation_1.validate)(validation_1.registerSchema), async (req, res) => {
    try {
        console.log('=== REGISTERATION DEBUG ===');
        console.log('Request body:', req.body);
        console.log('Environment variables check:');
        console.log('- JWT_SECRET exists:', !!process.env.JWT_SECRET);
        console.log('- JWT_REFRESH_SECRET exists:', !!process.env.JWT_REFRESH_SECRET);
        console.log('- MONGODB_URI exists:', !!process.env.MONGODB_URI);
        console.log('=========================');
        const { name, mobile, email, password } = req.body;
        const existingUser = await User_1.User.findOne({
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
        const user = new User_1.User({
            name,
            mobile,
            email,
            password,
        });
        await user.save();
        console.log('Generating tokens for user:', user._id.toString(), user.mobile);
        const token = (0, auth_1.generateToken)(user._id.toString(), user.mobile);
        const refreshToken = (0, auth_1.generateRefreshToken)(user._id.toString());
        console.log('Tokens generated successfully');
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        console.error('=== REGISTRATION ERROR ===');
        console.error('Error details:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        console.error('========================');
        res.status(500).json({
            success: false,
            message: 'Server error during registration',
        });
    }
});
router.post('/login', (0, validation_1.validate)(validation_1.loginSchema), async (req, res) => {
    try {
        const { identifier, password } = req.body;
        const user = await User_1.User.findOne({
            $or: [{ mobile: identifier }, { email: identifier }]
        }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
            return;
        }
        const token = (0, auth_1.generateToken)(user._id.toString(), user.mobile);
        const refreshToken = (0, auth_1.generateRefreshToken)(user._id.toString());
        user.refreshTokens.push(refreshToken);
        await user.save();
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
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
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login',
        });
    }
});
router.post('/logout', auth_1.authenticate, async (req, res) => {
    try {
        console.log('Logout request received');
        console.log('User ID:', req.user._id);
        const refreshToken = req.cookies.refreshToken;
        console.log('Refresh token from cookies:', refreshToken);
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });
        if (refreshToken) {
            console.log('Removing refresh token from user...');
            try {
                const updateResult = await User_1.User.findByIdAndUpdate(req.user._id.toString(), {
                    $pull: { refreshTokens: refreshToken }
                });
                console.log('Update result:', updateResult);
            }
            catch (updateError) {
                console.log('Update error (non-critical):', updateError);
            }
        }
        else {
            console.log('No refresh token found in cookies');
        }
        console.log('Sending logout success response');
        res.json({
            success: true,
            message: 'Logout successful',
        });
    }
    catch (error) {
        console.error('Logout error details:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            success: false,
            message: 'Server error during logout',
        });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                user: {
                    id: req.user._id,
                    name: req.user.name,
                    mobile: req.user.mobile,
                    email: req.user.email,
                    coins: req.user.coins,
                    level: req.user.level,
                    completedQuiz: req.user.completedQuiz,
                },
            },
        });
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/refresh', async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            res.status(401).json({
                success: false,
                message: 'No refresh token provided',
            });
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const user = await User_1.User.findById(decoded.userId);
        if (!user || !user.refreshTokens.includes(refreshToken)) {
            res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
            return;
        }
        const newToken = (0, auth_1.generateToken)(user._id.toString(), user.mobile);
        res.json({
            success: true,
            data: {
                token: newToken,
            },
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid refresh token',
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map