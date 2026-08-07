# ai_engine.py
# Core execution engine: runs persona agents concurrently against Gemini.

import os
import json
import asyncio
from dotenv import load_dotenv
from google import genai
from google.genai import errors
from personas import BASE_PERSONAS
from prompts import build_single_persona_prompt, build_recommendations_prompt

load_dotenv()

API_KEY = os.environ.get("GEMINI_API_KEY")
if not API_KEY:
    raise ValueError("GEMINI_API_KEY is not set. Please add it to your .env file")

client = genai.Client(api_key=API_KEY)

MAX_CONCURRENT_REQUESTS = 4
semaphore = asyncio.Semaphore(MAX_CONCURRENT_REQUESTS)

MAX_RETRIES = 3
BASE_RETRY_DELAY = 10  # seconds

REACTION_SCHEMA = {
    "type": "object",
    "properties": {
        "confusion": {"type": "integer"},
        "boredom": {"type": "integer"},
        "satisfaction": {"type": "integer"},
        "notes": {"type": "string"}
    },
    "required": ["confusion", "boredom", "satisfaction", "notes"]
}

RECOMMENDATIONS_SCHEMA = {
    "type": "object",
    "properties": {
        "recommendations": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "issue": {"type": "string"},
                    "suggestion": {"type": "string"},
                    "priority": {"type": "string"}
                },
                "required": ["issue", "suggestion", "priority"]
            }
        }
    },
    "required": ["recommendations"]
}


async def call_gemini_with_retry(prompt, schema):
    """
    Calls Gemini with a concurrency limit and automatic retry on
    rate-limit (429) or temporary overload (503) errors.
    """
    async with semaphore:
        for attempt in range(1, MAX_RETRIES + 1):
            try:
                response = await asyncio.to_thread(
                    client.models.generate_content,
                    model='gemini-3.5-flash',
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': schema
                    }
                )
                return response.text
            except errors.APIError as e:
                is_retryable = getattr(e, "code", None) in (429, 503)
                if is_retryable and attempt < MAX_RETRIES:
                    wait_time = BASE_RETRY_DELAY * attempt
                    print(f"Retryable error. Retrying in {wait_time}s (attempt {attempt}/{MAX_RETRIES})...")
                    await asyncio.sleep(wait_time)
                else:
                    raise


async def run_single_persona(persona, merchant_input, scraped_data):
    """
    Runs a single persona agent. Returns a dict matching the contract's
    persona shape, or a 'failed' marker if it could not complete.
    """
    prompt = build_single_persona_prompt(merchant_input, scraped_data, persona)
    try:
        raw_text = await call_gemini_with_retry(prompt, REACTION_SCHEMA)
        reaction = json.loads(raw_text)
        return {
            "name": persona["name"],
            "type": persona["type"],
            "description": persona["psychological_archetype"],
            "reaction": reaction,
            "status": "success"
        }
    except Exception as e:
        return {
            "name": persona["name"],
            "type": persona["type"],
            "status": "failed",
            "error": str(e)
        }


async def generate_recommendations(merchant_input, successful_personas):
    """
    Makes one additional Gemini call that synthesizes all persona reactions
    into a short list of merchant recommendations.
    """
    prompt = build_recommendations_prompt(merchant_input, successful_personas)
    raw_text = await call_gemini_with_retry(prompt, RECOMMENDATIONS_SCHEMA)
    return json.loads(raw_text)["recommendations"]


async def run_simulation(merchant_input, scraped_data, personas=None):
    """
    Runs all given personas concurrently, then generates recommendations
    from the successful results. Returns (successful, failed, recommendations).
    """
    personas_to_run = personas if personas is not None else BASE_PERSONAS

    tasks = [
        run_single_persona(persona, merchant_input, scraped_data)
        for persona in personas_to_run
    ]
    results = await asyncio.gather(*tasks)

    successful = [r for r in results if r["status"] == "success"]
    failed = [r for r in results if r["status"] == "failed"]

    if not successful:
        # Nothing to synthesize recommendations from
        return successful, failed, []

    recommendations = await generate_recommendations(merchant_input, successful)
    return successful, failed, recommendations