# 🛡️ APIShield // OWASP API Security Top 10 Pentesting Suite

<p align="center">
  <img src="https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-336791?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Compliance-OWASP%20API%20Top%2010%20(2023)-E11D48?style=for-the-badge" alt="OWASP" />
  <img src="https://img.shields.io/badge/Author-Arfa%20Danial%20(@nyzxis)-06B6D4?style=for-the-badge" alt="Author" />
</p>

---

## ⚡ Overview

**APIShield** is an automated REST API security testing, vulnerability assessment, and offensive pentesting engine designed for the **OWASP API Security Top 10 (2023)**.

It provides a hybrid assessment playground:
1. **Interactive Sandbox Playground**: 4 curated vulnerable benchmark microservices that demonstrate real-world exploitable conditions (BOLA/IDOR account balance leaks, E-Commerce mass assignment privilege escalations, Healthcare unsigned JWT `alg=none` authentication bypasses, and a hardened enterprise baseline).
2. **Custom Target Pentester**: Safe, non-destructive heuristic probes against arbitrary external REST endpoints, auditing transport security, authentication challenges, rate limiting telemetry, and CORS misconfigurations.

Every finding features an **impact threat model**, **live evidence**, **reproducible cURL command**, and **enterprise remediation code fix**.

---

## 🌟 Key Features

- **OWASP API Security Top 10 (2023) Coverage**:
  - `API1:2023` — Broken Object Level Authorization (BOLA / IDOR)
  - `API2:2023` — Broken Authentication & JWT `alg=none` Signature Bypass
  - `API3:2023` — Broken Object Property Level Authorization & Mass Assignment
  - `API4:2023` — Unrestricted Resource Consumption & Rate Limiting Telemetry
  - `API5:2023` — Broken Function Level Authorization & Privilege Escalation
  - `API7:2023` — Security Misconfiguration & Wildcard CORS with Credentials
  - `API9:2023` — Improper Inventory Management & Shadow Schema Exposure
  - `API10:2023` — Unsafe Consumption of APIs & Unvalidated Input Fuzzing
- **Real-Time Security Gauge**: Dynamic circular SVG dial calculating risk rating (0–100 score), letter grade (`A+` to `F`), and overall security posture.
- **Exploitation & Remediation Dossier**:
  - One-click copyable `curl` commands to reproduce findings in terminal.
  - Enterprise mitigation snippets with schema filtering, DTO allowlisting, and reverse proxy rules.
- **HTTP Protocol Inspector**: Raw response body preview, interactive response header security analyzer, and request specifications.
- **Executive Dossier Export**: Formatted printable PDF & copyable Markdown pentest audit report for stakeholders and security compliance reviews.
- **Dual Visual Theme**:
  - **Cyber Obsidian**: High-contrast, glowing cyan & deep obsidian terminal styling with hardware dual-ring cursor.
  - **Minimalist Paper**: Warm `#EBE7DF` paper theme with charcoal typography and tactile double-bezel cards.
- **Resilient Dual Architecture**: Runs full FastAPI engine with PostgreSQL / SQLite fallback, paired with an in-browser client scanner guaranteeing 100% uptime on Vercel serverless.

---

## 🏗️ Architecture

```text
apishield/
├── api/
│   └── index.py                     # Vercel serverless entrypoint
├── backend/
│   ├── app.py                       # FastAPI server & route handlers
│   ├── database.py                  # PostgreSQL / SQLite audit storage
│   ├── scanner.py                   # Core OWASP API Top 10 pentesting engine
│   ├── mock_api.py                  # Simulated vulnerable endpoints (BOLA, JWT, mass assignment)
│   ├── requirements.txt             # Python dependencies
│   └── tests/
│       └── test_scanner.py          # Automated test suite (0.066s execution)
├── frontend/
│   ├── src/
│   │   ├── components/              # Dual-theme UI components & modals
│   │   ├── lib/                     # API client & resilient client-side scanner
│   │   ├── types.ts                 # TypeScript data contracts
│   │   └── styles.css               # Tailwind v4 styles & custom cursor
│   ├── package.json                 # React 19 + TypeScript + Tailwind v4
│   └── vite.config.ts
├── requirements.txt                 # Root Python requirements for Vercel
├── vercel.json                      # Serverless build & rewrite rules
└── README.md
```

---

## 🚀 Quickstart & Local Setup

### 1. Backend Setup (FastAPI)
```bash
# Navigate to backend and create virtual environment
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows

# Install backend dependencies
pip install -r backend/requirements.txt

# Run FastAPI server on port 8000
uvicorn backend.app:app --reload --port 8000
```
Backend Swagger documentation available at: `http://localhost:8000/docs`

### 2. Frontend Setup (React 19 + Vite)
```bash
# Navigate to frontend directory
cd frontend

# Install node dependencies
npm install

# Start Vite dev server with API proxy
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Running Automated Unit Tests

```bash
# Execute backend test suite
python -m unittest backend.tests.test_scanner -v
```

---

## 🌐 Deploy to Vercel

APIShield is optimized for 1-click deployment to Vercel:

1. Push your repository to GitHub: `https://github.com/nyzxis/apishield`
2. Import project in Vercel.
3. Root `vercel.json` and `requirements.txt` automatically configure the Python serverless runtime (`@vercel/python`) and build `frontend/dist`.
4. (Optional) Set `DATABASE_URL` in Vercel Environment Variables to connect a remote PostgreSQL instance (Neon, Supabase, Render). If not set, resilient fallback storage operates seamlessly.

---

## 👤 Author

**Arfa Danial (@nyzxis)**
- Portfolio: [https://nyzxis.vercel.app/](https://nyzxis.vercel.app/)
- GitHub: [@nyzxis](https://github.com/nyzxis)

---

## 📄 License

MIT License — free for educational, defensive, and portfolio demonstration purposes.
