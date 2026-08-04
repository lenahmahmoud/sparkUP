# AI Customer Psychology Simulator — Python AI Service Contract

This document defines the exact API contract the **Python AI service** must
implement so the Node.js backend can call it directly by flipping
`USE_MOCK_AI=false` in `.env` — with zero changes to the Node codebase.

The Node backend currently uses a mock service
(`services/mockAi.service.js`) that returns data in this exact shape.
Build your real service to match it precisely.

---

## Endpoint 1: Run Analysis

**Method:** `POST`
**Path:** `/analyze` (Node will call `${PYTHON_AI_SERVICE_URL}/analyze`)
**Timeout:** Node waits up to `AI_SERVICE_TIMEOUT_MS` (default 60000ms / 60s) before giving up.

### Request body (sent by Node)

\`\`\`json
{
  "input": {
    "websiteUrl": "https://example.com",
    "brandName": "Test Brand",
    "description": "A test brand description",
    "productCategory": "Fashion",
    "keySellingPoints": "Fast shipping, sustainable materials",
    "targetAgeGroup": "18-25",
    "targetAudience": "Young professionals",
    "economicClass": "Middle",
    "region": "Egypt",
    "weakPoint": "Checkout is confusing"
  },
  "scrapedData": {
    "url": "https://example.com",
    "scrapedAt": "2026-08-02T12:22:38.376Z",
    "pageTitle": "Example Domain",
    "metaDescription": "string or null",
    "heroHeadline": "string or null",
    "heroSubtext": "string or null",
    "navLinks": ["Home", "Shop", "About"],
    "pricesFound": ["$29.99", "$49.99"],
    "ctaButtons": ["Add to Cart", "Buy Now"],
    "headingHierarchy": [
      { "level": "h1", "text": "Example Domain" },
      { "level": "h2", "text": "Some subheading" }
    ],
    "imageCount": 12,
    "trustSignals": ["free shipping", "money back"]
  }
}
\`\`\`

### Response body (required from your service)

**Status code:** `200 OK` on success.

\`\`\`json
{
  "personas": [
    {
      "name": "Ideal Buyer",
      "type": "ideal_buyer",
      "description": "string describing this persona",
      "reaction": {
        "confusion": 10,
        "boredom": 15,
        "satisfaction": 80,
        "notes": "string explaining why this persona reacted this way"
      }
    }
  ],
  "emotionalBreakdown": {
    "confusion": 25,
    "boredom": 33,
    "satisfaction": 42
  },
  "segments": {
    "winning": ["Ideal Buyer"],
    "rejected": ["Distracted Browser"]
  },
  "recommendations": [
    {
      "issue": "string describing the problem found",
      "suggestion": "string describing the fix",
      "priority": "high | medium | low"
    }
  ]
}
\`\`\`

### Field rules

- `personas`: array, minimum 3 recommended (ideal buyer, price-sensitive skeptic, and at least one low-intent/skeptical persona). Each persona's `reaction.confusion`, `boredom`, `satisfaction` should be integers 0-100.
- `emotionalBreakdown.confusion + boredom + satisfaction` should sum to approximately 100 (this is the aggregate across all personas, not per-persona).
- `segments.winning` / `segments.rejected`: arrays of persona `name` strings, referencing the personas returned above.
- `recommendations`: array of objects, `priority` must be exactly one of `"high"`, `"medium"`, `"low"`.
- All string fields should be non-empty. Do not return `null` for `personas`, `emotionalBreakdown`, `segments`, or `recommendations` — these are required.
- Do not include a top level `success` field in this response — Node wraps that itself.

### Error handling

If your service fails (bad input, internal error, model timeout, etc.), return a non-200 status code with:

\`\`\`json
{ "error": "human-readable error message" }
\`\`\`

Node will catch this, mark the report as `status: "failed"`, and store your error message.

---

## Endpoint 2: Health Check

**Method:** `GET`
**Path:** `/health`

Node's `GET /api/ai-service/health` pings this endpoint to check if your service is reachable. Return `200 OK` with any small JSON body, e.g.:

\`\`\`json
{ "status": "ok" }
\`\`\`

---

## How the dev/parallel workflow works

- While you build this, Node uses `services/mockAi.service.js` to fake this exact response shape — Lenah can build and test the full pipeline without waiting on you.
- Once your `/analyze` and `/health` endpoints are live and match this contract, update `.env`:
  \`\`\`
  PYTHON_AI_SERVICE_URL=http://localhost:8000   (or wherever your service runs)
  USE_MOCK_AI=false
  \`\`\`
- No Node code needs to change — the controller already branches on `USE_MOCK_AI` and will call your real `/analyze` endpoint instead of the mock the moment it's flipped to `false`.

If you need to deviate from this shape for any reason, flag it with Lenah first — the controller expects this exact structure and will error if fields are missing or misnamed.