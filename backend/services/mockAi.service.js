/**
 * MOCK AI SERVICE
 * ----------------
 * Returns fake-but-realistic data in the EXACT shape your friend's real
 * Python service must return. This lets you build/test the full Node
 * pipeline right now, without waiting on their service.
 *
 * Contract: given { input, scrapedData }, return:
 * {
 *   personas: [ { name, type, description, reaction } ],
 *   emotionalBreakdown: { confusion, boredom, satisfaction },  // percentages summing to 100
 *   segments: { winning: [...], rejected: [...] },
 *   recommendations: [ { issue, suggestion, priority } ]
 * }
 *
 * Once your friend's real API is live, set USE_MOCK_AI=false in .env
 * and nothing else in this codebase needs to change.
 */

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runMockAnalysis({ input, scrapedData }) {
  // Simulate realistic processing time so the async job pattern is testable
  await delay(1500);

  return {
    personas: [
      {
        name: 'Ideal Buyer',
        type: 'ideal_buyer',
        description: `A ${input.targetAgeGroup} year old from ${input.region} matching the ${input.targetAudience} profile.`,
        reaction: {
          confusion: 10,
          boredom: 15,
          satisfaction: 80,
          notes: `Responded well to the headline "${scrapedData?.heroHeadline || 'N/A'}" and found the selling points convincing.`,
        },
      },
      {
        name: 'Price-Sensitive Skeptic',
        type: 'price_sensitive',
        description: `A budget-conscious shopper from the ${input.economicClass} economic class.`,
        reaction: {
          confusion: 25,
          boredom: 30,
          satisfaction: 40,
          notes: `Hesitated at pricing signals: ${(scrapedData?.pricesFound || []).slice(0, 3).join(', ') || 'none detected'}.`,
        },
      },
      {
        name: 'Distracted Browser',
        type: 'low_intent',
        description: 'A casual visitor with low purchase intent, quick to bounce.',
        reaction: {
          confusion: 40,
          boredom: 55,
          satisfaction: 20,
          notes: `Found the known friction point relevant: "${input.weakPoint}".`,
        },
      },
    ],

    emotionalBreakdown: {
      confusion: 25,
      boredom: 33,
      satisfaction: 42,
    },

    segments: {
      winning: ['Ideal Buyer'],
      rejected: ['Distracted Browser'],
    },

    recommendations: [
      {
        issue: `Friction point confirmed: ${input.weakPoint}`,
        suggestion: 'Address this directly above the fold with clearer copy or visual reassurance.',
        priority: 'high',
      },
      {
        issue: 'Pricing clarity',
        suggestion: 'Make pricing and any discounts more prominent near the primary CTA.',
        priority: 'medium',
      },
      {
        issue: 'Trust signals',
        suggestion: scrapedData?.trustSignals?.length
          ? 'Trust signals detected are good — consider making them more visually prominent.'
          : 'No strong trust signals detected (reviews, guarantees). Consider adding them near checkout.',
        priority: 'medium',
      },
    ],

    _meta: {
      mock: true,
      generatedAt: new Date().toISOString(),
    },
  };
}

module.exports = { runMockAnalysis };
