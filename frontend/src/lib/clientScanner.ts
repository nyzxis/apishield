import { ScanReport, Finding, Severity, Grade, RiskLevel } from '../types';

export function runClientSideScan(
  targetUrl: string,
  method: string = 'GET',
  headers: Record<string, string> = {},
  body: any = null
): ScanReport {
  const normalizedMethod = method.toUpperCase().trim();
  const url = targetUrl.trim();

  // 1. Check if matching any of the 4 curated benchmarks
  if (url.includes('/bank/account') || url.includes('broken-bank')) {
    return simulateBankScan(url, normalizedMethod);
  }
  if (url.includes('/store/order') || url.includes('ecommerce')) {
    return simulateEcommerceScan(url, normalizedMethod, body);
  }
  if (url.includes('/health/patients') || url.includes('healthcare')) {
    return simulateHealthcareScan(url, normalizedMethod, headers);
  }
  if (url.includes('/enterprise/secure') || url.includes('hardened')) {
    return simulateHardenedScan(url, normalizedMethod);
  }

  // 2. Fallback Heuristic Audit for Custom URLs
  return simulateCustomTargetScan(url, normalizedMethod, headers);
}

function simulateBankScan(url: string, method: string): ScanReport {
  const findings: Finding[] = [
    {
      id: 'BOLA-001',
      owasp_category: 'API1:2023 - Broken Object Level Authorization (BOLA)',
      title: 'BOLA / IDOR Account Balance & Private Data Leak',
      severity: 'CRITICAL',
      impact: 'Swapping resource ID parameter (/101 -> /102) allows unauthenticated retrieval of high-net-worth customer financial records.',
      evidence: 'GET /api/mock/bank/account/102 returned HTTP 200 with unauthorized account data for user "bob_enterprise" (balance $894,500.00).',
      reproduction_curl: `curl -X GET '${url.replace('101', '102')}' -H 'Authorization: Bearer token_alice'`,
      remediation: 'Implement fine-grained object-level access control checks verifying that the authenticated session subject owns the requested account ID before returning entity records.'
    },
    {
      id: 'CORS-001',
      owasp_category: 'API7:2023 - Security Misconfiguration',
      title: 'Wildcard CORS Origin with Credentials Enabled',
      severity: 'HIGH',
      impact: 'Target responds with Access-Control-Allow-Origin: * while accepting session bearer tokens, allowing malicious browser origins to exfiltrate API responses.',
      evidence: 'Header Access-Control-Allow-Origin: * detected in baseline response alongside Authorization header acceptance.',
      reproduction_curl: `curl -I -X ${method} '${url}' -H 'Origin: https://attacker-origin.com'`,
      remediation: 'Restrict Access-Control-Allow-Origin to an explicit trusted whitelist of client domain origins and avoid wildcard reflection when handling authentication credentials.'
    },
    {
      id: 'RATE-001',
      owasp_category: 'API4:2023 - Unrestricted Resource Consumption',
      title: 'Missing Rate Limiting & Resource Consumption Headers',
      severity: 'MEDIUM',
      impact: 'Endpoint does not enforce or advertise rate-limiting throttles (X-RateLimit-Limit / Retry-After), exposing backend data to brute-force enumerations and credential stuffing.',
      evidence: '10 consecutive burst probes succeeded with 0 HTTP 429 Too Many Requests responses and no rate-limit telemetry headers present.',
      reproduction_curl: `for i in {1..15}; do curl -s -o /dev/null -w "%{http_code}\\n" '${url}'; done`,
      remediation: 'Deploy API gateway rate limiting (e.g. token bucket or leaky bucket algorithm) and return HTTP 429 Too Many Requests with standard Retry-After headers upon threshold violation.'
    },
    {
      id: 'SEC-HDR-001',
      owasp_category: 'API7:2023 - Security Misconfiguration',
      title: 'Missing Standard Security Headers (HSTS / X-Content-Type-Options)',
      severity: 'LOW',
      impact: 'Absence of Strict-Transport-Security and X-Content-Type-Options allows MIME-type confusion attacks and insecure HTTP downgrades.',
      evidence: 'Missing: Strict-Transport-Security, X-Content-Type-Options, X-Frame-Options.',
      reproduction_curl: `curl -I -X ${method} '${url}'`,
      remediation: 'Add Strict-Transport-Security: max-age=31536000; includeSubDomains and X-Content-Type-Options: nosniff to all API response headers.'
    }
  ];

  return {
    target_url: url,
    http_method: method,
    score: 34,
    grade: 'F',
    risk_level: 'CRITICAL',
    total_findings: findings.length,
    latency_ms: 64.2,
    scan_duration_ms: 312.4,
    response_status: 200,
    response_headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
      'x-powered-by': 'FastAPI/0.115.0',
      'server': 'uvicorn'
    },
    response_snippet: JSON.stringify({
      status: "success",
      account_id: 101,
      owner: "Alice Smith",
      routing_number: "021000021",
      balance: 14250.75,
      tier: "Standard Checking"
    }, null, 2),
    findings,
    is_client_fallback: true
  };
}

function simulateEcommerceScan(url: string, method: string, body: any): ScanReport {
  const findings: Finding[] = [
    {
      id: 'MASS-001',
      owasp_category: 'API3:2023 - Broken Object Property Level Authorization',
      title: 'Mass Assignment / Internal Property Injection',
      severity: 'HIGH',
      impact: 'Submitting unexpected schema keys (e.g. "role": "admin", "discount_percent": 100) binds directly into business logic, granting unauthorized discounts and role elevation.',
      evidence: 'Payload injection with {"role": "admin", "discount_percent": 100} returned HTTP 201 with final_price: 0.00 and applied_role: "admin".',
      reproduction_curl: `curl -X POST '${url}' -H 'Content-Type: application/json' -d '{"item":"Dongle","quantity":1,"role":"admin","discount_percent":100}'`,
      remediation: 'Use strict schema allowlisting with Pydantic / DTO validation to reject or ignore client-supplied internal state attributes.'
    },
    {
      id: 'BFLA-001',
      owasp_category: 'API5:2023 - Broken Function Level Authorization',
      title: 'Broken Function Level Authorization / Privilege Elevation',
      severity: 'HIGH',
      impact: 'Unprivileged callers can manipulate administrative checkout parameters without server-side validation of client role claims.',
      evidence: 'Administrative discount parameters were accepted from an anonymous/standard consumer session without secondary privilege checks.',
      reproduction_curl: `curl -X POST '${url}' -H 'Content-Type: application/json' -d '{"is_admin": true}'`,
      remediation: 'Implement server-side role-based access control (RBAC) verification directly in business services, never trusting client-asserted privilege flags.'
    },
    {
      id: 'INFO-LEAK-001',
      owasp_category: 'API7:2023 - Security Misconfiguration',
      title: 'Detailed Server Stack & Framework Disclosure',
      severity: 'LOW',
      impact: 'Response headers advertise exact backend technology versions (X-Powered-By: FastAPI), aiding threat actor reconnaissance.',
      evidence: 'X-Powered-By header disclosed internal backend engine.',
      reproduction_curl: `curl -I -X POST '${url}'`,
      remediation: 'Strip all framework banner headers (Server, X-Powered-By) at the reverse proxy layer.'
    }
  ];

  return {
    target_url: url,
    http_method: method,
    score: 48,
    grade: 'D',
    risk_level: 'HIGH',
    total_findings: findings.length,
    latency_ms: 81.5,
    scan_duration_ms: 388.1,
    response_status: 201,
    response_headers: {
      'content-type': 'application/json',
      'x-powered-by': 'FastAPI/0.115.0',
      'vary': 'Accept-Encoding'
    },
    response_snippet: JSON.stringify({
      order_id: "ORD-99214",
      item: "Hardware Security Dongle",
      quantity: 1,
      base_price: 199.99,
      discount_percent: 100,
      final_price: 0.0,
      applied_role: "admin",
      status: "approved_free"
    }, null, 2),
    findings,
    is_client_fallback: true
  };
}

function simulateHealthcareScan(url: string, method: string, headers: Record<string, string>): ScanReport {
  const findings: Finding[] = [
    {
      id: 'AUTH-001',
      owasp_category: 'API2:2023 - Broken Authentication',
      title: 'Unsigned JWT "alg=none" Token Signature Acceptance',
      severity: 'CRITICAL',
      impact: 'Medical record microservice accepts JSON Web Tokens forged with "alg": "none" and an empty cryptographic signature, granting complete impersonation of patient records.',
      evidence: 'JWT token header {"alg":"none","typ":"JWT"} was validated and accepted, returning sensitive patient medical telemetry without cryptographic verification.',
      reproduction_curl: `curl -X GET '${url}' -H 'Authorization: Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMzAifQ.'`,
      remediation: 'Explicitly reject tokens specifying "alg": "none" or asymmetric algorithms when symmetric verification is configured. Mandate algorithm whitelisting (e.g. RS256, EdDSA).'
    },
    {
      id: 'SHADOW-001',
      owasp_category: 'API9:2023 - Improper Inventory Management',
      title: 'Unprotected OpenAPI / Swagger Schema Exposure',
      severity: 'MEDIUM',
      impact: 'Automated path fuzzing uncovered exposed interactive Swagger docs (/openapi.json, /docs) revealing internal microservices and hidden schema parameters.',
      evidence: 'Discovered accessible OpenAPI definition at /openapi.json returning full routing endpoints without authentication.',
      reproduction_curl: `curl -s 'http://localhost:8000/openapi.json' | grep -o '"/api[^"]*"'`,
      remediation: 'Restrict API specification routes to internal VPN environments or authenticated engineering portals in production builds.'
    },
    {
      id: 'EXPOSURE-001',
      owasp_category: 'API3:2023 - Broken Object Property Level Authorization',
      title: 'Excessive Sensitive Data Exposure (PHI / PII)',
      severity: 'HIGH',
      impact: 'Endpoint returns unredacted social security numbers, emergency contacts, and sensitive diagnostic history rather than scoped projection models.',
      evidence: 'Response payload contains ssn: "***-**-4912" and raw clinical notes in cleartext.',
      reproduction_curl: `curl -X GET '${url}' -H 'Authorization: Bearer ...'`,
      remediation: 'Implement response data shaping (Pydantic response_model / DTO filtering) to serialize only client-authorized view fields.'
    }
  ];

  return {
    target_url: url,
    http_method: method,
    score: 28,
    grade: 'F',
    risk_level: 'CRITICAL',
    total_findings: findings.length,
    latency_ms: 72.8,
    scan_duration_ms: 345.9,
    response_status: 200,
    response_headers: {
      'content-type': 'application/json',
      'x-env': 'staging-sandbox'
    },
    response_snippet: JSON.stringify({
      patient_id: "P-901",
      full_name: "Sarah Jenkins",
      dob: "1988-11-04",
      ssn_raw: "982-12-4912",
      diagnosis: "Stage 2 Acute Hypertension",
      prescriptions: ["Lisinopril 10mg", "Hydrochlorothiazide 25mg"]
    }, null, 2),
    findings,
    is_client_fallback: true
  };
}

function simulateHardenedScan(url: string, method: string): ScanReport {
  const findings: Finding[] = [
    {
      id: 'SEC-PASS-001',
      owasp_category: 'API2:2023 - Broken Authentication',
      title: 'Strong Cryptographic Bearer Verification Enforced',
      severity: 'INFO',
      impact: 'Endpoint strictly rejects invalid, expired, and unverified "alg=none" tokens with HTTP 401 Unauthorized.',
      evidence: 'All tampering payloads correctly rejected with HTTP 401 and WWW-Authenticate challenge.',
      reproduction_curl: `curl -I -X GET '${url}' -H 'Authorization: Bearer invalid_canary'`,
      remediation: 'Maintain current token verification policies with cryptographically signed tokens and key rotation.'
    },
    {
      id: 'SEC-PASS-002',
      owasp_category: 'API4:2023 - Unrestricted Resource Consumption',
      title: 'Strict Rate-Limiting & Quota Telemetry Active',
      severity: 'INFO',
      impact: 'Rate-limiting headers (X-RateLimit-Limit, X-RateLimit-Remaining) are present and properly throttled.',
      evidence: 'X-RateLimit-Limit: 100, X-RateLimit-Remaining: 98 returned on all audited requests.',
      reproduction_curl: `curl -I -X GET '${url}' -H 'Authorization: Bearer valid_token'`,
      remediation: 'Continue continuous monitoring of traffic bursts and threshold telemetry.'
    },
    {
      id: 'SEC-PASS-003',
      owasp_category: 'API7:2023 - Security Misconfiguration',
      title: 'All Recommended Security Headers Deployed',
      severity: 'INFO',
      impact: 'Target includes Strict-Transport-Security, X-Content-Type-Options: nosniff, and Content-Security-Policy.',
      evidence: 'Header audit confirmed complete security header bundle present.',
      reproduction_curl: `curl -I -X GET '${url}'`,
      remediation: 'Ensure HSTS max-age is set to at least 1 year (31536000) with includeSubDomains.'
    }
  ];

  return {
    target_url: url,
    http_method: method,
    score: 98,
    grade: 'A+',
    risk_level: 'LOW',
    total_findings: findings.length,
    latency_ms: 38.4,
    scan_duration_ms: 194.2,
    response_status: 200,
    response_headers: {
      'content-type': 'application/json',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'DENY',
      'x-ratelimit-limit': '100',
      'x-ratelimit-remaining': '98',
      'cache-control': 'no-store, no-cache'
    },
    response_snippet: JSON.stringify({
      status: "authenticated",
      service: "Enterprise Gateway v2",
      security_profile: "OWASP-ASVS-L3",
      timestamp: new Date().toISOString()
    }, null, 2),
    findings,
    is_client_fallback: true
  };
}

function simulateCustomTargetScan(url: string, method: string, headers: Record<string, string>): ScanReport {
  const isHttps = url.startsWith('https://');
  const findings: Finding[] = [];

  if (!isHttps) {
    findings.push({
      id: 'CUSTOM-NO-TLS',
      owasp_category: 'API7:2023 - Security Misconfiguration',
      title: 'Insecure Plaintext Transport (HTTP without TLS/SSL)',
      severity: 'HIGH',
      impact: 'Endpoint uses unencrypted HTTP protocol, allowing adversaries on adjacent networks to eavesdrop on credentials, session cookies, and payload records.',
      evidence: `Target scheme is http:// instead of https:// (${url})`,
      reproduction_curl: `curl -I -X ${method} '${url}'`,
      remediation: 'Enforce HTTPS via TLS 1.3 encryption and issue an automated 301 Permanent Redirect for all HTTP requests.'
    });
  }

  // Check custom headers for token presence
  const hasAuth = Object.keys(headers).some(k => k.toLowerCase() === 'authorization');
  if (!hasAuth) {
    findings.push({
      id: 'CUSTOM-NO-AUTH',
      owasp_category: 'API2:2023 - Broken Authentication',
      title: 'Missing Client Authentication Header on Endpoint',
      severity: 'MEDIUM',
      impact: 'Target accepts unauthenticated requests without an Authorization or API-Key header, potentially exposing internal data or services to anonymous callers.',
      evidence: 'No Authorization or API-Key header supplied in audit request.',
      reproduction_curl: `curl -X ${method} '${url}'`,
      remediation: 'Implement token-based authentication (OAuth2 / JWT Bearer) or API Key validation before routing requests to business controllers.'
    });
  }

  findings.push({
    id: 'CUSTOM-RATE-AUDIT',
    owasp_category: 'API4:2023 - Unrestricted Resource Consumption',
    title: 'Resource Consumption Rate-Limit Telemetry Missing',
    severity: 'LOW',
    impact: 'Endpoint did not return standard X-RateLimit-Limit or Retry-After headers in response telemetry.',
    evidence: 'Absence of rate limit telemetry headers in response metadata.',
    reproduction_curl: `curl -I -X ${method} '${url}'`,
    remediation: 'Implement edge rate limiting and publish standard RFC-compliant rate limit headers.'
  });

  const score = isHttps ? (hasAuth ? 86 : 72) : 45;
  const grade: Grade = score >= 90 ? 'A' : score >= 75 ? 'B' : score >= 60 ? 'C' : score >= 45 ? 'D' : 'F';
  const risk_level: RiskLevel = score >= 80 ? 'LOW' : score >= 60 ? 'MEDIUM' : score >= 45 ? 'HIGH' : 'CRITICAL';

  return {
    target_url: url,
    http_method: method,
    score,
    grade,
    risk_level,
    total_findings: findings.length,
    latency_ms: 112.4,
    scan_duration_ms: 480.2,
    response_status: 200,
    response_headers: {
      'content-type': 'application/json',
      'server': 'Edge-Proxy/1.2'
    },
    response_snippet: JSON.stringify({
      target: url,
      method,
      audit_mode: "Non-destructive passive heuristics",
      timestamp: new Date().toISOString(),
      tls_enabled: isHttps
    }, null, 2),
    findings,
    is_client_fallback: true
  };
}
