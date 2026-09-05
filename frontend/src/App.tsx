import { useState, useEffect, useCallback } from 'react';
import { ThemeMode, ScanReport, Finding, BenchmarkPreset } from './types';
import {
  fetchHealth,
  fetchBenchmarks,
  executeScan,
  FALLBACK_BENCHMARKS
} from './lib/api';
import Navbar from './components/Navbar';
import CustomCursor from './components/CustomCursor';
import TargetInputBar from './components/TargetInputBar';
import BenchmarkPresets from './components/BenchmarkPresets';
import ScanOverviewGauge from './components/ScanOverviewGauge';
import FindingsMatrix from './components/FindingsMatrix';
import FindingDetailModal from './components/FindingDetailModal';
import RequestResponseViewer from './components/RequestResponseViewer';
import ExportDossierModal from './components/ExportDossierModal';
import { ShieldCheck, ExternalLink, Terminal, Flame, Info } from 'lucide-react';

export default function App() {
  // Theme State
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('apishield-theme');
    return (saved as ThemeMode) || 'cyber';
  });

  // Server Telemetry State
  const [serverStatus, setServerStatus] = useState({
    status: 'connecting',
    database_backend: 'PostgreSQL / Resilient Storage',
    owasp_version: 'OWASP API Security Top 10 (2023)'
  });

  // Target Input State
  const [targetUrl, setTargetUrl] = useState<string>('/api/mock/bank/account/101');
  const [method, setMethod] = useState<string>('GET');
  const [headersStr, setHeadersStr] = useState<string>(
    JSON.stringify(
      {
        Authorization: 'Bearer token_account_alice_101',
        Accept: 'application/json'
      },
      null,
      2
    )
  );
  const [bodyStr, setBodyStr] = useState<string>('');

  // Scanning & Report State
  const [scanning, setScanning] = useState<boolean>(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [benchmarks, setBenchmarks] = useState<BenchmarkPreset[]>(FALLBACK_BENCHMARKS);
  const [activeBenchmarkId, setActiveBenchmarkId] = useState<string | null>('broken-bank-bola');
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // Sync Theme with Root HTML class
  useEffect(() => {
    localStorage.setItem('apishield-theme', theme);
    if (theme === 'minimalist') {
      document.documentElement.classList.add('theme-minimalist');
      document.documentElement.classList.remove('theme-cyber');
    } else {
      document.documentElement.classList.remove('theme-minimalist');
      document.documentElement.classList.add('theme-cyber');
    }
  }, [theme]);

  // Initial Data Fetch & Baseline Execution
  useEffect(() => {
    let isMounted = true;

    async function initData() {
      const health = await fetchHealth();
      const presets = await fetchBenchmarks();

      if (isMounted) {
        setServerStatus(health);
        setBenchmarks(presets);

        // Run baseline scan on default benchmark target
        performScan('/api/mock/bank/account/101', 'GET', {
          Authorization: 'Bearer token_account_alice_101'
        });
      }
    }

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'cyber' ? 'minimalist' : 'cyber'));
  };

  const performScan = async (
    target: string,
    httpVerb: string,
    parsedHeaders: Record<string, string>,
    parsedBody: any = null
  ) => {
    setScanning(true);
    try {
      const scanResult = await executeScan(target, httpVerb, parsedHeaders, parsedBody);
      setReport(scanResult);
    } catch (err) {
      console.error('Scan execution error:', err);
    } finally {
      setScanning(false);
    }
  };

  const handleManualScan = () => {
    let parsedHeaders: Record<string, string> = {};
    if (headersStr.trim()) {
      try {
        parsedHeaders = JSON.parse(headersStr);
      } catch {
        parsedHeaders = {};
      }
    }

    let parsedBody: any = null;
    if (bodyStr.trim()) {
      try {
        parsedBody = JSON.parse(bodyStr);
      } catch {
        parsedBody = null;
      }
    }

    performScan(targetUrl, method, parsedHeaders, parsedBody);
  };

  const handleSelectPreset = (preset: BenchmarkPreset, autoScan: boolean = true) => {
    setActiveBenchmarkId(preset.id);
    setTargetUrl(preset.target_url);
    setMethod(preset.method);
    setHeadersStr(JSON.stringify(preset.headers || {}, null, 2));
    setBodyStr(preset.body ? JSON.stringify(preset.body, null, 2) : '');

    if (autoScan) {
      performScan(preset.target_url, preset.method, preset.headers || {}, preset.body);
    }
  };

  const isMinimal = theme === 'minimalist';

  return (
    <div
      className={`min-h-screen relative flex flex-col transition-colors duration-200 ${
        isMinimal
          ? 'bg-[#EBE7DF] text-[#2C2924]'
          : 'bg-[#060913] text-slate-100 cyber-grid selection:bg-cyan-500/30'
      }`}
    >
      {/* Precision Hardware Cursor */}
      <CustomCursor theme={theme} />

      {/* Cyber Ambient Glow Overlays (Hidden in Minimalist) */}
      {!isMinimal && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        </div>
      )}

      {/* Island Navigation Bar */}
      <Navbar
        theme={theme}
        onToggleTheme={toggleTheme}
        serverStatus={serverStatus}
        onOpenExport={() => setShowExportModal(true)}
        hasScanReport={!!report}
      />

      {/* Main Core Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Hero Section */}
        <section className="text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-3 border transition-colors duration-200">
            <Flame
              className={`w-3.5 h-3.5 ${
                isMinimal ? 'text-amber-800' : 'text-cyan-400 animate-pulse'
              }`}
            />
            <span
              className={
                isMinimal
                  ? 'text-[#2C2924] font-semibold'
                  : 'text-cyan-300 font-semibold tracking-wide'
              }
            >
              ACTIVE DEFENSE // OWASP API SECURITY AUDITOR
            </span>
          </div>

          <h1
            className={`text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono mb-3 leading-tight ${
              isMinimal ? 'text-[#2C2924]' : 'text-white'
            }`}
          >
            Automated Pentesting Suite & Exploitation Inspector
          </h1>

          <p
            className={`max-w-3xl text-sm sm:text-base leading-relaxed font-sans ${
              isMinimal ? 'text-[#2C2924]/75' : 'text-slate-400'
            }`}
          >
            Execute non-destructive security audits against RESTful APIs, microservices, and webhooks.
            Instantly identify BOLA/IDOR object tampering, broken JWT authentication, parameter mass
            assignment, and CORS leaks with reproducible curl exploits and remediation fixes.
          </p>
        </section>

        {/* Target URL Input Control Bar */}
        <section>
          <TargetInputBar
            targetUrl={targetUrl}
            setTargetUrl={setTargetUrl}
            method={method}
            setMethod={setMethod}
            headersStr={headersStr}
            setHeadersStr={setHeadersStr}
            bodyStr={bodyStr}
            setBodyStr={setBodyStr}
            onScan={handleManualScan}
            scanning={scanning}
            theme={theme}
          />
        </section>

        {/* 4 Interactive Sandbox Benchmarks */}
        <section>
          <BenchmarkPresets
            benchmarks={benchmarks}
            onSelectPreset={handleSelectPreset}
            activeId={activeBenchmarkId}
            theme={theme}
          />
        </section>

        {/* Scan Results Presentation */}
        {report && (
          <section className="space-y-6">
            {/* Overview Security Gauge & Risk Level */}
            <ScanOverviewGauge report={report} theme={theme} />

            {/* Matrix & HTTP Inspector Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: OWASP Findings Matrix */}
              <div className="lg:col-span-7 xl:col-span-8">
                <FindingsMatrix
                  findings={report.findings}
                  onSelectFinding={(f) => setSelectedFinding(f)}
                  theme={theme}
                />
              </div>

              {/* Right Column: Request / Response Inspector */}
              <div className="lg:col-span-5 xl:col-span-4">
                <RequestResponseViewer report={report} theme={theme} />
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Findings Detail Modal */}
      {selectedFinding && (
        <FindingDetailModal
          finding={selectedFinding}
          onClose={() => setSelectedFinding(null)}
          theme={theme}
        />
      )}

      {/* Executive Dossier Export Modal */}
      {showExportModal && report && (
        <ExportDossierModal
          report={report}
          onClose={() => setShowExportModal(false)}
          theme={theme}
        />
      )}

      {/* Footer */}
      <footer
        className={`relative z-10 w-full px-4 py-8 mt-12 border-t font-mono text-xs transition-colors ${
          isMinimal ? 'border-[#D8D2C5] bg-[#E5E0D5]/50 text-[#2C2924]' : 'border-white/10 bg-black/40 text-slate-400'
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className={`w-4 h-4 ${isMinimal ? 'text-[#2C2924]' : 'text-cyan-400'}`} />
            <span>APIShield v1.0 // Engineered by</span>
            <a
              href="https://github.com/nyzxis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline font-bold"
            >
              Arfa Danial (@nyzxis)
            </a>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>OWASP API Security Top 10 (2023) Compliant</span>
            <span>•</span>
            <a
              href="https://nyzxis.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 transition-colors flex items-center gap-1"
            >
              Portfolio <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
