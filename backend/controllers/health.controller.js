const axios = require("axios");
const mongoose = require("mongoose");
const { pythonAiServiceUrl, useMockAi } = require("../config/env");
const logger = require("../config/logger");

function checkHealth(req, res) {
  const dbState = mongoose.connection.readyState;
  const dbStatus =
    ["disconnected", "connected", "connecting", "disconnecting"][dbState] ||
    "unknown";

  res.json({
    success: true,
    status: "ok",
    uptime: process.uptime(),
    db: dbStatus,
    timestamp: new Date().toISOString(),
  });
}

async function checkAiServiceHealth(req, res) {
  if (useMockAi) {
    return res.json({
      success: true,
      mode: "mock",
      message: "USE_MOCK_AI is true - not calling the real Python service.",
    });
  }

  try {
    const response = await axios.get(`${pythonAiServiceUrl}/health`, {
      timeout: 5000,
    });
    res.json({
      success: true,
      mode: "live",
      aiServiceStatus: "reachable",
      aiServiceResponse: response.data,
    });
  } catch (err) {
    logger.error("AI service health check failed", { error: err.message });
    res.status(503).json({
      success: false,
      mode: "live",
      aiServiceStatus: "unreachable",
      error: err.message,
    });
  }
}

module.exports = { checkHealth, checkAiServiceHealth };
