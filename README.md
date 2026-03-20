# Beastlife Customer Intelligence Platform

## Architecture

```
workflow aut/
├── backend/
│   ├── main.py               # FastAPI app — all REST API endpoints
│   ├── categorizer.py        # AI classification engine (OpenAI + keyword fallback)
│   ├── requirements.txt      # Python dependencies
│   ├── .env.example          # Add your OPENAI_API_KEY here (optional)
│   └── data/
│       └── sample_queries.json   # 100 realistic Beastlife customer queries
└── frontend/
    ├── package.json
    ├── public/index.html
    └── src/
        ├── App.js                     # Main app with tab navigation
        ├── api.js                     # Axios API client
        ├── constants.js               # Colors, icons, labels
        └── components/
            ├── Header.js              # Top navigation bar
            ├── SummaryCards.js        # KPI cards (total, top issue, auto-resolve%)
            ├── DistributionCharts.js  # Pie + bar chart of issue distribution
            ├── TrendChart.js          # Weekly trend line chart
            ├── SourceBreakdown.js     # Queries by platform (Instagram/WhatsApp/etc)
            ├── AutomationOpportunities.js  # AI automation solutions per category
            ├── QueryTester.js         # Live query classifier with auto-reply
            └── QueryTable.js          # Paginated table with filters
```

---

## Quick Start

### 1. Backend (Python + FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# (Optional) Add OpenAI API key to .env
# Copy .env.example to .env and fill in OPENAI_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

Backend will be live at: http://localhost:8000  
API docs (Swagger UI): http://localhost:8000/docs

### 2. Frontend (React)

```bash
cd frontend
npm install
npm start
```

Dashboard opens at: http://localhost:3000

---

## Dashboard Features

| Tab | What it shows |
|---|---|
| **Overview** | KPI cards, Pie + Bar distribution chart, Platform breakdown |
| **Trends** | Weekly line chart + summary table across 4 weeks |
| **Automation** | Per-category AI automation suggestions with ROI estimates |
| **Live Tester** | Type any message → AI classifies → get auto-reply template |
| **All Queries** | Full searchable, filterable, paginated query table |

---

## AI Classification

Two-tier system:

1. **OpenAI GPT-4.1** (when `OPENAI_API_KEY` is set): sends message to GPT with a category list prompt
2. **Keyword AI Classifier** (always available, no API needed): rule-based engine with 100+ keywords across 7 categories and priority-weighted scoring

### Categories

| Category | Example Triggers |
|---|---|
| Order Tracking | tracking, order status, where is my order |
| Delivery Delay | late, delayed, not arrived, overdue |
| Refund Request | refund, return, money back, replacement |
| Product Issue | damaged, expired, wrong product, leaking |
| Subscription Issue | subscription, renew, plan, pause, cancel |
| Payment Failure | payment failed, deducted, double charged, UPI |
| General Product Question | ingredients, dosage, safe, FSSAI, recommend |

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/classify` | Classify a single message |
| GET | `/api/auto-reply?message=...` | Get category + auto-reply template |
| GET | `/api/stats/distribution` | % breakdown by category |
| GET | `/api/stats/by-source` | Breakdown by platform |
| GET | `/api/stats/trends` | Weekly trend data |
| GET | `/api/stats/summary` | Dashboard KPI summary |
| GET | `/api/automation-opportunities` | Automation analysis |
| GET | `/api/queries` | List queries (filterable) |
| GET | `/api/categories` | All categories with metadata |
| GET | `/docs` | Swagger API documentation |

---

## Automation Strategy

| Category | Automation | Est. Reduction |
|---|---|---|
| Order Tracking | Auto-send tracking link when order ID detected | **90%** |
| General Q | RAG FAQ chatbot over product catalog | **95%** |
| Subscription | Self-service portal (pause/cancel via app) | **85%** |
| Payment Failure | Auto-verify deduction, retry + issue confirmation | **75%** |
| Refund Request | Auto-trigger refund workflow with payment API | **70%** |
| Delivery Delay | Proactive SLA monitoring + auto-notify | **60%** |
| Product Issue | Photo-based complaint bot, auto-approve replacements | **50%** |

---

## Scaling Strategy

- Replace in-memory store with **PostgreSQL** (SQLAlchemy)
- Add **Redis** for caching stats endpoints
- Deploy backend on **AWS ECS / Railway / Render**
- Deploy frontend on **Vercel / Netlify**
- Connect to real platforms via:
  - **Instagram API** (Meta Graph API)
  - **WhatsApp Business API** (Twilio / Meta Cloud API)
  - **Email**: Gmail API / SendGrid inbound parse
- Add **vector search** (Pinecone / pgvector) for semantic FAQ matching
- Add **Grafana** or **Metabase** for production analytics
