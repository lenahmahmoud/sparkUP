/**
 * One-time DB initialization script.
 * Explicitly creates collections in Atlas so they're visible right away,
 * instead of waiting for the first real document to be written.
 *
 * Run with: node scripts/initDb.js
 */
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const logger = require('../config/logger');
const Report = require('../models/Report.model');

async function initCollections() {
  await connectDB();

  const db = mongoose.connection.db;
  const existing = (await db.listCollections().toArray()).map((c) => c.name);

  // Add every model's collection name here as you create more models
  const requiredCollections = [Report.collection.name]; // 'reports'

  for (const name of requiredCollections) {
    if (existing.includes(name)) {
      logger.info(`Collection already exists: ${name}`);
    } else {
      await db.createCollection(name);
      logger.info(`Created collection: ${name}`);
    }
  }

  logger.info('DB initialization complete');
  await mongoose.connection.close();
  process.exit(0);
}

initCollections().catch((err) => {
  logger.error('DB initialization failed', { error: err.message });
  process.exit(1);
});