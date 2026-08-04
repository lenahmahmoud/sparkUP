const mongoose = require('mongoose');
const connectDB = require('../config/db');
const logger = require('../config/logger');
const Report = require('../models/Report.model');

async function seed() {
  await connectDB();

  const sampleReport = new Report({
    status: 'completed',
    input: {
      websiteUrl: 'https://example-store.com',
      brandName: 'Sample Brand',
      description: 'A sample brand used only to preview the DB schema.',
      productCategory: 'Fashion',
      keySellingPoints: 'Fast shipping, sustainable materials',
      targetAgeGroup: '18-25',
      targetAudience: 'Young professionals',
      economicClass: 'Middle',
      region: 'Egypt',
      weakPoint: 'Checkout process is confusing',
    },
    scrapedData: {
      url: 'https://example-store.com',
      scrapedAt: new Date().toISOString(),
      pageTitle: 'Sample Store - Home',
      metaDescription: 'Sample meta description',
      heroHeadline: 'Sample Hero Headline',
      heroSubtext: 'Sample hero subtext',
      navLinks: ['Home', 'Shop', 'About'],
      pricesFound: ['$29.99', '$49.99'],
      ctaButtons: ['Add to Cart', 'Buy Now'],
      headingHierarchy: [{ level: 'h1', text: 'Sample Hero Headline' }],
      imageCount: 12,
      trustSignals: ['free shipping', 'money back'],
    },
    aiResult: {
      personas: [
        {
          name: 'Ideal Buyer',
          type: 'ideal_buyer',
          description: 'Sample persona description',
          reaction: { confusion: 10, boredom: 15, satisfaction: 80, notes: 'Sample note' },
        },
      ],
      emotionalBreakdown: { confusion: 25, boredom: 33, satisfaction: 42 },
      segments: { winning: ['Ideal Buyer'], rejected: ['Distracted Browser'] },
      recommendations: [
        { issue: 'Sample issue', suggestion: 'Sample suggestion', priority: 'high' },
      ],
      _meta: { mock: true, generatedAt: new Date().toISOString() },
    },
    error: { message: null, step: null },
    completedAt: new Date(),
  });

  await sampleReport.save();
  logger.info('Sample report seeded', { reportId: sampleReport._id.toString() });

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch((err) => {
  logger.error('Seeding failed', { error: err.message });
  process.exit(1);
});