const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");

const { port, clientOrigin, nodeEnv } = require("./config/env");
const logger = require("./config/logger");
const connectDB = require("./config/db");
const { generalLimiter } = require("./middleware/rateLimiter");
const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Request logging ---
app.use(
  morgan(nodeEnv === "production" ? "combined" : "dev", {
    stream: { write: (message) => logger.info(message.trim()) },
  }),
);

// --- Rate limiting (general baseline; /api/analyze gets its own stricter limiter later) ---
app.use(generalLimiter);

// --- Health check ---
const {
  checkHealth,
  checkAiServiceHealth,
} = require("./controllers/health.controller");

app.get("/health", checkHealth);
app.get("/api/ai-service/health", checkAiServiceHealth);

app.use("/api/analyze", require("./routes/analyze.routes"));
app.use("/api/reports", require("./routes/reports.routes"));

// --- 404 + error handling (must be last) ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Start server after DB connects ---
async function start() {
  await connectDB();

  app.listen(port, () => {
    logger.info(`Server running on port ${port} [${nodeEnv}]`);
  });
}

start();

module.exports = app;
