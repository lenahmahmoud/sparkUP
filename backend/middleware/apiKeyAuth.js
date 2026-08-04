const { apiKey } = require('../config/env');
const { AppError } = require('./errorHandler');

function requireApiKey(req, res, next) {
  if (!apiKey) {
    return next();
  }

  const providedKey = req.headers['x-api-key'];

  if (!providedKey || providedKey !== apiKey) {
    return next(new AppError('Invalid or missing API key', 401));
  }

  next();
}

module.exports = { requireApiKey };