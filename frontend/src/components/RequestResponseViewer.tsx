import { useState } from 'react';
import { ScanReport, ThemeMode } from '../types';
import { Code2, Server, Globe, Copy, Check } from 'lucide-react';

interface RequestResponseViewerProps {
  report: ScanReport;
  theme: ThemeMode;
}

export default function RequestResponseViewer({ report, theme }: RequestResponseViewerProps) {
  const isMinimal = theme === 'minimalist';
  const [activeTab, setActiveTab] = useState<'snippet' | 'headers' | 'request'>('snippet');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const headerKeys = Object.keys(report.response_headers || {});

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 ${
        isMinimal ? 'minimalist-card' : 'glass-panel'
      }`}
    >
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Server className={`w-4 h-4 ${isMinimal ? 'text-[#2C2924]' : 'text-cyan-400'}`} />
          <h3
            className={`font-mono font-bold text-sm uppercase tracking-wider ${
              isMinimal ? 'text-[#2C2924]' : 'text-white'
            }`}
          >
            HTTP Inspector & Protocol Telemetry
          </h3>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setActiveTab('snippet')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'snippet'
                ? isMinimal
                  ? 'bg-[#2C2924] text-white'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : isMinimal
                ? 'bg-[#EAE5DB] text-[#2C2924]/70 hover:bg-[#E1DBD0]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            Response Body
          </button>

          <button
            onClick={() => setActiveTab('headers')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'headers'
                ? isMinimal
                  ? 'bg-[#2C2924] text-white'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : isMinimal
                ? 'bg-[#EAE5DB] text-[#2C2924]/70 hover:bg-[#E1DBD0]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            Headers ({headerKeys.length})
          </button>

          <button
            onClick={() => setActiveTab('request')}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
              activeTab === 'request'
                ? isMinimal
                  ? 'bg-[#2C2924] text-white'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : isMinimal
                ? 'bg-[#EAE5DB] text-[#2C2924]/70 hover:bg-[#E1DBD0]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white'
            }`}
          >
            Target Spec
          </button>
        </div>
      </div>

      {/* Tab 1: Response Body */}
      {activeTab === 'snippet' && (
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-slate-400">
              Payload Preview ({report.response_snippet ? report.response_snippet.length : 0} bytes)
            </span>
            <button
              onClick={() => handleCopy(report.response_snippet || '')}
              className={`flex items-center gap-1 text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : isMinimal
                  ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                  : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" /> Copy Body
                </>
              )}
            </button>
          </div>
          <pre
            className={`p-4 rounded-xl font-mono text-xs max-h-72 overflow-y-auto overflow-x-auto leading-relaxed ${
              isMinimal
                ? 'bg-[#EAE5DB] text-[#2C2924]'
                : 'bg-black/50 border border-white/10 text-cyan-300 selection:bg-cyan-500/30'
            }`}
          >
            <code>{report.response_snippet || '(Empty response body)'}</code>
          </pre>
        </div>
      )}

      {/* Tab 2: Response Headers */}
      {activeTab === 'headers' && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {headerKeys.length === 0 ? (
            <p className="text-xs text-slate-400 font-mono py-4 text-center">
              No HTTP response headers available.
            </p>
          ) : (
            <div className="divide-y divide-white/5">
              {headerKeys.map((key) => {
                const val = report.response_headers[key];
                const isSecurityHeader = [
                  'strict-transport-security',
                  'x-content-type-options',
                  'x-frame-options',
                  'content-security-policy',
                  'access-control-allow-origin',
                  'x-ratelimit-limit'
                ].includes(key.toLowerCase());

                return (
                  <div
                    key={key}
                    className="py-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 font-mono text-xs"
                  >
                    <span
                      className={`font-semibold shrink-0 ${
                        isSecurityHeader
                          ? isMinimal
                            ? 'text-blue-700'
                            : 'text-cyan-400'
                          : isMinimal
                          ? 'text-[#2C2924]'
                          : 'text-slate-300'
                      }`}
                    >
                      {key}:
                    </span>
                    <span
                      className={`break-all text-right ${
                        isMinimal ? 'text-[#2C2924]/80' : 'text-slate-400'
                      }`}
                    >
                      {val}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Request Specification */}
      {activeTab === 'request' && (
        <div className="space-y-3 font-mono text-xs">
          <div
            className={`p-3 rounded-xl border ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-black/40 border-white/10'
            }`}
          >
            <div className="text-slate-400 text-[10px] uppercase mb-1">Target Endpoint</div>
            <div className="text-cyan-400 font-bold break-all">
              {report.http_method} {report.target_url}
            </div>
          </div>

          <div
            className={`p-3 rounded-xl border ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-black/40 border-white/10'
            }`}
          >
            <div className="text-slate-400 text-[10px] uppercase mb-1">Pentest Engine Specifications</div>
            <ul className="space-y-1 text-slate-300 text-[11px]">
              <li>- Protocol: HTTP/1.1 REST JSON</li>
              <li>- Compliance: OWASP API Security Top 10 (2023)</li>
              <li>- Target Safety: Non-destructive heuristic probes</li>
              <li>- Persistence: PostgreSQL / Local Fallback Audit Table</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
