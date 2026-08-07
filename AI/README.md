# SparkUp AI Engine — Customer Psychology Simulator

FastAPI service that simulates multiple customer personas reacting to an
e-commerce store, matching the contract in `API_CONTRACT.md`.

## Setup

1. Install dependencies:
pip install -r requirements.txt

2. Create a `.env` file (copy `.env.example`) and add your Gemini API key:
GEMINI_API_KEY=your_actual_key_here

3. Run the server:
python -m uvicorn main:app --reload --port 8000

The server runs at `http://127.0.0.1:8000`.

## Endpoints

- `GET /health` — health check, returns `{"status": "ok"}`
- `POST /analyze` — runs the persona simulation. See `API_CONTRACT.md`
  for the exact request/response shape.

## Important: Free-tier quota limit

The Gemini free tier allows only **20 requests per day** for this model.
Each `/analyze` call uses N+1 requests (N personas + 1 for recommendations).
If you hit a `429 RESOURCE_EXHAUSTED` error, the daily quota has been
used up — wait for it to reset, or enable billing on the Google AI
Studio account to remove this limit.

## Persona count (testing vs production)

In `main.py`, the `USE_TEST_PERSONAS` flag controls how many personas run:
- `True` → 3 personas (for quick testing, saves quota)
- `False` → all 15 personas (production / demo)

Make sure this is set to `False` before the final demo.

## Note: Persona count may vary between requests

The number of personas returned in the `personas` array may vary from one
request to another (ranging from 3 up to 15), depending on the stability
of the Gemini API at the time of the request. If an individual persona's
API call fails (e.g. due to a rate limit or temporary server error), it
is simply excluded from the response instead of failing the entire
request — as long as the contract's minimum of 3 personas is met, the
response is considered valid.

This is intentional, expected behavior, not a bug. Please don't be
surprised if you see a different persona count on different runs.