# prompts.py
# Prompt template for the SparkUp Multi-Agent Focus Group Engine.

def build_single_persona_prompt(merchant_input, scraped_data, persona):
    """
    Builds an English-only prompt for ONE persona, matching the AI Customer
    Psychology Simulator contract (confusion/boredom/satisfaction reaction).
    """
    prompt = f"""
You are simulating ONE specific customer persona reacting to an e-commerce store.

--- YOUR PERSONA ---
Name: {persona['name']}
Psychological Archetype: {persona['psychological_archetype']}
Behavioral Traits: {persona['behavioral_traits']}

--- MERCHANT-PROVIDED STORE DETAILS ---
- Brand Name: {merchant_input.get('brandName', 'N/A')}
- Website URL: {merchant_input.get('websiteUrl', 'N/A')}
- Description: {merchant_input.get('description', 'N/A')}
- Product Category: {merchant_input.get('productCategory', 'General')}
- Key Selling Points: {merchant_input.get('keySellingPoints', 'None specified')}
- Known Weak Point: {merchant_input.get('weakPoint', 'Not disclosed')}
- Target Age Group: {merchant_input.get('targetAgeGroup', 'All ages')}
- Target Audience: {merchant_input.get('targetAudience', 'General consumers')}
- Economic Class: {merchant_input.get('economicClass', 'Not specified')}
- Region: {merchant_input.get('region', 'Not specified')}

--- SCRAPED WEBSITE DATA ---
- Page Title: {scraped_data.get('pageTitle', 'N/A')}
- Meta Description: {scraped_data.get('metaDescription', 'N/A')}
- Hero Headline: {scraped_data.get('heroHeadline', 'N/A')}
- Hero Subtext: {scraped_data.get('heroSubtext', 'N/A')}
- Navigation Links: {scraped_data.get('navLinks', [])}
- Prices Found on Page: {scraped_data.get('pricesFound', [])}
- Call-to-Action Buttons: {scraped_data.get('ctaButtons', [])}
- Trust Signals Found: {scraped_data.get('trustSignals', [])}
- Image Count: {scraped_data.get('imageCount', 0)}

--- YOUR TASK ---
React to this store EXACTLY as your persona would, based on all the details above.
Rate your emotional reaction on three independent 0-100 scales:
- confusion: how unclear or confusing the store feels to you
- boredom: how uninteresting or unengaging the store feels to you
- satisfaction: how satisfied and willing to buy you feel

Then explain your reasoning in one short paragraph (in English), in your persona's voice.

--- OUTPUT FORMAT (JSON only, no extra text) ---
{{
  "confusion": 10,
  "boredom": 15,
  "satisfaction": 80,
  "notes": "Your reasoning in English, written in your persona's voice"
}}
"""
    return prompt


def build_recommendations_prompt(merchant_input, persona_results):
    """
    Builds a prompt that synthesizes all persona reactions into a short list
    of actionable merchant recommendations, matching the contract's
    'recommendations' field (issue / suggestion / priority).
    """
    notes_summary = "\n".join(
        f"- {p['name']} ({p['type']}): confusion={p['reaction']['confusion']}, "
        f"boredom={p['reaction']['boredom']}, satisfaction={p['reaction']['satisfaction']}. "
        f"Notes: {p['reaction']['notes']}"
        for p in persona_results
    )

    prompt = f"""
You are a senior e-commerce conversion consultant. Below are reactions from
several simulated customer personas who evaluated an online store.

--- STORE ---
Brand: {merchant_input.get('brandName', 'N/A')}
Description: {merchant_input.get('description', 'N/A')}

--- PERSONA REACTIONS ---
{notes_summary}

--- YOUR TASK ---
Based on the recurring issues across these personas, produce 3 to 5 concrete,
actionable recommendations for the merchant, sorted by business impact.

--- OUTPUT FORMAT (JSON only, no extra text) ---
{{
  "recommendations": [
    {{
      "issue": "Short description of the problem found",
      "suggestion": "Concrete fix for the merchant",
      "priority": "high"
    }}
  ]
}}

Note: "priority" must be exactly one of: "high", "medium", "low".
"""
    return prompt