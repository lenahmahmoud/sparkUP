const { z } = require('zod');

const analyzeInputSchema = z.object({
  websiteUrl: z.string().url({ message: 'websiteUrl must be a valid URL (include https://)' }),
  brandName: z.string().min(1, 'brandName is required').max(100),
  description: z.string().min(1, 'description is required').max(1000),
  productCategory: z.string().min(1, 'productCategory is required').max(100),
  keySellingPoints: z.string().min(1, 'keySellingPoints is required').max(500),
  targetAgeGroup: z.string().min(1, 'targetAgeGroup is required').max(50),
  targetAudience: z.string().min(1, 'targetAudience is required').max(200),
  economicClass: z.string().min(1, 'economicClass is required').max(50),
  region: z.string().min(1, 'region is required').max(100),
  weakPoint: z.string().min(1, 'weakPoint is required').max(500),
});

function validateAnalyzeInput(payload) {
  const result = analyzeInputSchema.safeParse(payload);

  if (!result.success) {
    const fieldErrors = result.error.issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    return { valid: false, errors: fieldErrors, data: null };
  }

  return { valid: true, errors: null, data: result.data };
}

module.exports = { validateAnalyzeInput };
