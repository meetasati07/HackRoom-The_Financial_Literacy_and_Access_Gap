const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const serverless = require('serverless-http');

// Import backend modules - try both compiled and source versions
let connectDB, authRoutes, userRoutes, financialRoutes, transactionRoutes, errorHandler, notFound;

try {
  // Try importing from compiled backend first
  const dbModule = require('../../backend/dist/config/database');
  const authModule = require('../../backend/dist/routes/auth');
  const userModule = require('../../backend/dist/routes/user');
  const financialModule = require('../../backend/dist/routes/financial');
  const transactionModule = require('../../backend/dist/routes/transactions');
  const errorModule = require('../../backend/dist/middleware/errorHandler');

  connectDB = dbModule.connectDB;
  authRoutes = authModule.default;
  userRoutes = userModule.default;
  financialRoutes = financialModule.default;
  transactionRoutes = transactionModule.default;
  errorHandler = errorModule.errorHandler;
  notFound = errorModule.notFound;

  console.log('✅ Backend modules imported successfully');
} catch (error) {
  console.error('❌ Failed to import backend modules:', error.message);
  console.log('This may indicate backend compilation issues');

  // Provide fallback for build time - these will be replaced at runtime
  connectDB = async () => {
    console.log('🔄 Using fallback database connection');
  };
  authRoutes = (req, res, next) => {
    console.log('❌ Auth routes not available');
    res.status(404).json({ error: 'Auth routes not available' });
  };
  userRoutes = (req, res, next) => {
    console.log('❌ User routes not available');
    res.status(404).json({ error: 'User routes not available' });
  };
  financialRoutes = (req, res, next) => {
    console.log('❌ Financial routes not available');
    res.status(404).json({ error: 'Financial routes not available' });
  };
  transactionRoutes = (req, res, next) => {
    console.log('❌ Transaction routes not available');
    res.status(404).json({ error: 'Transaction routes not available' });
  };
  errorHandler = (err, req, res, next) => {
    console.error('❌ Error handler not available:', err);
    res.status(500).json({ error: 'Server error' });
  };
  notFound = (req, res) => {
    console.log('❌ Route not found:', req.originalUrl);
    res.status(404).json({ error: 'Not found' });
  };
}

// Create Express app
const app = express();

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HackWave API is running on Netlify',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/financial', financialRoutes);
app.use('/transactions', transactionRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

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
