const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hackwave';

    const conn = await mongoose.connect(mongoURI);

    console.log(`📦 MongoDB Connected: ${conn.connection.host}`);
    console.log(`🗄️ Database: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

module.exports = connectDB;
