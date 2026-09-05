import { useState } from 'react';
import { Finding, Severity, ThemeMode } from '../types';
import { ShieldAlert, Terminal, Search, ChevronRight, Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface FindingsMatrixProps {
  findings: Finding[];
  onSelectFinding: (finding: Finding) => void;
  theme: ThemeMode;
}

const SEVERITY_FILTERS: Array<Severity | 'ALL'> = ['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO'];

export default function FindingsMatrix({ findings, onSelectFinding, theme }: FindingsMatrixProps) {
  const isMinimal = theme === 'minimalist';
  const [selectedSeverity, setSelectedSeverity] = useState<Severity | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFindings = findings.filter((f) => {
    const matchesSeverity = selectedSeverity === 'ALL' || f.severity === selectedSeverity;
    const matchesSearch =
      f.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.owasp_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.impact.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: Severity) => {
    switch (severity) {
      case 'CRITICAL':
        return isMinimal
          ? 'bg-rose-100 text-rose-800 border-rose-300'
          : 'bg-rose-500/15 text-rose-400 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'HIGH':
        return isMinimal
          ? 'bg-amber-100 text-amber-800 border-amber-300'
          : 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
      case 'MEDIUM':
        return isMinimal
          ? 'bg-blue-100 text-blue-800 border-blue-300'
          : 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'LOW':
        return isMinimal
          ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
          : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
      default:
        return isMinimal
          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
          : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 ${
        isMinimal ? 'minimalist-card' : 'glass-panel'
      }`}
    >
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className={`w-4 h-4 ${isMinimal ? 'text-[#2C2924]' : 'text-cyan-400'}`} />
            <h3
              className={`font-mono font-bold text-sm uppercase tracking-wider ${
                isMinimal ? 'text-[#2C2924]' : 'text-white'
              }`}
            >
              OWASP API Security Findings Matrix ({filteredFindings.length})
            </h3>
          </div>
          <p
            className={`text-xs font-mono ${isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'}`}
          >
            Vulnerabilities mapped directly to OWASP API Security Top 10 (2023)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter vulnerabilities..."
            className={`w-full font-mono text-xs pl-8 pr-3 py-2 rounded-xl border focus:outline-none transition-colors ${
              isMinimal
                ? 'bg-white border-[#D8D2C5] text-[#2C2924] focus:border-[#2C2924]'
                : 'bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-cyan-400'
            }`}
          />
        </div>
      </div>

      {/* Severity Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none">
        {SEVERITY_FILTERS.map((sev) => {
          const count =
            sev === 'ALL'
              ? findings.length
              : findings.filter((f) => f.severity === sev).length;
          const isActive = selectedSeverity === sev;

          return (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1 rounded-xl font-mono text-[11px] font-bold tracking-wider transition-all duration-150 shrink-0 cursor-pointer ${
                isActive
                  ? isMinimal
                    ? 'bg-[#2C2924] text-white shadow-sm'
                    : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : isMinimal
                  ? 'bg-[#EAE5DB] text-[#2C2924]/70 hover:bg-[#E1DBD0]'
                  : 'bg-white/[0.03] border border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              {sev} ({count})
            </button>
          );
        })}
      </div>

      {/* Findings List */}
      {filteredFindings.length === 0 ? (
        <div
          className={`text-center py-12 rounded-xl border border-dashed ${
            isMinimal ? 'border-[#D8D2C5] bg-[#EAE5DB]/40' : 'border-white/10 bg-white/[0.02]'
          }`}
        >
          <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
          <p
            className={`font-mono text-sm font-bold ${
              isMinimal ? 'text-[#2C2924]' : 'text-slate-200'
            }`}
          >
            No vulnerabilities match the current filter
          </p>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Endpoint conforms cleanly to all tested vectors in this category.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFindings.map((finding) => (
            <div
              key={finding.id}
              onClick={() => onSelectFinding(finding)}
              className={`group p-4 rounded-xl border transition-all duration-200 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                isMinimal
                  ? 'bg-[#F4F1EA] border-[#D8D2C5] hover:bg-[#EAE5DB] hover:border-[#2C2924]/40'
                  : 'bg-white/[0.02] border-white/10 hover:bg-white/[0.05] hover:border-cyan-500/40 hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]'
              }`}
            >
              <div className="space-y-1.5 flex-1">
                {/* Severity + Category */}
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 rounded-md border ${getSeverityBadge(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>
                  <span
                    className={`font-mono text-[11px] ${
                      isMinimal ? 'text-[#2C2924]/80' : 'text-cyan-400/90'
                    }`}
                  >
                    {finding.owasp_category}
                  </span>
                </div>

                {/* Title */}
                <h4
                  className={`font-mono font-bold text-sm group-hover:text-cyan-400 transition-colors ${
                    isMinimal ? 'text-[#2C2924]' : 'text-white'
                  }`}
                >
                  {finding.title}
                </h4>

                {/* Impact Snippet */}
                <p
                  className={`text-xs leading-relaxed line-clamp-2 ${
                    isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'
                  }`}
                >
                  {finding.impact}
                </p>
              </div>

              {/* Action Button */}
              <div className="shrink-0 flex items-center gap-2">
                <button
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono text-xs font-semibold transition-all duration-150 ${
                    isMinimal
                      ? 'bg-[#EAE5DB] text-[#2C2924] group-hover:bg-[#2C2924] group-hover:text-white'
                      : 'bg-white/[0.05] border border-white/10 text-cyan-300 group-hover:bg-cyan-500 group-hover:text-black group-hover:border-cyan-400'
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Inspect Exploit</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
