"""
Beastlife Customer Intelligence — FastAPI Backend
"""

import json
import os
import uuid
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from categorizer import classify_query, classify_batch, CATEGORIES

# ─── App Setup ────────────────────────────────────────────────────────────────

app = FastAPI(
    title="Beastlife Customer Intelligence API",
    description="AI-powered customer query categorization and analytics",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── In-memory store (replace with a database in production) ──────────────────

QUERIES_DB: List[dict] = []

DATA_FILE = os.path.join(os.path.dirname(__file__), "data", "sample_queries.json")


def load_and_classify_sample_data():
    """Load sample queries and classify them on startup."""
    global QUERIES_DB
    if not os.path.exists(DATA_FILE):
        return
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        raw = json.load(f)

    classified = classify_batch(raw, api_key=os.getenv("OPENAI_API_KEY"))
    for item in classified:
        item["id"] = str(item.get("id", uuid.uuid4()))
    QUERIES_DB = classified
    print(f"[Startup] Loaded and classified {len(QUERIES_DB)} sample queries.")


@app.on_event("startup")
async def startup_event():
    load_and_classify_sample_data()


# ─── Pydantic Models ──────────────────────────────────────────────────────────

class QueryIn(BaseModel):
    message: str
    source: Optional[str] = "website_chat"


class QueryOut(BaseModel):
    id: str
    message: str
    source: str
    category: str
    method: str
    timestamp: str


class AutoReplyOut(BaseModel):
    category: str
    auto_reply: str
    escalate: bool


# ─── Auto-reply Templates ─────────────────────────────────────────────────────

AUTO_REPLIES = {
    "Order Tracking": {
        "reply": (
            "Hi! Thank you for reaching out to Beastlife. 🏋️\n\n"
            "To track your order, please visit: https://beastlife.in/track-order and enter your Order ID.\n"
            "You can also find the tracking link in your order confirmation email or SMS.\n\n"
            "If tracking isn't updating for more than 48 hours, please reply with your Order ID and we'll escalate it immediately."
        ),
        "escalate": False
    },
    "Delivery Delay": {
        "reply": (
            "Hi! We're sorry to hear your order hasn't arrived yet. 😟\n\n"
            "Delivery delays can occasionally happen due to logistics issues. "
            "Our team is actively monitoring all delayed shipments.\n\n"
            "Please share your Order ID and we'll immediately check the status and get back to you within 2 hours."
        ),
        "escalate": True
    },
    "Refund Request": {
        "reply": (
            "Hi! We've received your refund request. 💚\n\n"
            "Our refund policy: Approved refunds are processed within 5-7 business days to your original payment method.\n\n"
            "To initiate or check your refund status, please share:\n"
            "1. Order ID\n2. Reason for refund\n3. Your registered email\n\n"
            "A support agent will review and process your request within 24 hours."
        ),
        "escalate": True
    },
    "Product Issue": {
        "reply": (
            "Hi! We're really sorry to hear about the product issue! 😔\n\n"
            "Beastlife has strict quality standards and this is not acceptable. "
            "We want to make this right for you immediately.\n\n"
            "Please share:\n"
            "1. Photos/video of the issue\n2. Order ID\n3. Batch number (on the packaging)\n\n"
            "We'll arrange a replacement or full refund within 24 hours."
        ),
        "escalate": True
    },
    "Subscription Issue": {
        "reply": (
            "Hi! Thank you for being a Beastlife subscriber! 🌟\n\n"
            "You can manage your subscription anytime from the Beastlife app:\n"
            "App → Profile → Subscription → Manage Plan\n\n"
            "Options available: Pause, Cancel, Upgrade, or Change delivery date.\n\n"
            "If you're facing a billing issue or unexpected charge, please reply with your account email and we'll sort it out right away."
        ),
        "escalate": False
    },
    "Payment Failure": {
        "reply": (
            "Hi! We're sorry you're facing a payment issue. 💳\n\n"
            "Common fixes:\n"
            "• Try a different payment method (UPI, Net Banking, Card)\n"
            "• Clear browser cache and retry\n"
            "• Ensure your bank hasn't blocked the transaction\n\n"
            "If money was deducted but order not placed, please share your Transaction ID / UTR number "
            "and we'll verify and confirm your order or refund within 24 hours."
        ),
        "escalate": True
    },
    "General Product Question": {
        "reply": (
            "Hi! Thanks for reaching out to Beastlife! 💪\n\n"
            "You can find detailed product information, ingredients, certifications, and usage guides on our website: "
            "https://beastlife.in/products\n\n"
            "For personalized supplement advice, our expert team is available:\n"
            "📞 Mon–Sat: 10 AM – 7 PM\n"
            "📧 support@beastlife.in\n\n"
            "Is there anything specific you'd like to know? We're happy to help!"
        ),
        "escalate": False
    }
}

# ─── Endpoints ────────────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {"status": "ok", "service": "Beastlife Customer Intelligence API", "version": "1.0.0"}


@app.post("/api/classify", response_model=QueryOut)
def classify_single_query(payload: QueryIn):
    """
    Submit a single customer query for AI classification.
    Returns the classified category and an auto-reply suggestion.
    """
    result = classify_query(payload.message, api_key=os.getenv("OPENAI_API_KEY"))
    record = {
        "id": str(uuid.uuid4()),
        "message": payload.message,
        "source": payload.source,
        "category": result["category"],
        "method": result["method"],
        "timestamp": result["timestamp"]
    }
    QUERIES_DB.append(record)
    return record


@app.get("/api/auto-reply")
def get_auto_reply(message: str = Query(..., description="Customer message text")):
    """
    Get the AI-classified category + an automated reply for a customer message.
    """
    result = classify_query(message, api_key=os.getenv("OPENAI_API_KEY"))
    category = result["category"]
    ar = AUTO_REPLIES.get(category, AUTO_REPLIES["General Product Question"])
    return AutoReplyOut(
        category=category,
        auto_reply=ar["reply"],
        escalate=ar["escalate"]
    )


@app.get("/api/queries")
def list_queries(
    source: Optional[str] = None,
    category: Optional[str] = None,
    limit: int = Query(100, le=500)
):
    """List classified queries with optional filters."""
    data = QUERIES_DB
    if source:
        data = [q for q in data if q.get("source") == source]
    if category:
        data = [q for q in data if q.get("category") == category]
    return {"total": len(data), "queries": data[:limit]}


@app.get("/api/stats/distribution")
def category_distribution():
    """
    Returns % distribution of queries by category.
    """
    if not QUERIES_DB:
        return {"total": 0, "distribution": []}

    counts = Counter(q["category"] for q in QUERIES_DB)
    total = len(QUERIES_DB)
    distribution = [
        {
            "category": cat,
            "count": counts.get(cat, 0),
            "percentage": round(counts.get(cat, 0) / total * 100, 1)
        }
        for cat in CATEGORIES.keys()
    ]
    distribution.sort(key=lambda x: x["count"], reverse=True)
    return {
        "total_queries": total,
        "distribution": distribution
    }


@app.get("/api/stats/by-source")
def distribution_by_source():
    """Returns query count broken down by source platform."""
    source_cat: dict = defaultdict(lambda: Counter())
    for q in QUERIES_DB:
        source_cat[q.get("source", "unknown")][q.get("category", "Unknown")] += 1

    result = []
    for source, cats in source_cat.items():
        result.append({
            "source": source,
            "total": sum(cats.values()),
            "categories": dict(cats)
        })
    result.sort(key=lambda x: x["total"], reverse=True)
    return {"sources": result}


@app.get("/api/stats/trends")
def weekly_trends():
    """
    Returns weekly query volume grouped by category over the last 4 weeks.
    """
    now = datetime.utcnow()
    weeks = {}
    for i in range(4):
        start = now - timedelta(weeks=i + 1)
        end = now - timedelta(weeks=i)
        label = f"Week of {start.strftime('%b %d')}"
        weeks[label] = {"week": label, "start": start.isoformat(), "end": end.isoformat(), "counts": Counter()}

    for q in QUERIES_DB:
        try:
            ts = datetime.fromisoformat(q["timestamp"].replace("Z", ""))
        except Exception:
            continue
        for label, w in weeks.items():
            ws = datetime.fromisoformat(w["start"])
            we = datetime.fromisoformat(w["end"])
            if ws <= ts < we:
                weeks[label]["counts"][q["category"]] += 1
                break

    result = []
    for label, w in sorted(weeks.items(), key=lambda x: x[1]["start"]):
        entry = {"week": w["week"]}
        for cat in CATEGORIES.keys():
            entry[cat] = w["counts"].get(cat, 0)
        entry["total"] = sum(w["counts"].values())
        result.append(entry)

    return {"weeks": result}


@app.get("/api/stats/summary")
def dashboard_summary():
    """Top-level summary metrics for the dashboard header."""
    total = len(QUERIES_DB)
    if total == 0:
        return {"total_queries": 0, "top_issue": None, "escalation_rate": 0, "auto_resolvable_rate": 0}

    counts = Counter(q["category"] for q in QUERIES_DB)
    top_issue = counts.most_common(1)[0][0] if counts else None

    escalate_cats = {"Delivery Delay", "Refund Request", "Product Issue", "Payment Failure"}
    escalation_count = sum(1 for q in QUERIES_DB if q.get("category") in escalate_cats)

    source_counts = Counter(q.get("source", "unknown") for q in QUERIES_DB)

    return {
        "total_queries": total,
        "top_issue": top_issue,
        "top_issue_count": counts.get(top_issue, 0),
        "escalation_rate": round(escalation_count / total * 100, 1),
        "auto_resolvable_rate": round((total - escalation_count) / total * 100, 1),
        "source_breakdown": dict(source_counts),
        "categories_count": len(CATEGORIES)
    }


@app.get("/api/categories")
def list_categories():
    """Returns all supported categories with their keyword hints and automation info."""
    info = []
    for cat, keywords in CATEGORIES.items():
        ar = AUTO_REPLIES.get(cat, {})
        info.append({
            "category": cat,
            "sample_keywords": keywords[:5],
            "auto_reply_available": True,
            "requires_escalation": ar.get("escalate", False)
        })
    return {"categories": info}


@app.get("/api/automation-opportunities")
def automation_opportunities():
    """
    Returns automation opportunity analysis for each category.
    """
    if not QUERIES_DB:
        return {"opportunities": []}

    counts = Counter(q["category"] for q in QUERIES_DB)
    total = len(QUERIES_DB)

    opportunities = {
        "Order Tracking": {
            "automation_type": "Self-service tracking bot",
            "solution": "Auto-send tracking link when order ID is detected. Integrate with logistics API (Delhivery, Shiprocket) to pull real-time status.",
            "estimated_reduction": 90,
            "priority": "High"
        },
        "Delivery Delay": {
            "automation_type": "Proactive delay alert + escalation bot",
            "solution": "Monitor shipment SLAs. Auto-notify customers before they complain. Auto-escalate to logistics team when delay exceeds 2 days.",
            "estimated_reduction": 60,
            "priority": "High"
        },
        "Refund Request": {
            "automation_type": "Automated refund initiation",
            "solution": "Auto-trigger refund workflow on detection. Integrate with payment gateway for direct refund API calls. Auto-send status updates.",
            "estimated_reduction": 70,
            "priority": "High"
        },
        "Product Issue": {
            "automation_type": "Image-based complaint bot",
            "solution": "Auto-collect photos via chat. AI quality assessment. Auto-approve replacement for clear damage cases. Escalate edge cases.",
            "estimated_reduction": 50,
            "priority": "Medium"
        },
        "Subscription Issue": {
            "automation_type": "Self-service subscription portal",
            "solution": "Allow pause/cancel/upgrade via app/WhatsApp commands. Send renewal reminders 5 days in advance. Auto-fix billing date issues.",
            "estimated_reduction": 85,
            "priority": "Medium"
        },
        "Payment Failure": {
            "automation_type": "Payment recovery bot",
            "solution": "Auto-detect payment failures and retry with alternate methods. Verify deducted amount against payment gateway. Auto-issue confirmation or refund.",
            "estimated_reduction": 75,
            "priority": "High"
        },
        "General Product Question": {
            "automation_type": "AI FAQ chatbot",
            "solution": "RAG-based chatbot over product catalog, FAQs, and certificates. Covers ingredients, dosage, allergens, shipping info, and pricing 24/7.",
            "estimated_reduction": 95,
            "priority": "Medium"
        }
    }

    result = []
    for cat, opp in opportunities.items():
        count = counts.get(cat, 0)
        pct = round(count / total * 100, 1) if total else 0
        result.append({
            "category": cat,
            "current_volume_pct": pct,
            "current_count": count,
            **opp
        })

    result.sort(key=lambda x: x["current_count"], reverse=True)
    return {"total_queries": total, "opportunities": result}
