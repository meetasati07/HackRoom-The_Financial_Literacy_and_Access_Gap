const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const serverless = require('serverless-http');

// Create Express app instance
const app = express();
const authRoutes = require('express').Router();
const userRoutes = require('express').Router();
const financialRoutes = require('express').Router();
const transactionRoutes = require('express').Router();

// Import database connection with fallback
let connectDB;
try {
  // Try to load from compiled backend first
  const dbModule = require('../../backend/dist/config/database');
  connectDB = dbModule.connectDB;
  console.log('✅ Database module loaded from compiled backend');
} catch (error) {
  console.log('⚠️ Compiled backend not available, using fallback');
  try {
    // Try to load from source files
    const dbModule = require('../../backend/src/config/database');
    connectDB = dbModule.connectDB;
    console.log('✅ Database module loaded from source files');
  } catch (sourceError) {
    console.log('⚠️ Source files not available, using minimal fallback');
    connectDB = async () => {
      console.log('🔄 Database connection skipped - configure MONGODB_URI to enable');
    };
  }
}

// Auth routes - Register with multiple path patterns for flexibility
authRoutes.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt - full request body:', JSON.stringify(req.body));
    console.log('📝 Registration attempt - email field:', req.body?.email);

    // Check if MongoDB is connected
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB connection string not configured'
      });
    }

    // Validate request body
    if (!req.body) {
      console.error('❌ Request body is missing');
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const { name, mobile, email, password } = req.body;

    // Validate required fields
    if (!name || !mobile || !email || !password) {
      console.error('❌ Missing required fields:', { name: !!name, mobile: !!mobile, email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'All fields (name, mobile, email, password) are required',
        received: { name, mobile, email, password: password ? '[HIDDEN]' : undefined }
      });
    }

    // Try to load and use the actual registration logic
    try {
      const mongoose = require('mongoose');

      // Define a simple User schema for serverless function
      const userSchema = new mongoose.Schema({
        name: { type: String, required: true },
        mobile: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        coins: { type: Number, default: 0 },
        level: { type: String, default: 'Beginner' },
        completedQuiz: { type: Boolean, default: false },
        refreshTokens: [{ type: String }],
      }, { timestamps: true });

      // Hash password before saving (simple implementation)
      userSchema.pre('save', async function(next) {
        if (this.isModified('password')) {
          const bcrypt = require('bcryptjs');
          const salt = await bcrypt.genSalt(10);
          this.password = await bcrypt.hash(this.password, salt);
        }
        next();
      });

      const User = mongoose.models.User || mongoose.model('User', userSchema);

      const { name, mobile, email, password } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({
        $or: [{ mobile }, { email }]
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: existingUser.mobile === mobile
            ? 'Mobile number already registered'
            : 'Email already registered'
        });
      }

      // Create new user
      const user = new User({ name, mobile, email, password });
      await user.save();

      // Generate simple token (you'll want to use proper JWT in production)
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { userId: user._id, mobile: user.mobile },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

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
          },
          token,
        },
      });

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      res.status(500).json({
        success: false,
        message: 'Registration failed - database error'
      });
    }

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRoutes.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt - full request body:', JSON.stringify(req.body));
    console.log('🔐 Login attempt - identifier field:', req.body?.identifier);

    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB connection string not configured'
      });
    }

    // Validate request body
    if (!req.body) {
      console.error('❌ Login request body is missing');
      return res.status(400).json({
        success: false,
        message: 'Request body is required'
      });
    }

    const { identifier, password } = req.body;

    // Validate required fields
    if (!identifier || !password) {
      console.error('❌ Login missing required fields:', { identifier: !!identifier, password: !!password });
      return res.status(400).json({
        success: false,
        message: 'Both identifier (email/mobile) and password are required',
        received: { identifier, password: password ? '[HIDDEN]' : undefined }
      });
    }

    try {
      const mongoose = require('mongoose');
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');

      // Define User schema if not exists
      const userSchema = new mongoose.Schema({
        name: String, mobile: String, email: String, password: String,
        coins: Number, level: String, completedQuiz: Boolean, refreshTokens: [String]
      }, { timestamps: true });

      const User = mongoose.models.User || mongoose.model('User', userSchema);

      // Find user by mobile or email
      const user = await User.findOne({
        $or: [{ mobile: identifier }, { email: identifier }]
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate token
      const token = jwt.sign(
        { userId: user._id, mobile: user.mobile },
        process.env.JWT_SECRET || 'fallback-secret',
        { expiresIn: '7d' }
      );

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

    } catch (dbError) {
      console.error('Login database error:', dbError);
      res.status(500).json({
        success: false,
        message: 'Login failed - database error'
      });
    }

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// User routes - Register with actual Netlify paths
userRoutes.get('/profile', async (req, res) => {
  try {
    console.log('👤 Profile request');
    res.status(501).json({
      success: false,
      message: 'Profile endpoint needs authentication and backend compilation to be fixed'
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// API routes - Register with multiple path patterns
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api', authRoutes); // For direct access to auth routes

// Health check endpoint - Register with actual path Netlify sends
app.get('/.netlify/functions/api/health', (req, res) => {
  console.log('✅ Health check accessed');
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    actualPath: req.path,
    note: 'Fixed path for Netlify serverless functions'
  });
});

// Also keep the short path for direct access
app.get('/health', (req, res) => {
  console.log('✅ Health check accessed (short path)');
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    note: 'Short path access'
  });
});

// API routes - Use full paths for Netlify serverless functions
app.use('/.netlify/functions/api/auth', authRoutes);
app.use('/.netlify/functions/api/users', userRoutes);
app.use('/.netlify/functions/api/financial', financialRoutes);
app.use('/.netlify/functions/api/transactions', transactionRoutes);

// Also register auth routes at the root level for direct access
app.use('/.netlify/functions/api', authRoutes);

// Error handling middleware
app.use((req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error'
  });
});

// Initialize database connection
let isConnected = false;
let mongooseConnection = null;

const initializeDatabase = async () => {
  if (!isConnected && process.env.MONGODB_URI) {
    try {
      const mongoose = require('mongoose');
      mongooseConnection = await mongoose.connect(process.env.MONGODB_URI);
      isConnected = true;
      console.log('✅ MongoDB connected successfully');
      console.log(`📦 Database: ${mongooseConnection.connection.name}`);
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }
};

// Create serverless handler
const serverlessApp = serverless(app);

exports.handler = async (event, context) => {
  // Ensure database is connected
  try {
    await initializeDatabase();
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Database connection failed',
        error: error.message
      }),
    };
  }

  // Handle the request
  return await serverlessApp(event, context);
};
