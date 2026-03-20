"""
AI Categorization Engine for Beastlife Customer Support
Uses OpenAI GPT when API key is available, falls back to keyword-based classification.
"""

import os
import re
from typing import Optional
from datetime import datetime

CATEGORIES = {
    "Order Tracking": [
        "tracking", "track", "order status", "where is my order", "order id",
        "order number", "shipped", "shipment", "dispatch", "dispatched",
        "out for delivery", "tracking link", "tracking id", "tracking number",
        "tracking page", "tracking not", "processing", "order not found",
        "shipment not found", "tracking shows"
    ],
    "Delivery Delay": [
        "delay", "delayed", "late", "not arrived", "not received", "overdue",
        "expected delivery", "still waiting", "days ago", "not come",
        "rescheduled", "failed delivery", "delivery attempt", "delivery failed",
        "wrong address", "delivery reattempt", "delivery boy", "courier",
        "out for delivery since", "stuck at warehouse", "hasn't come"
    ],
    "Refund Request": [
        "refund", "money back", "return", "exchange", "replacement",
        "cancel", "cancelled", "reversal", "reverse", "give me back",
        "refund status", "refund pending", "refund approved",
        "refund not received", "initiate return", "want to return",
        "unopened", "return policy", "return request"
    ],
    "Product Issue": [
        "damaged", "broken", "leaking", "expired", "expiry", "near expiry",
        "smell", "smells", "color", "colour", "quality", "defective",
        "seal broken", "cap missing", "wrong product", "wrong flavour",
        "wrong variant", "different product", "batch number", "tampered",
        "product images", "looks different", "taste", "tasting different"
    ],
    "Subscription Issue": [
        "subscription", "subscribe", "renewal", "auto-renew", "auto renew",
        "plan", "monthly plan", "quarterly plan", "pause subscription",
        "cancel subscription", "upgrade subscription", "downgrade subscription",
        "subscription order", "subscription not", "subscription charged",
        "subscription date", "subscription skipped"
    ],
    "Payment Failure": [
        "payment", "payment failed", "payment pending", "payment not",
        "charged twice", "double charge", "double charged", "deducted",
        "card declined", "card not working", "upi", "gpay", "razorpay",
        "net banking", "cod", "emi", "invalid card", "payment gateway",
        "payment timeout", "session expired", "promo code", "coupon",
        "paypal", "hdfc", "transaction", "payment done", "checkout"
    ],
    "General Product Question": [
        "ingredients", "calories", "dosage", "recommended", "suitable",
        "vegetarian", "vegan", "allergen", "fssai", "certified",
        "side effects", "safe for", "shelf life", "difference between",
        "best product", "which product", "suggest", "advise", "protein for",
        "shaker", "offers", "discount", "shipping charges", "guest checkout",
        "account", "apply promo", "promo", "free", "how do i", "can i"
    ]
}

CATEGORY_PRIORITY = [
    "Payment Failure",
    "Refund Request",
    "Product Issue",
    "Subscription Issue",
    "Delivery Delay",
    "Order Tracking",
    "General Product Question"
]


def classify_with_keywords(message: str) -> str:
    """Rule-based keyword classifier as fallback."""
    text = message.lower()
    scores = {cat: 0 for cat in CATEGORIES}

    for category, keywords in CATEGORIES.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', text):
                scores[category] += 2
            elif kw in text:
                scores[category] += 1

    # Apply priority ordering for tie-breaking
    best_score = max(scores.values())
    if best_score == 0:
        return "General Product Question"

    for cat in CATEGORY_PRIORITY:
        if scores[cat] == best_score:
            return cat

    return max(scores, key=scores.get)


def classify_with_openai(message: str, api_key: str) -> Optional[str]:
    """Use OpenAI GPT to classify the customer message."""
    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)

        categories_list = "\n".join(f"- {c}" for c in CATEGORIES.keys())
        prompt = f"""You are a customer support AI for Beastlife, a fitness supplement company.
Classify the following customer message into EXACTLY ONE of these categories:
{categories_list}

Customer message: "{message}"

Respond with ONLY the category name, nothing else."""

        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=30,
            temperature=0
        )
        result = response.choices[0].message.content.strip()
        if result in CATEGORIES:
            return result
        # Fuzzy match
        for cat in CATEGORIES:
            if cat.lower() in result.lower():
                return cat
        return None
    except Exception:
        return None


def classify_query(message: str, api_key: Optional[str] = None) -> dict:
    """
    Classify a customer message.
    Returns dict with category, method used, and confidence.
    """
    openai_key = api_key or os.getenv("OPENAI_API_KEY")

    method = "keyword"
    category = None

    if openai_key:
        category = classify_with_openai(message, openai_key)
        if category:
            method = "openai_gpt"

    if not category:
        category = classify_with_keywords(message)
        method = "keyword"

    return {
        "category": category,
        "method": method,
        "timestamp": datetime.utcnow().isoformat()
    }


def classify_batch(queries: list, api_key: Optional[str] = None) -> list:
    """Classify a batch of query dicts, each with at minimum a 'message' field."""
    results = []
    for q in queries:
        result = classify_query(q.get("message", ""), api_key)
        results.append({**q, **result})
    return results
