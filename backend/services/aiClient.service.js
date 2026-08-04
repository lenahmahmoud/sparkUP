const axios = require('axios');
const { pythonAiServiceUrl, aiServiceTimeoutMs, useMockAi } = require('../config/env');
const { runMockAnalysis } = require('./mockAi.service');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

const MAX_RETRIES = 2; // total attempts = 1 initial + 2 retries = 3
const RETRY_DELAY_MS = 1000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callRealAiService({ input, scrapedData }, attempt = 1) {
  try {
    const response = await axios.post(
      `${pythonAiServiceUrl}/analyze`,
      { input, scrapedData },
      { timeout: aiServiceTimeoutMs }
    );
    return response.data;
  } catch (err) {
    const status = err.response?.status;
    const isClientError = status >= 400 && status < 500;

    if (isClientError) {
      logger.error('AI service rejected the request (4xx)', {
        status,
        error: err.response?.data,
      });
      throw new AppError(
        `AI service rejected the request: ${err.response?.data?.error || err.message}`,
        502
      );
    }

    if (attempt <= MAX_RETRIES) {
      logger.warn(`AI service call failed, retrying (${attempt}/${MAX_RETRIES})`, {
        error: err.message,
      });
      await delay(RETRY_DELAY_MS * attempt);
      return callRealAiService({ input, scrapedData }, attempt + 1);
    }

    logger.error('AI service call failed after all retries', { error: err.message });
    throw new AppError(`AI service unreachable after ${MAX_RETRIES + 1} attempts: ${err.message}`, 503);
  }
}

async function runAnalysis({ input, scrapedData }) {
  if (useMockAi) {
    return runMockAnalysis({ input, scrapedData });
  }
  return callRealAiService({ input, scrapedData });
}

module.exports = { runAnalysis };