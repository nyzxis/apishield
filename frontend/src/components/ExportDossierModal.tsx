import { useState } from 'react';
import { ScanReport, ThemeMode } from '../types';
import { X, Printer, Copy, Check, Shield, FileCheck2 } from 'lucide-react';

interface ExportDossierModalProps {
  report: ScanReport;
  onClose: () => void;
  theme: ThemeMode;
}

export default function ExportDossierModal({ report, onClose, theme }: ExportDossierModalProps) {
  const isMinimal = theme === 'minimalist';
  const [copiedMd, setCopiedMd] = useState(false);

  const generateMarkdown = () => {
    return `# 🛡️ APIShield // Executive API Pentest Dossier
**Auditor**: Arfa Danial (@nyzxis)  
**Date**: ${new Date().toISOString()}  
**Target URL**: ${report.http_method} ${report.target_url}  
**Framework**: OWASP API Security Top 10 (2023)  

---

## 📊 Security Posture Overview
- **Overall Score**: ${report.score} / 100
- **Letter Grade**: ${report.grade}
- **Risk Level**: ${report.risk_level}
- **Total Vulnerabilities**: ${report.total_findings}
- **Baseline Latency**: ${report.latency_ms} ms
- **Audit Duration**: ${report.scan_duration_ms} ms

---

## 🔎 OWASP API Top 10 Findings Summary
${report.findings
  .map(
    (f, idx) => `
### ${idx + 1}. [${f.severity}] ${f.title}
- **Category**: ${f.owasp_category}
- **Threat & Impact**: ${f.impact}
- **Evidence**: ${f.evidence}
- **Reproduction**:
\`\`\`bash
${f.reproduction_curl}
\`\`\`
- **Remediation**: ${f.remediation}
`
  )
  .join('\n')}

---
*Generated automatically by APIShield Security Engine — https://apishield-pi.vercel.app/*
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdown());
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl rounded-2xl p-6 sm:p-8 shadow-2xl my-auto transition-all ${
          isMinimal
            ? 'bg-[#F4F1EA] border border-[#D8D2C5] text-[#2C2924]'
            : 'glass-panel border-white/20 text-white'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                isMinimal ? 'bg-[#2C2924] text-white' : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
              }`}
            >
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-mono font-extrabold text-base sm:text-lg">
                Executive Pentest Dossier Export
              </h3>
              <p className="font-mono text-xs text-slate-400">
                Official security compliance artifact ready for stakeholder review
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isMinimal ? 'hover:bg-[#EAE5DB]' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dossier Preview Sheet */}
        <div
          className={`p-6 rounded-xl font-mono text-xs border max-h-[60vh] overflow-y-auto space-y-5 ${
            isMinimal
              ? 'bg-white border-[#D8D2C5] text-[#2C2924]'
              : 'bg-black/60 border-white/10 text-slate-200'
          }`}
        >
          {/* Cover Header */}
          <div className="border-b pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-white/10">
            <div>
              <div className="text-cyan-400 font-bold text-sm tracking-wide">
                APISHIELD SECURITY ASSESSMENT REPORT
              </div>
              <div className="text-slate-400 text-[11px] mt-0.5">
                Target: {report.http_method} {report.target_url}
              </div>
            </div>
            <div className="text-right font-mono text-[11px] text-slate-400">
              <div>Auditor: Arfa Danial (@nyzxis)</div>
              <div>Standards: OWASP API Top 10 (2023)</div>
            </div>
          </div>

          {/* Metrics Overview Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] text-slate-400 uppercase">Security Score</div>
              <div className="text-base font-bold text-cyan-400">{report.score} / 100</div>
            </div>
            <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] text-slate-400 uppercase">Letter Grade</div>
              <div className="text-base font-bold">{report.grade}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] text-slate-400 uppercase">Risk Level</div>
              <div className="text-base font-bold text-rose-400">{report.risk_level}</div>
            </div>
            <div className="p-2.5 rounded-lg border border-white/10 bg-white/[0.02]">
              <div className="text-[10px] text-slate-400 uppercase">Total Findings</div>
              <div className="text-base font-bold">{report.total_findings}</div>
            </div>
          </div>

          {/* Findings Summary Listing */}
          <div>
            <div className="font-bold text-xs uppercase tracking-wider mb-2 text-slate-400">
              Identified Vulnerability Catalog ({report.findings.length})
            </div>
            <div className="space-y-2">
              {report.findings.map((f, i) => (
                <div
                  key={f.id}
                  className="p-3 rounded-lg border border-white/5 bg-white/[0.01] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300">
                      #{i + 1} {f.title}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-rose-400 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                      {f.severity}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{f.owasp_category}</div>
                  <div className="text-slate-300 text-[11px] pt-1">{f.impact}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
          <button
            onClick={handleCopyMarkdown}
            className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-mono text-xs font-bold border transition-colors cursor-pointer ${
              copiedMd
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                : isMinimal
                ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                : 'bg-white/[0.05] border-white/10 text-slate-200 hover:text-white hover:border-white/20'
            }`}
          >
            {copiedMd ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied Markdown!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy Markdown Dossier
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handlePrint}
              className={`w-full sm:w-auto flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                isMinimal
                  ? 'bg-[#2C2924] text-white hover:bg-[#3D3933]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
