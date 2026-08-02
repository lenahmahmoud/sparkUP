const mongoose = require('mongoose');

const InputSchema = new mongoose.Schema(
  {
    websiteUrl: { type: String, required: true, trim: true },
    brandName: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    productCategory: { type: String, required: true, trim: true },
    keySellingPoints: { type: String, required: true, trim: true },
    targetAgeGroup: { type: String, required: true, trim: true },
    targetAudience: { type: String, required: true, trim: true },
    economicClass: { type: String, required: true, trim: true },
    region: { type: String, required: true, trim: true },
    weakPoint: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ReportSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['pending', 'scraping', 'analyzing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },

    input: { type: InputSchema, required: true },

    // Filled in by the scraper (Task Group 4, Step 1)
    scrapedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    // Filled in by the Python AI service (real or mock)
    aiResult: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    error: {
      message: { type: String, default: null },
      step: { type: String, default: null }, // e.g. "scraping" | "ai_service" | "db"
    },

    completedAt: { type: Date, default: null },
  },
  { timestamps: true } // adds createdAt, updatedAt
);

ReportSchema.index({ 'input.websiteUrl': 1, createdAt: -1 });

module.exports = mongoose.model('Report', ReportSchema);
