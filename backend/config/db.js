const mongoose = require('mongoose');
const { mongodbUri } = require('./env');
const logger = require('./logger');

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

async function connectDB(attempt = 1) {
  if (!mongodbUri) {
    logger.error('MONGODB_URI is not set. Check your .env file.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongodbUri);
    logger.info('MongoDB Atlas connected');
  } catch (err) {
    logger.error(`MongoDB connection failed (attempt ${attempt}/${MAX_RETRIES})`, {
      error: err.message,
    });

    if (attempt < MAX_RETRIES) {
      setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
    } else {
      logger.error('Max MongoDB connection retries reached. Exiting.');
      process.exit(1);
    }
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
  logger.info('MongoDB reconnected');
});

module.exports = connectDB;
