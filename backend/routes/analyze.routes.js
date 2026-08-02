const express = require("express");
const router = express.Router();

const {
  createAnalysis,
  getAnalysis,
  getAnalysisStatus,
  scrapePreview,
} = require("../controllers/analyze.controller");
const { analyzeLimiter } = require("../middleware/rateLimiter");

// POST /api/analyze - start a new analysis (rate limited, since it's expensive)
router.post("/", analyzeLimiter, createAnalysis);

// GET /api/analyze/:id - full report (status + result once completed)
router.get("/:id", getAnalysis);

// GET /api/analyze/:id/status - lightweight status-only check, for polling
router.get("/:id/status", getAnalysisStatus);
router.post("/preview", scrapePreview);
module.exports = router;
