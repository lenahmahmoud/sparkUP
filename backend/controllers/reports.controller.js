const Report = require("../models/Report.model");
const { AppError } = require("../middleware/errorHandler");

async function listReports(req, res, next) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    if (req.query.websiteUrl) {
      filter["input.websiteUrl"] = {
        $regex: req.query.websiteUrl,
        $options: "i",
      };
    }

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select("-scrapedData -aiResult"),
      Report.countDocuments(filter),
    ]);

    res.json({
      success: true,
      reports,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

async function deleteReport(req, res, next) {
  try {
    const report = await Report.findByIdAndDelete(req.params.id);

    if (!report) {
      return next(new AppError("Report not found", 404));
    }

    res.json({
      success: true,
      message: "Report deleted",
      reportId: req.params.id,
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { listReports, deleteReport };
