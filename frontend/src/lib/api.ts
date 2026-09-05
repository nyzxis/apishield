import { BenchmarkPreset, ScanReport, ScanAuditSummary } from '../types';
import { runClientSideScan } from './clientScanner';

const API_BASE = '/api';

export const FALLBACK_BENCHMARKS: BenchmarkPreset[] = [
  {
    id: 'broken-bank-bola',
    title: 'Broken Bank API (v1)',
    subtitle: 'BOLA / IDOR Account Balance & Private Data Leak',
    category: 'API1: BOLA / IDOR',
    severity: 'CRITICAL',
    method: 'GET',
    target_url: '/api/mock/bank/account/101',
    headers: {
      Authorization: 'Bearer token_account_alice_101',
      Accept: 'application/json'
    },
    body: null,
    description: "Simulates banking microservice where swapping account ID parameter (/101 -> /102) exposes another client's high-net-worth balance without object-level authorization."
  },
  {
    id: 'ecommerce-mass-assignment',
    title: 'E-Commerce Checkout API',
    subtitle: 'Mass Assignment & Privilege Escalation',
    category: 'API3: Mass Assignment',
    severity: 'HIGH',
    method: 'POST',
    target_url: '/api/mock/store/order',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      item: 'Hardware Security Dongle',
      quantity: 1,
      role: 'admin',
      is_admin: true,
      discount_percent: 100
    },
    description: "Demonstrates uncontrolled parameter binding where injecting internal properties ('role': 'admin', 'discount_percent': 100) binds directly into order processing."
  },
  {
    id: 'healthcare-jwt-bypass',
    title: 'Healthcare Patient Records',
    subtitle: 'Broken Authentication & Alg=None Token Signature',
    category: 'API2: Broken Authentication',
    severity: 'CRITICAL',
    method: 'GET',
    target_url: '/api/mock/health/patients/P-901',
    headers: {
      Authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMzAifQ.',
      Accept: 'application/json'
    },
    body: null,
    description: "Demonstrates medical record portal accepting unsigned JWT tokens crafted with the 'none' algorithm and leaking internal Swagger schemas."
  },
  {
    id: 'hardened-enterprise',
    title: 'Hardened Enterprise Gateway',
    subtitle: 'Clean OWASP Compliant Microservice Control',
    category: 'SECURE BENCHMARK',
    severity: 'LOW',
    method: 'GET',
    target_url: '/api/mock/enterprise/secure',
    headers: {
      Authorization: 'Bearer apishield_prod_valid_token_2026',
      Accept: 'application/json'
    },
    body: null,
    description: "Fully hardened enterprise API with strict cryptographic authentication, mandatory HSTS, X-Content-Type-Options, and rate-limiting headers."
  }
];

export async function fetchHealth(): Promise<{
  status: string;
  database_backend: string;
  owasp_version: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    return {
      status: 'offline_fallback',
      database_backend: 'Local Storage / Client Sandbox',
      owasp_version: 'OWASP API Security Top 10 (2023)'
    };
  }
}

export async function fetchBenchmarks(): Promise<BenchmarkPreset[]> {
  try {
    const res = await fetch(`${API_BASE}/benchmarks`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.benchmarks || FALLBACK_BENCHMARKS;
  } catch {
    return FALLBACK_BENCHMARKS;
  }
}

export async function fetchScanHistory(): Promise<ScanAuditSummary[]> {
  try {
    const res = await fetch(`${API_BASE}/history?limit=10`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.history || [];
  } catch {
    // Return empty history on offline/local
    return [];
  }
}

export async function executeScan(
  targetUrl: string,
  method: string = 'GET',
  headers: Record<string, string> = {},
  body: any = null
): Promise<ScanReport> {
  try {
    const res = await fetch(`${API_BASE}/scan`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        target_url: targetUrl,
        http_method: method,
        headers,
        body
      })
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Server responded with ${res.status}`);
    }

    const report: ScanReport = await res.json();
    return report;
  } catch (err) {
    console.warn('Backend scan failed or offline, switching to client-side heuristic auditor:', err);
    // Execute resilient client-side scanner fallback
    return runClientSideScan(targetUrl, method, headers, body);
  }
}
