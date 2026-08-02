const axios = require('axios');
const cheerio = require('cheerio');
const { scrapeTimeoutMs } = require('../config/env');
const logger = require('../config/logger');
const { AppError } = require('../middleware/errorHandler');

/**
 * Scrapes a target e-commerce store URL and extracts the signals the AI
 * personas need to react to: hero copy, pricing, nav structure, CTAs,
 * and a rough visual hierarchy (what's biggest/first on the page).
 */
async function scrapeStore(url) {
  let html;

  try {
    const response = await axios.get(url, {
      timeout: scrapeTimeoutMs,
      headers: {
        // Some stores block requests with no user-agent
        'User-Agent':
          'Mozilla/5.0 (compatible; AICustomerPsychBot/1.0; +https://example.com/bot)',
      },
      maxRedirects: 5,
    });
    html = response.data;
  } catch (err) {
    logger.error('Scraping request failed', { url, error: err.message });
    throw new AppError(`Failed to fetch the store URL: ${err.message}`, 422);
  }

  const $ = cheerio.load(html);

  const pageTitle = $('title').first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() || null;

  // Hero section heuristic: first large heading + first paragraph/subtext near the top
  const heroHeadline =
    $('h1').first().text().trim() ||
    $('[class*="hero"] h1, [class*="hero"] h2').first().text().trim() ||
    null;

  const heroSubtext =
    $('[class*="hero"] p').first().text().trim() ||
    $('h1').first().nextAll('p').first().text().trim() ||
    null;

  // Navigation structure
  const navLinks = [];
  $('nav a, header a').each((_, el) => {
    const text = $(el).text().trim();
    if (text && navLinks.length < 20) navLinks.push(text);
  });

  // Pricing signals - look for common currency patterns
  const priceRegex = /(\$|USD|EGP|EUR|£|€)\s?\d+([.,]\d{1,2})?/gi;
  const bodyText = $('body').text();
  const pricesFound = [...new Set(bodyText.match(priceRegex) || [])].slice(0, 15);

  // CTA buttons - common conversion-critical elements
  const ctaButtons = [];
  $('button, a[class*="btn"], a[class*="cta"], input[type="submit"]').each((_, el) => {
    const text = $(el).text().trim() || $(el).attr('value');
    if (text && ctaButtons.length < 15) ctaButtons.push(text);
  });

  // Rough visual hierarchy - headings in document order, tagged by level
  const headingHierarchy = [];
  $('h1, h2, h3').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (text && headingHierarchy.length < 30) {
      headingHierarchy.push({ level: tag, text });
    }
  });

  // Product images count as a rough signal of visual density
  const imageCount = $('img').length;

  // Trust/friction signals worth surfacing to the AI (reviews, guarantees, shipping info)
  const trustSignals = [];
  const trustKeywords = [
    'money back',
    'guarantee',
    'free shipping',
    'return policy',
    'secure checkout',
    'reviews',
  ];
  trustKeywords.forEach((keyword) => {
    if (bodyText.toLowerCase().includes(keyword)) trustSignals.push(keyword);
  });

  return {
    url,
    scrapedAt: new Date().toISOString(),
    pageTitle,
    metaDescription,
    heroHeadline,
    heroSubtext,
    navLinks,
    pricesFound,
    ctaButtons,
    headingHierarchy,
    imageCount,
    trustSignals,
  };
}

module.exports = { scrapeStore };
