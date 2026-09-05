import os
from typing import Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from backend.scanner import APISecurityScanner
from backend.mock_api import mock_router
from backend.database import save_scan_audit, get_audit_history, DATABASE_URL

app = FastAPI(
    title="APIShield API",
    description="OWASP API Security Top 10 Automated Pentesting Engine",
    version="1.0.0"
)

# Enable CORS for local Vite and Vercel production domains
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the simulated vulnerable playground router
app.include_router(mock_router)

class ScanRequest(BaseModel):
    target_url: str = Field(..., description="Target API endpoint URL to audit")
    http_method: str = Field("GET", description="HTTP verb (GET, POST, PUT, DELETE, PATCH)")
    headers: Optional[Dict[str, str]] = Field(default_factory=dict, description="Custom HTTP headers")
    body: Optional[Any] = Field(None, description="Optional JSON request body or payload")

# 4 Curated Benchmark Presets
BENCHMARK_PRESETS = [
    {
        "id": "broken-bank-bola",
        "title": "Broken Bank API (v1)",
        "subtitle": "BOLA / IDOR Account Balance & Private Data Leak",
        "category": "API1: BOLA / IDOR",
        "severity": "CRITICAL",
        "method": "GET",
        "target_url": "/api/mock/bank/account/101",
        "headers": {
            "Authorization": "Bearer token_account_alice_101",
            "Accept": "application/json"
        },
        "body": None,
        "description": "Simulates banking microservice where swapping account ID parameter (/101 -> /102) exposes another client's high-net-worth balance without object-level authorization."
    },
    {
        "id": "ecommerce-mass-assignment",
        "title": "E-Commerce Checkout API",
        "subtitle": "Mass Assignment & Privilege Escalation",
        "category": "API3: Mass Assignment",
        "severity": "HIGH",
        "method": "POST",
        "target_url": "/api/mock/store/order",
        "headers": {
            "Content-Type": "application/json"
        },
        "body": {
            "item": "Hardware Security Dongle",
            "quantity": 1,
            "role": "admin",
            "is_admin": True,
            "discount_percent": 100
        },
        "description": "Demonstrates uncontrolled parameter binding where injecting internal properties ('role': 'admin', 'discount_percent': 100) binds directly into order processing."
    },
    {
        "id": "healthcare-jwt-bypass",
        "title": "Healthcare Patient Records",
        "subtitle": "Broken Authentication & Alg=None Token Signature",
        "category": "API2: Broken Authentication",
        "severity": "CRITICAL",
        "method": "GET",
        "target_url": "/api/mock/health/patients/P-901",
        "headers": {
            "Authorization": "Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMzAifQ.",
            "Accept": "application/json"
        },
        "body": None,
        "description": "Demonstrates medical record portal accepting unsigned JWT tokens crafted with the 'none' algorithm and leaking internal Swagger schemas."
    },
    {
        "id": "hardened-enterprise",
        "title": "Hardened Enterprise Gateway",
        "subtitle": "Clean OWASP Compliant Microservice Control",
        "category": "SECURE BENCHMARK",
        "severity": "LOW",
        "method": "GET",
        "target_url": "/api/mock/enterprise/secure",
        "headers": {
            "Authorization": "Bearer apishield_prod_valid_token_2026",
            "Accept": "application/json"
        },
        "body": None,
        "description": "Fully hardened enterprise API with strict cryptographic authentication, mandatory HSTS, X-Content-Type-Options, and rate-limiting headers."
    }
]

scanner = APISecurityScanner()

@app.get("/api/health")
async def health_check():
    db_mode = "PostgreSQL" if DATABASE_URL and "postgres" in DATABASE_URL.lower() else "SQLite (Fallback/Resilient)"
    return {
        "status": "online",
        "service": "APIShield Automated Security Auditor",
        "database_backend": db_mode,
        "owasp_version": "OWASP API Security Top 10 (2023)",
        "benchmarks_loaded": len(BENCHMARK_PRESETS)
    }

@app.get("/api/benchmarks")
async def get_benchmarks():
    return {"benchmarks": BENCHMARK_PRESETS}

@app.get("/api/history")
async def get_history(limit: int = 10):
    records = get_audit_history(limit=limit)
    return {"history": records}

@app.post("/api/scan")
async def execute_scan(req: ScanRequest):
    target = req.target_url.strip()
    if not target:
        raise HTTPException(status_code=400, detail="Target URL cannot be empty.")

    # If user selected a relative mock path, build local URL or mock directly
    if target.startswith("/api/mock"):
        target = f"http://127.0.0.1:8000{target}"

    report = scanner.run_full_scan(
        target_url=target,
        http_method=req.http_method,
        headers=req.headers or {},
        body=req.body
    )

    # Persist scan report to database
    audit_id = save_scan_audit(report)
    report["audit_id"] = audit_id

    return report
