# aggregator.py
# Combines individual persona reactions into the aggregate fields
# required by the API contract: emotionalBreakdown and segments.

WINNING_THRESHOLD = 60   # satisfaction >= this -> considered a "winning" segment
REJECTED_THRESHOLD = 40  # satisfaction < this -> considered a "rejected" segment


def compute_emotional_breakdown(successful_personas):
    """
    Averages confusion/boredom/satisfaction across all personas, then
    normalizes the three numbers so they sum to approximately 100,
    as required by the contract.
    """
    if not successful_personas:
        return {"confusion": 0, "boredom": 0, "satisfaction": 0}

    count = len(successful_personas)
    total_confusion = sum(p["reaction"]["confusion"] for p in successful_personas)
    total_boredom = sum(p["reaction"]["boredom"] for p in successful_personas)
    total_satisfaction = sum(p["reaction"]["satisfaction"] for p in successful_personas)

    avg_confusion = total_confusion / count
    avg_boredom = total_boredom / count
    avg_satisfaction = total_satisfaction / count

    total = avg_confusion + avg_boredom + avg_satisfaction
    if total == 0:
        return {"confusion": 0, "boredom": 0, "satisfaction": 0}

    return {
        "confusion": round(avg_confusion / total * 100),
        "boredom": round(avg_boredom / total * 100),
        "satisfaction": round(avg_satisfaction / total * 100)
    }


def compute_segments(successful_personas):
    """
    Splits personas into 'winning' (high satisfaction) and 'rejected'
    (low satisfaction) segments based on simple thresholds.
    """
    winning = [
        p["name"] for p in successful_personas
        if p["reaction"]["satisfaction"] >= WINNING_THRESHOLD
    ]
    rejected = [
        p["name"] for p in successful_personas
        if p["reaction"]["satisfaction"] < REJECTED_THRESHOLD
    ]
    return {"winning": winning, "rejected": rejected}


def build_report(successful_personas, recommendations):
    """
    Assembles the final response body matching the API contract exactly.
    """
    return {
        "personas": [
            {
                "name": p["name"],
                "type": p["type"],
                "description": p["description"],
                "reaction": p["reaction"]
            }
            for p in successful_personas
        ],
        "emotionalBreakdown": compute_emotional_breakdown(successful_personas),
        "segments": compute_segments(successful_personas),
        "recommendations": recommendations
    }