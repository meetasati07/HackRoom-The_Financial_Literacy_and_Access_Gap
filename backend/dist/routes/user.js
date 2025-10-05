"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
router.get('/profile', auth_1.authenticate, async (req, res) => {
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
                    createdAt: req.user.createdAt,
                    updatedAt: req.user.updatedAt,
                },
            },
        });
    }
    catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.put('/profile', auth_1.authenticate, (0, validation_1.validate)(validation_1.updateUserSchema), async (req, res) => {
    try {
        const { name, email, coins, level, completedQuiz } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (email !== undefined)
            updateData.email = email;
        if (coins !== undefined)
            updateData.coins = coins;
        if (level !== undefined)
            updateData.level = level;
        if (completedQuiz !== undefined)
            updateData.completedQuiz = completedQuiz;
        const user = await User_1.User.findByIdAndUpdate(req.user._id, updateData, { new: true, runValidators: true });
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
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/update-coins', auth_1.authenticate, async (req, res) => {
    try {
        const { coins } = req.body;
        if (typeof coins !== 'number' || coins < 0) {
            res.status(400).json({
                success: false,
                message: 'Coins must be a non-negative number',
            });
            return;
        }
        const user = await User_1.User.findByIdAndUpdate(req.user._id, { coins }, { new: true });
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
    }
    catch (error) {
        console.error('Update coins error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.post('/complete-quiz', auth_1.authenticate, async (req, res) => {
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
        const user = await User_1.User.findByIdAndUpdate(req.user._id, {
            coins,
            level,
            completedQuiz: true,
        }, { new: true });
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
    }
    catch (error) {
        console.error('Complete quiz error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
router.delete('/account', auth_1.authenticate, async (req, res) => {
    try {
        await User_1.User.findByIdAndDelete(req.user._id);
        res.clearCookie('refreshToken');
        res.json({
            success: true,
            message: 'Account deleted successfully',
        });
    }
    catch (error) {
        console.error('Delete account error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
});
exports.default = router;
//# sourceMappingURL=user.js.map