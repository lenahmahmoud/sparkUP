const Report = require("../models/Report.model");
const { validateAnalyzeInput } = require("../utils/validateInput");
const { scrapeStore } = require("../services/scraper.service");
const { runAnalysis } = require("../services/aiClient.service");
const logger = require("../config/logger");
const { AppError } = require("../middleware/errorHandler");
/**
 * Runs in the background AFTER we've already responded to the client with a reportId.
 * Updates the Report document as it progresses through each step.
 */
async function runPipeline(reportId) {
  const report = await Report.findById(reportId);
  if (!report) {
    logger.error("Pipeline: report not found", { reportId });
    return;
  }

  try {
    // --- Step: scraping ---
    report.status = "scraping";
    await report.save();

    const scrapedData = await scrapeStore(report.input.websiteUrl);
    report.scrapedData = scrapedData;
    await report.save();

    // --- Step: AI analysis ---
    report.status = "analyzing";
    await report.save();

    const aiResult = await runAnalysis({ input: report.input, scrapedData });

    report.aiResult = aiResult;
    report.status = "completed";
    report.completedAt = new Date();
    await report.save();

    logger.info("Pipeline completed", { reportId });
  } catch (err) {
    logger.error("Pipeline failed", { reportId, error: err.message });
    report.status = "failed";
    report.error = {
      message: err.message,
      step: report.status === "scraping" ? "scraping" : "ai_service",
    };
    await report.save();
  }
}

async function createAnalysis(req, res, next) {
  try {
    const { valid, errors, data } = validateAnalyzeInput(req.body);

    if (!valid) {
      return res.status(400).json({ success: false, errors });
    }

    const report = await Report.create({
      status: "pending",
      input: data,
    });

    runPipeline(report._id).catch((err) => {
      logger.error("Unhandled pipeline error", { error: err.message });
    });

    res.status(202).json({
      success: true,
      reportId: report._id,
      status: report.status,
      message: "Analysis started. Poll GET /api/analyze/:id for results.",
    });
  } catch (err) {
    next(err);
  }
}

async function getAnalysis(req, res, next) {
  try {
    const report = await Report.findById(req.params.id);

    if (!report) {
      return next(new AppError("Report not found", 404));
    }

    res.json({ success: true, report });
  } catch (err) {
    next(err);
  }
}

async function getAnalysisStatus(req, res, next) {
  try {
    const report = await Report.findById(req.params.id).select(
      "status error completedAt",
    );

    if (!report) {
      return next(new AppError("Report not found", 404));
    }

    res.json({
      success: true,
      status: report.status,
      error: report.error,
      completedAt: report.completedAt,
    });
  } catch (err) {
    next(err);
  }
}
async function scrapePreview(req, res, next) {
  try {
    const { websiteUrl } = req.body;

    if (!websiteUrl || typeof websiteUrl !== "string") {
      return res.status(400).json({
        success: false,
        errors: [{ field: "websiteUrl", message: "websiteUrl is required" }],
      });
    }

    const scrapedData = await scrapeStore(websiteUrl);

    res.json({ success: true, scrapedData });
  } catch (err) {
    next(err);
  }
}
module.exports = {
  createAnalysis,
  getAnalysis,
  getAnalysisStatus,
  scrapePreview,
};
