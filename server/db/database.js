const mongoose = require('mongoose');
const logger = require('../utils/logger');

const initDatabase = async () => {
  try {
    // Use 127.0.0.1 instead of localhost to force IPv4 connection
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/multichannel-chat';
    
    // MongoDB connection options
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4, // Force IPv4 (prevent IPv6 issues)
    };

    // Connect to MongoDB
    await mongoose.connect(mongoUri, options);
    
    logger.info('✓ Connected to MongoDB successfully');
    logger.info(`  Database: ${mongoose.connection.name}`);
    logger.info(`  Host: ${mongoose.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return mongoose.connection;
  } catch (error) {
    logger.error('Failed to connect to MongoDB:', error);
    logger.error('Please ensure MongoDB is running and accessible');
    process.exit(1);
  }
};

module.exports = initDatabase();

