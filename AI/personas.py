# personas.py
# Base customer persona archetypes for the SparkUp AI Engine.

BASE_PERSONAS = [
    {
        "id": "persona_01",
        "name": "Omar (The Skeptical Bargain Hunter)",
        "type": "price_sensitive_skeptic",
        "psychological_archetype": "Price-sensitive & Highly Skeptical",
        "behavioral_traits": "Fears hidden fees and online scams. Always looks for refund policies, shipping costs, and active promo codes before committing."
    },
    {
        "id": "persona_02",
        "name": "Sarah (The Impulsive Convenience Seeker)",
        "type": "ideal_buyer",
        "psychological_archetype": "Fast Decision Maker & Convenience Focused",
        "behavioral_traits": "Buys quickly if the page looks modern and sleek. Will instantly abandon purchase if the checkout process requires too many steps."
    },
    {
        "id": "persona_03",
        "name": "Nour (The Social Proof Analyst)",
        "type": "low_intent_skeptical",
        "psychological_archetype": "Review-dependent & Risk Averse",
        "behavioral_traits": "Never buys a product without checking user reviews, star ratings, and photo testimonials. Highly distrustful of claims without proof."
    },
    {
        "id": "persona_04",
        "name": "Karim (The Cash-on-Delivery Loyalist)",
        "type": "low_intent_skeptical",
        "psychological_archetype": "Traditional & Payment Conservative",
        "behavioral_traits": "Prefers offline payment or COD. Hesitant to enter credit card details on new or unfamiliar e-commerce platforms."
    },
    {
        "id": "persona_05",
        "name": "Mariam (The Premium Brand Enthusiast)",
        "type": "low_intent_skeptical",
        "psychological_archetype": "Status-driven & Quality Focused",
        "behavioral_traits": "Price is not a bottleneck. Cares heavily about visual aesthetics, brand storytelling, premium packaging, and high quality."
    },
    {
        "id": "persona_06",
        "name": "Mahmoud (The Analytical Spec Reader)",
        "type": "distracted_browser",
        "psychological_archetype": "Detail-Oriented & Methodical",
        "behavioral_traits": "Reads every single line of product specifications, dimensions, and materials. Spots inconsistencies easily."
    },
    {
        "id": "persona_07",
        "name": "Ziad (The Gen-Z Visual Shopper)",
        "type": "distracted_browser",
        "psychological_archetype": "Short Attention Span & Media Driven",
        "behavioral_traits": "Ignores long blocks of text. Expects high-resolution images, short videos, and dynamic visuals to understand the value."
    },
    {
        "id": "persona_08",
        "name": "Heba (The Urgency & FOMO Buyer)",
        "type": "ideal_buyer",
        "psychological_archetype": "Emotionally Driven by Scarcity",
        "behavioral_traits": "Responds strongly to limited-time offers, countdown timers, and low-stock alerts. Fears missing out on great deals."
    },
    {
        "id": "persona_09",
        "name": "Farida (The Customer Support Reliant)",
        "type": "distracted_browser",
        "psychological_archetype": "Reassurance Seeking",
        "behavioral_traits": "Wants instant access to live chat or WhatsApp support to ask questions before purchasing. Needs human confirmation."
    },
    {
        "id": "persona_10",
        "name": "Tarek (The Value-for-Money Evaluator)",
        "type": "ideal_buyer",
        "psychological_archetype": "Rational & Pragmatic",
        "behavioral_traits": "Willing to spend more money, but only if the durability and value proposition clearly justify the expense."
    },
    {
        "id": "persona_11",
        "name": "Yasmine (The Gift Hunter)",
        "type": "low_intent_skeptical",
        "psychological_archetype": "Time-sensitive & Delivery Focused",
        "behavioral_traits": "Shopping for someone else. Focuses on guaranteed delivery dates, gift-wrapping options, and hassle-free exchange policies."
    },
    {
        "id": "persona_12",
        "name": "Rania (The Social Media Trend Follower)",
        "type": "distracted_browser",
        "psychological_archetype": "Influenced by Social Validation",
        "behavioral_traits": "Discovers products through Instagram/TikTok. Checks if the brand has an active social media presence with authentic engagement."
    },
    {
        "id": "persona_13",
        "name": "Khaled (The Hesitant First-Time Shopper)",
        "type": "low_intent_skeptical",
        "psychological_archetype": "High Friction & Anxiety Prone",
        "behavioral_traits": "Double-checks everything twice. Easily overwhelmed by cluttered layouts or ambiguous policy terms."
    },
    {
        "id": "persona_14",
        "name": "Mostafa (The Early Adopter / Risk Taker)",
        "type": "ideal_buyer",
        "psychological_archetype": "Curious & Novelty Seeking",
        "behavioral_traits": "Loves testing new products and unique store concepts. Willing to overlook minor flaws for an innovative experience."
    },
    {
        "id": "persona_15",
        "name": "Dalia (The Minimalist Practical Shopper)",
        "type": "ideal_buyer",
        "psychological_archetype": "No-Nonsense & Efficiency Driven",
        "behavioral_traits": "Wants clear pricing, straightforward shipping info, and zero upselling pop-ups. Gets annoyed by pushy sales tactics."
    }
]

# A smaller subset used for testing, to save the free-tier daily quota.
# The contract requires a minimum of 3 personas, so this default set
# satisfies that while keeping quota usage low during development.
TEST_PERSONAS = BASE_PERSONAS[:3]