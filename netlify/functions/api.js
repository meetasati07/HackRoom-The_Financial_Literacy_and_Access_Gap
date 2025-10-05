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
  const dbModule = require('./db');
  connectDB = dbModule.default || dbModule;
  console.log('✅ Database module loaded from ./db');
} catch (error) {
  connectDB = async () => {
    console.log('🔄 Database connection skipped');
  };
}

// Auth routes - Register with multiple path patterns for flexibility
authRoutes.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);

    // Check if MongoDB is connected
    if (!process.env.MONGODB_URI) {
      return res.status(500).json({
        success: false,
        message: 'MongoDB connection string not configured'
      });
    }

    res.status(501).json({
      success: false,
      message: 'Registration endpoint needs MongoDB connection and backend compilation to be fixed'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

authRoutes.post('/login', async (req, res) => {
  try {
    console.log('🔐 Login attempt:', req.body.email);
    res.status(501).json({
      success: false,
      message: 'Login endpoint needs backend compilation to be fixed'
    });
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

const initializeDatabase = async () => {
  if (!isConnected) {
    try {
      await connectDB();
      isConnected = true;
      console.log('✅ Database connected successfully');
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
