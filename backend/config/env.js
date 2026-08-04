require('dotenv').config();

module.exports = {
  apiKey: process.env.API_KEY || null,
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',

  clientOrigin: process.env.CLIENT_ORIGIN || '*',

  mongodbUri: process.env.MONGODB_URI,

  pythonAiServiceUrl: process.env.PYTHON_AI_SERVICE_URL || 'http://localhost:8000',
  aiServiceTimeoutMs: Number(process.env.AI_SERVICE_TIMEOUT_MS) || 60000,

  scrapeTimeoutMs: Number(process.env.SCRAPE_TIMEOUT_MS) || 15000,

  useMockAi: (process.env.USE_MOCK_AI || 'true').toLowerCase() === 'true',

  logLevel: process.env.LOG_LEVEL || 'info',
};
