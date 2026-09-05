import { useState } from 'react';
import { Play, Sliders, RotateCcw, AlertCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { ThemeMode } from '../types';

interface TargetInputBarProps {
  targetUrl: string;
  setTargetUrl: (url: string) => void;
  method: string;
  setMethod: (method: string) => void;
  headersStr: string;
  setHeadersStr: (headers: string) => void;
  bodyStr: string;
  setBodyStr: (body: string) => void;
  onScan: () => void;
  scanning: boolean;
  theme: ThemeMode;
}

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'];

export default function TargetInputBar({
  targetUrl,
  setTargetUrl,
  method,
  setMethod,
  headersStr,
  setHeadersStr,
  bodyStr,
  setBodyStr,
  onScan,
  scanning,
  theme
}: TargetInputBarProps) {
  const isMinimal = theme === 'minimalist';
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleBodyChange = (val: string) => {
    setBodyStr(val);
    if (!val.trim()) {
      setJsonError(null);
      return;
    }
    try {
      JSON.parse(val);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
    }
  };

  const handleReset = () => {
    setTargetUrl('/api/mock/bank/account/101');
    setMethod('GET');
    setHeadersStr(JSON.stringify({ Authorization: 'Bearer token_account_alice_101' }, null, 2));
    setBodyStr('');
    setJsonError(null);
  };

  return (
    <div className="w-full">
      <div
        className={`rounded-2xl p-4 sm:p-5 transition-all duration-200 ${
          isMinimal ? 'minimalist-card' : 'glass-panel'
        }`}
      >
        {/* Main URL Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Method Selector */}
          <div className="relative shrink-0">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className={`w-full sm:w-auto appearance-none font-mono font-bold text-xs uppercase px-4 py-3 rounded-xl border focus:outline-none transition-colors cursor-pointer ${
                isMinimal
                  ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#E1DBD0]'
                  : 'bg-white/[0.06] border-white/10 text-cyan-300 hover:border-cyan-500/40 focus:border-cyan-400'
              }`}
            >
              {HTTP_METHODS.map((m) => (
                <option key={m} value={m} className={isMinimal ? 'bg-white text-black' : 'bg-[#080c18] text-white'}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Target URL Input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="e.g. /api/mock/bank/account/101 or https://api.example.com/v1/resource"
              disabled={scanning}
              className={`w-full font-mono text-sm px-4 py-3 rounded-xl border transition-all focus:outline-none ${
                isMinimal
                  ? 'bg-white border-[#D8D2C5] text-[#2C2924] placeholder-[#2C2924]/40 focus:border-[#2C2924]'
                  : 'bg-white/[0.04] border-white/10 text-white placeholder-slate-500 hover:border-white/20 focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/50'
              }`}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Toggle Advanced Config */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              aria-label="Toggle headers and body"
              className={`px-3 py-3 rounded-xl border text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer ${
                showAdvanced
                  ? isMinimal
                    ? 'bg-[#2C2924] text-white border-[#2C2924]'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                  : isMinimal
                  ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#E1DBD0]'
                  : 'bg-white/[0.04] border-white/10 text-slate-300 hover:border-white/20'
              }`}
              title="Configure Request Headers & Payload"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Payload</span>
            </button>

            {/* Reset Defaults */}
            <button
              onClick={handleReset}
              disabled={scanning}
              aria-label="Reset target to default"
              className={`p-3 rounded-xl border text-xs font-mono transition-colors cursor-pointer ${
                isMinimal
                  ? 'bg-[#EAE5DB] border-[#D8D2C5] text-[#2C2924] hover:bg-[#E1DBD0]'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white hover:border-white/20'
              }`}
              title="Reset target parameters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Execute Scan Primary Button */}
            <button
              onClick={onScan}
              disabled={scanning || !targetUrl.trim() || !!jsonError}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-mono font-bold text-xs uppercase tracking-wider transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                isMinimal
                  ? 'bg-[#2C2924] text-white hover:bg-[#3D3933] active:scale-95 shadow-sm'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95'
              }`}
            >
              {scanning ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Auditing OWASP...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Pentest</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Headers & Body Configuration */}
        {showAdvanced && (
          <div
            className={`mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-4 transition-all ${
              isMinimal ? 'border-[#D8D2C5]' : 'border-white/10'
            }`}
          >
            {/* Headers JSON Input */}
            <div>
              <label
                className={`block text-[11px] font-mono uppercase tracking-wider mb-1.5 ${
                  isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'
                }`}
              >
                Custom Request Headers (JSON)
              </label>
              <textarea
                rows={4}
                value={headersStr}
                onChange={(e) => setHeadersStr(e.target.value)}
                placeholder={'{\n  "Authorization": "Bearer token_alice",\n  "X-Custom-Header": "audit"\n}'}
                className={`w-full font-mono text-xs p-3 rounded-xl border focus:outline-none ${
                  isMinimal
                    ? 'bg-white border-[#D8D2C5] text-[#2C2924]'
                    : 'bg-black/40 border-white/10 text-cyan-200 placeholder-slate-600 focus:border-cyan-400'
                }`}
              />
            </div>

            {/* Payload Body Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className={`block text-[11px] font-mono uppercase tracking-wider ${
                    isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'
                  }`}
                >
                  Request Body Payload (JSON)
                </label>
                {jsonError && (
                  <span className="text-rose-400 text-[10px] font-mono flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Syntax Error
                  </span>
                )}
              </div>
              <textarea
                rows={4}
                value={bodyStr}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder={'{\n  "item": "Security Dongle",\n  "role": "admin"\n}'}
                className={`w-full font-mono text-xs p-3 rounded-xl border focus:outline-none ${
                  jsonError
                    ? 'border-rose-500/80 bg-rose-500/5'
                    : isMinimal
                    ? 'bg-white border-[#D8D2C5] text-[#2C2924]'
                    : 'bg-black/40 border-white/10 text-cyan-200 placeholder-slate-600 focus:border-cyan-400'
                }`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
