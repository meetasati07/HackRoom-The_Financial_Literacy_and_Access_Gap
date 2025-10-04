import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import serverless from 'serverless-http';
import { connectDB } from '../../backend/src/config/database';
import authRoutes from '../../backend/src/routes/auth';
import userRoutes from '../../backend/src/routes/user';
import financialRoutes from '../../backend/src/routes/financial';
import transactionRoutes from '../../backend/src/routes/transactions';
import { errorHandler, notFound } from '../../backend/src/middleware/errorHandler';

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
    'https://hackwave-fintech.netlify.app',
    'http://localhost:3000',
    'http://localhost:5173',
    process.env.FRONTEND_URL || 'https://hackwave-fintech.netlify.app'
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

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Ensure database is connected
  try {
    await initializeDatabase();
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: 'Database connection failed',
      }),
    };
  }

  // Handle the request
  return await serverlessApp(event, context);
};
