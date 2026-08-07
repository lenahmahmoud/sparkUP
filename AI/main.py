# main.py
# FastAPI server exposing /analyze and /health, matching API_CONTRACT.md.

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from ai_engine import run_simulation
from aggregator import build_report
from personas import BASE_PERSONAS, TEST_PERSONAS

app = FastAPI()

# Set to True while testing, to avoid burning the daily free-tier quota.
# Set to False before recording the final demo / handing off to the team.
USE_TEST_PERSONAS = False


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/analyze")
async def analyze(request: dict):
    try:
        merchant_input = request["input"]
        scraped_data = request["scrapedData"]

        personas = TEST_PERSONAS if USE_TEST_PERSONAS else BASE_PERSONAS
        successful, failed, recommendations = await run_simulation(
            merchant_input, scraped_data, personas=personas
        )

        if not successful:
            return JSONResponse(
                status_code=500,
                content={"error": "All persona agents failed to respond."}
            )

        report = build_report(successful, recommendations)
        return report

    except KeyError as e:
        return JSONResponse(
            status_code=400,
            content={"error": f"Missing required field: {e}"}
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )