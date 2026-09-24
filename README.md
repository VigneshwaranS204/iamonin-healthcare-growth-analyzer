# IAMONIN Healthcare Growth Analyzer

> **Production-Ready Internal Prospecting & Digital Audit Platform for IAMONIN Healthcare Sales & Growth Teams**

The **IAMONIN Healthcare Growth Analyzer** is an automated, self-contained audit and intelligence platform built specifically for healthcare enterprise sales teams. It crawls and analyzes public hospital websites without relying on third-party SEO or AI APIs, extracts measurable clinical and conversion signals, evaluates 26 deterministic technical/SEO rules, computes an 8-dimension explainable growth score, and generates customized hospital audit reports and sales outreach messages grounded strictly in observable evidence.

---

## 🚀 Key Features

- **100% Self-Contained Engine (Zero External APIs)**:
  - Custom Breadth-First-Search (BFS) crawler with Cheerio DOM extraction.
  - No dependency on OpenAI, Gemini, Claude, Semrush, Ahrefs, DataForSEO, Google Maps, or Google PageSpeed APIs.
- **SSRF & Security Shield**:
  - Full DNS resolution & IP validation protecting against loopback (`127.0.0.0/8`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.0.0/16`), cloud metadata endpoints (`169.254.169.254`, `metadata.google.internal`), and IPv6 equivalents.
- **Robots.txt & XML Sitemap Engine**:
  - Direct `/robots.txt` directive parsing (`User-agent`, `Disallow`, `Allow`, `Crawl-delay`, `Sitemap`).
  - Recursive XML sitemap index parser with URL discovery.
- **26 Technical & On-Page SEO Checks**:
  - HTTPS enforcement, HTTP-to-HTTPS redirect, title/meta coverage, H1 semantic hierarchy, canonical tag integrity, broken page detection (4xx/5xx), image alt text coverage, thin content detection (<300 words), orphan-like page discovery, click depth tracking, Schema.org validation, Open Graph tags, and mobile viewport detection.
- **Healthcare-Specific Intelligence**:
  - 25+ medical super-specialty and broad specialty taxonomy detection.
  - 24/7 Emergency & casualty presence, preventive health packages, cashless insurance/TPA desk, patient testimonials, and international patient desk.
- **Doctor Authority Analyzer**:
  - Physician profile detection, medical qualification recognition (MBBS, MD, MS, DM, MCh, FRCS, DNB, etc.), individual URL slug analysis, Schema.org Physician JSON-LD verification, and direct OPD booking CTA presence.
- **6-Stage Patient Journey & Conversion Readiness**:
  - Maps `DISCOVER → TRUST → SPECIALTY → DOCTOR → ENQUIRY → APPOINTMENT`.
  - Analyzes CTA density (1-Click WhatsApp desk, telephone click-to-call, booking forms, and page dead-ends).
- **8-Dimension Explainable Scoring Engine (0–100)**:
  1. Technical Health
  2. SEO Readiness
  3. Healthcare Content
  4. Doctor Authority
  5. Patient Journey
  6. Conversion Readiness
  7. Local Presence Signals
  8. Content Depth
- **IAMONIN Healthcare Growth Module Alignment**:
  - Categorizes opportunities into the 6 IAMONIN Growth Modules:
    - `01 Digital Foundation`
    - `02 Doctor Authority`
    - `03 Patient Acquisition`
    - `04 Appointment Conversion`
    - `05 AI Follow-up` *(Discovery Required)*
    - `06 Growth Intelligence` *(Discovery Required)*
- **Personalized Sales Outreach Generator**:
  - Multi-channel sales copy (Email, LinkedIn Message, WhatsApp Message, Phone Call Opening Script) generated strictly from detected evidence with zero fabricated claims.
- **12-Section Audit Report & Multi-Format Exports**:
  - Interactive web report preview.
  - High-fidelity branded server-side PDF export with `#fc4d01` IAMONIN signature styling.
  - Full structured CSV and JSON exports.
- **Competitor Website Gap Analysis**:
  - Side-by-side gap comparison against up to 3 competitor hospitals.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Vite |
| **Backend** | Node.js (v20+), Express.js, TypeScript |
| **Database & ORM** | PostgreSQL / SQLite (Dual-Ready), Prisma ORM |
| **Crawler & Parser**| Cheerio DOM Engine, Axios, Custom BFS Queue, SSRF Guard |
| **PDF Generation** | PDFKit (Pure Node.js vector and tabular PDF generator) |
| **Testing** | Vitest (100% test pass on all engines) |
| **Deployment** | Docker, Docker Compose, Multi-stage builds |

---

## 📁 Project Architecture

```
tool for healthcare/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma              # SQLite (Local Dev) / PostgreSQL ready
│   │   ├── schema.postgresql.prisma   # PostgreSQL Docker schema
│   │   └── seed.ts                    # Seed script with demo hospital & dictionaries
│   ├── src/
│   │   ├── config/                    # Env & 25+ healthcare specialty dictionaries
│   │   ├── middleware/                # JWT Auth, Error handling, Rate limiting
│   │   ├── services/
│   │   │   ├── crawler/               # SSRF guard, normalizer, robots, sitemap, page crawler
│   │   │   ├── analyzer/              # 26 SEO rules, healthcare, doctor, journey, local, keywords
│   │   │   ├── scoring/               # 8-dimension mathematical scoring engine
│   │   │   ├── opportunity/           # IAMONIN module opportunity mapper
│   │   │   ├── outreach/              # Evidence-grounded outreach generator
│   │   │   ├── report/                # 12-section report builder & branded PDF service
│   │   │   ├── competitor/            # Side-by-side competitor gap analyzer
│   │   │   └── export/                # CSV & JSON formatting services
│   │   ├── controllers/               # API endpoints
│   │   ├── routes/                    # Express router
│   │   └── server.ts                  # Server entrypoint
│   └── tests/                         # Vitest unit & integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/                # Navbar & Footer
│   │   │   ├── dashboard/             # StatCards, RecentAuditsTable, QuickAuditForm
│   │   │   ├── audit/                 # NewAuditModal, LiveCrawlProgressModal, ScoreCardsGrid
│   │   │   │   └── tabs/              # 10 detail tabs (Overview, SEO, Doctors, Journey, etc.)
│   │   │   ├── outreach/              # OutreachModal (Email, LinkedIn, WA, Call Script)
│   │   │   └── settings/              # Healthcare dictionaries & crawl limits
│   │   ├── contexts/                  # AuthContext
│   │   ├── services/                  # Axios API client
│   │   ├── App.tsx                    # Main single-page application
│   │   └── main.tsx
│   └── tailwind.config.js             # IAMONIN brand theme (#fc4d01 primary)
├── docker-compose.yml                 # Production PostgreSQL + Node app container
├── Dockerfile                         # Multi-stage production container build
└── README.md
```

---

## ⚡ Quickstart Guide

### Prerequisites
- Node.js (v18 or v20+)
- npm (v9+)

### 1. Local Development (Zero Configuration SQLite)

```bash
# Clone the repository
git clone <repo-url>
cd "tool for healthcare"

# Install backend & frontend dependencies
npm --prefix backend install
npm --prefix frontend install

# Initialize database schema & seed initial data
npm --prefix backend run prisma:generate
npm --prefix backend run db:push
npm --prefix backend run db:seed

# Start backend server (Port 5000)
npm run dev:backend

# In a separate terminal, start frontend (Port 5173)
npm run dev:frontend
```

Open your browser at **`http://localhost:5173`** to access the IAMONIN Healthcare Growth Analyzer.

---

### 2. Docker Deployment (Production PostgreSQL)

```bash
# Build and run containers
docker-compose up --build -d

# Check running services
docker-compose ps
```

The application will be accessible at **`http://localhost:5000`**.

---

## 🔐 Seed User Credentials

The database seed includes pre-configured sales and admin accounts:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Sales Consultant** | `sales@iamonin.com` | `Sales@123` |
| **Growth Admin** | `admin@iamonin.com` | `Admin@123` |

---

## 🧪 Running Automated Tests

The test suite covers SSRF protection, URL normalization, technical SEO checks, healthcare extraction, scoring algorithms, and outreach grounding:

```bash
npm --prefix backend test
```

---

## 📡 Core API Endpoints

### Audits & Crawler
- `POST /api/audits/start`: Initiates a new hospital crawl and analysis pipeline.
- `GET /api/audits/:id`: Retrieves full audit dataset including findings, doctors, and opportunities.
- `GET /api/audits/:id/progress`: Real-time Server-Sent Events (SSE) live crawl status stream.
- `POST /api/audits/:id/reanalyze`: Triggers a full re-crawl of an existing hospital record.
- `DELETE /api/audits/:id`: Deletes an audit and associated findings.

### Reports & Exports
- `GET /api/audits/:id/report`: Returns structured 12-section audit report data.
- `GET /api/audits/:id/pdf`: Downloads the branded client-ready PDF document.
- `GET /api/audits/:id/export/csv`: Exports findings and opportunities to CSV.
- `GET /api/audits/:id/export/json`: Exports the complete audit tree to JSON.

### Sales Outreach
- `GET /api/audits/:auditId/outreaches`: Retrieves generated Email, LinkedIn, WhatsApp, and Call scripts.
- `POST /api/audits/:auditId/outreaches/regenerate`: Personalizes outreach copy for a specific recipient.

### Competitors & Settings
- `POST /api/competitors/analyze`: Crawls a competitor hospital and computes side-by-side gap metrics.
- `GET /api/settings`: Retrieves crawler bounds and healthcare dictionaries.
- `POST /api/settings/dictionary`: Adds custom medical keywords to the rule engine.

---

## 🏥 Product Philosophy & Ethical Principles

1. **Facts vs. Observations vs. Opportunities vs. Unknowns**:
   - **FACT**: Exact extracted data (e.g., *"WhatsApp link detected on 4 pages"*).
   - **OBSERVATION**: Structural digital presence (e.g., *"14 of 18 doctor profiles lack booking buttons"*).
   - **OPPORTUNITY**: Growth actions (e.g., *"Implement 1-click consultation CTAs"*).
   - **UNKNOWN**: Explicitly labeled as **"Discovery Required"** for internal workflows (e.g. CRM, missed call recovery).
2. **Zero Fabrication**:
   - The platform never invents organic search volumes, Google keyword rankings, lost patient metrics, or doctor medical quality ratings.

---

## 📄 License & Proprietary Notice

© 2026 IAMONIN Growth Engineering. All Rights Reserved. Built for internal enterprise healthcare prospecting.
