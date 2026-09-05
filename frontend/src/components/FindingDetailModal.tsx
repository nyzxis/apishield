import { useState, useEffect } from 'react';
import { Finding, ThemeMode } from '../types';
import { X, Copy, Check, Terminal, ShieldAlert, Wrench, AlertOctagon, FileCode } from 'lucide-react';

interface FindingDetailModalProps {
  finding: Finding | null;
  onClose: () => void;
  theme: ThemeMode;
}

export default function FindingDetailModal({ finding, onClose, theme }: FindingDetailModalProps) {
  const isMinimal = theme === 'minimalist';
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [copiedRemediation, setCopiedRemediation] = useState(false);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!finding) return null;

  const copyToClipboard = (text: string, type: 'curl' | 'remediation') => {
    navigator.clipboard.writeText(text);
    if (type === 'curl') {
      setCopiedCurl(true);
      setTimeout(() => setCopiedCurl(false), 2000);
    } else {
      setCopiedRemediation(true);
      setTimeout(() => setCopiedRemediation(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-2xl rounded-2xl p-5 sm:p-6 shadow-2xl my-auto transition-all ${
          isMinimal
            ? 'bg-[#F4F1EA] border border-[#D8D2C5] text-[#2C2924]'
            : 'glass-panel border-white/20 text-white'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10 mb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className={`font-mono text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border ${
                  finding.severity === 'CRITICAL'
                    ? isMinimal
                      ? 'bg-rose-100 text-rose-800 border-rose-300'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                    : finding.severity === 'HIGH'
                    ? isMinimal
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : isMinimal
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                }`}
              >
                {finding.severity} SEVERITY
              </span>
              <span className="font-mono text-xs text-slate-400">ID: {finding.id}</span>
            </div>
            <h3 className="font-mono font-bold text-base sm:text-lg leading-snug">
              {finding.title}
            </h3>
            <p className="font-mono text-xs text-cyan-400">{finding.owasp_category}</p>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isMinimal ? 'hover:bg-[#EAE5DB] text-[#2C2924]' : 'hover:bg-white/10 text-slate-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-1">
          {/* Impact Analysis */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-rose-400 mb-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> Threat & Impact Analysis
            </div>
            <div
              className={`p-3 rounded-xl text-xs leading-relaxed font-sans ${
                isMinimal ? 'bg-[#EAE5DB] text-[#2C2924]' : 'bg-white/[0.04] text-slate-300'
              }`}
            >
              {finding.impact}
            </div>
          </div>

          {/* Evidence */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 mb-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> Target Evidence & Probe Output
            </div>
            <div
              className={`p-3 rounded-xl font-mono text-xs break-all leading-relaxed ${
                isMinimal ? 'bg-[#EAE5DB] text-[#2C2924]' : 'bg-black/50 border border-white/5 text-amber-200/90'
              }`}
            >
              {finding.evidence}
            </div>
          </div>

          {/* Reproduction Curl Command */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                <Terminal className="w-3.5 h-3.5" /> Exploit Reproduction (cURL)
              </div>
              <button
                onClick={() => copyToClipboard(finding.reproduction_curl, 'curl')}
                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  copiedCurl
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isMinimal
                    ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                    : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {copiedCurl ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy cURL
                  </>
                )}
              </button>
            </div>
            <pre
              className={`p-3 rounded-xl font-mono text-xs overflow-x-auto ${
                isMinimal ? 'bg-[#EAE5DB] text-[#2C2924]' : 'bg-black/60 border border-white/10 text-cyan-300'
              }`}
            >
              <code>{finding.reproduction_curl}</code>
            </pre>
          </div>

          {/* Enterprise Remediation Guidance */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                <Wrench className="w-3.5 h-3.5" /> Enterprise Remediation Fix
              </div>
              <button
                onClick={() => copyToClipboard(finding.remediation, 'remediation')}
                className={`flex items-center gap-1 text-[11px] font-mono px-2 py-1 rounded-lg border transition-all cursor-pointer ${
                  copiedRemediation
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : isMinimal
                    ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                    : 'bg-white/[0.05] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                {copiedRemediation ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Copy Fix
                  </>
                )}
              </button>
            </div>
            <div
              className={`p-3 rounded-xl font-sans text-xs leading-relaxed border ${
                isMinimal
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-emerald-950/20 border-emerald-500/20 text-emerald-300'
              }`}
            >
              {finding.remediation}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="mt-5 pt-3 border-t border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl font-mono text-xs font-bold transition-colors cursor-pointer ${
              isMinimal
                ? 'bg-[#2C2924] text-white hover:bg-[#3D3933]'
                : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
}
