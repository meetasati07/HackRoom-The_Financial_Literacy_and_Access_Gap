const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const serverless = require('serverless-http');

// Simple API routes that work without backend compilation
const authRoutes = require('express').Router();
const userRoutes = require('express').Router();
const financialRoutes = require('express').Router();
const transactionRoutes = require('express').Router();

// Health check endpoint
const healthRoutes = require('express').Router();
healthRoutes.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// Basic auth routes
authRoutes.post('/register', async (req, res) => {
  try {
    console.log('📝 Registration attempt:', req.body.email);
    res.status(501).json({
      success: false,
      message: 'Registration endpoint needs backend compilation to be fixed'
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

// Import backend modules if available, otherwise use fallbacks
let connectDB;
try {
  const dbModule = require('../../backend/dist/config/database');
  connectDB = dbModule.connectDB;
  console.log('✅ Database module loaded');
} catch (error) {
  console.log('⚠️ Database module not available, using fallback');
  connectDB = async () => {
    console.log('🔄 Database connection skipped');
  };
}

// Create Express app
const app = express();

// Add logging middleware first
app.use((req, res, next) => {
  console.log(`🚀 Request received: ${req.method} ${req.originalUrl}`);
  console.log(`📍 Path: ${req.path}`);
  console.log(`🔍 Base URL: ${req.baseUrl}`);
  next();
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Netlify compatibility
}));
app.use(compression());

// CORS configuration for production
app.use(cors({
  origin: [
    'https://hackroomfinlearn.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://hackroomfinlearn.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint - Multiple ways to register
app.get('/health', (req, res) => {
  console.log('✅ Health check accessed');
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    path: req.path,
    baseUrl: req.baseUrl,
    originalUrl: req.originalUrl
  });
});

// Also register without leading slash (Netlify might strip it)
app.get('health', (req, res) => {
  console.log('✅ Health check accessed (no leading slash)');
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    note: 'Accessed without leading slash'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/financial', financialRoutes);
app.use('/transactions', transactionRoutes);

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
