const rateLimit = require('express-rate-limit');

// Applies to POST /api/analyze specifically - scraping + AI calls are expensive
const analyzeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 analysis requests per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many analysis requests from this IP. Please try again later.',
  },
});

// Looser general limiter for read endpoints (status checks, list, etc.)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { analyzeLimiter, generalLimiter };
