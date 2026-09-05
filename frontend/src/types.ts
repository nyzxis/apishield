export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type Grade = 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';

export interface Finding {
  id: string;
  owasp_category: string;
  title: string;
  severity: Severity;
  impact: string;
  evidence: string;
  reproduction_curl: string;
  remediation: string;
}

export interface ScanReport {
  target_url: string;
  http_method: string;
  score: number;
  grade: Grade;
  risk_level: RiskLevel;
  total_findings: number;
  latency_ms: number;
  scan_duration_ms: number;
  response_status: number;
  response_headers: Record<string, string>;
  response_snippet: string;
  findings: Finding[];
  audit_id?: number;
  is_client_fallback?: boolean;
}

export interface BenchmarkPreset {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  severity: Severity;
  method: string;
  target_url: string;
  headers: Record<string, string>;
  body: any;
  description: string;
}

export interface ScanAuditSummary {
  id: number;
  target_url: string;
  http_method: string;
  score: number;
  grade: string;
  risk_level: string;
  total_findings: number;
  scanned_at: string;
}

export type ThemeMode = 'cyber' | 'minimalist';
