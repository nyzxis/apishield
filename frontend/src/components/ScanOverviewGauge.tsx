import { ScanReport, ThemeMode } from '../types';
import { ShieldAlert, ShieldCheck, Clock, CheckCircle2, Activity, Database, AlertTriangle } from 'lucide-react';

interface ScanOverviewGaugeProps {
  report: ScanReport;
  theme: ThemeMode;
}

export default function ScanOverviewGauge({ report, theme }: ScanOverviewGaugeProps) {
  const isMinimal = theme === 'minimalist';
  const score = Math.max(0, Math.min(100, Math.round(report.score)));

  // SVG circular gauge geometry
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Grade badge styling
  const getGradeColor = () => {
    if (score >= 90) return isMinimal ? 'text-emerald-800 bg-emerald-100 border-emerald-300' : 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (score >= 75) return isMinimal ? 'text-blue-800 bg-blue-100 border-blue-300' : 'text-blue-400 bg-blue-500/20 border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    if (score >= 60) return isMinimal ? 'text-amber-800 bg-amber-100 border-amber-300' : 'text-amber-400 bg-amber-500/20 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    return isMinimal ? 'text-rose-800 bg-rose-100 border-rose-300' : 'text-rose-400 bg-rose-500/20 border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]';
  };

  const getRiskColor = () => {
    switch (report.risk_level) {
      case 'CRITICAL':
        return isMinimal ? 'text-rose-800 bg-rose-100' : 'text-rose-400 bg-rose-500/15 border-rose-500/30';
      case 'HIGH':
        return isMinimal ? 'text-amber-800 bg-amber-100' : 'text-amber-400 bg-amber-500/15 border-amber-500/30';
      case 'MEDIUM':
        return isMinimal ? 'text-blue-800 bg-blue-100' : 'text-blue-400 bg-blue-500/15 border-blue-500/30';
      default:
        return isMinimal ? 'text-emerald-800 bg-emerald-100' : 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30';
    }
  };

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 transition-all duration-200 ${
        isMinimal ? 'minimalist-card' : 'glass-panel'
      }`}
    >
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
        {/* Left: Dial & Grade */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
            {/* SVG Meter */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className={isMinimal ? 'stroke-[#D8D2C5]' : 'stroke-white/10'}
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#f43f5e'}
                strokeWidth="10"
                fill="transparent"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Dial Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span
                className={`font-mono text-3xl font-extrabold tracking-tighter ${
                  isMinimal ? 'text-[#2C2924]' : 'text-white'
                }`}
              >
                {score}
              </span>
              <span
                className={`text-[10px] font-mono uppercase tracking-widest ${
                  isMinimal ? 'text-[#2C2924]/60' : 'text-slate-400'
                }`}
              >
                / 100 Score
              </span>
            </div>
          </div>

          {/* Posture & Letter Grade Summary */}
          <div className="text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <div
                className={`px-3 py-1 rounded-xl border text-xl font-mono font-extrabold ${getGradeColor()}`}
              >
                {report.grade}
              </div>
              <div
                className={`px-3 py-1 rounded-xl border text-xs font-mono font-bold uppercase tracking-wider ${getRiskColor()}`}
              >
                {report.risk_level} RISK
              </div>
            </div>

            <h3
              className={`font-mono text-base font-bold mb-1 ${
                isMinimal ? 'text-[#2C2924]' : 'text-white'
              }`}
            >
              {score >= 85
                ? 'Hardened Security Posture'
                : score >= 60
                ? 'Moderate Vulnerability Exposure'
                : 'Severe OWASP API Vulnerabilities Detected'}
            </h3>

            <p
              className={`text-xs max-w-md font-mono ${
                isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'
              }`}
            >
              Target: <span className="text-cyan-400 font-bold">{report.http_method}</span>{' '}
              <span className="break-all">{report.target_url}</span>
            </p>
          </div>
        </div>

        {/* Right: Telemetry Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2.5 w-full lg:w-auto">
          {/* Findings Count */}
          <div
            className={`p-3 rounded-xl border text-center ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase mb-1">
              <ShieldAlert className="w-3 h-3 text-rose-400" /> Findings
            </div>
            <div
              className={`font-mono font-bold text-lg ${
                report.total_findings > 0
                  ? isMinimal ? 'text-rose-700' : 'text-rose-400'
                  : isMinimal ? 'text-emerald-700' : 'text-emerald-400'
              }`}
            >
              {report.total_findings}
            </div>
          </div>

          {/* Response Status */}
          <div
            className={`p-3 rounded-xl border text-center ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase mb-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" /> HTTP Status
            </div>
            <div
              className={`font-mono font-bold text-lg ${
                report.response_status >= 200 && report.response_status < 300
                  ? 'text-cyan-400'
                  : report.response_status >= 400
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {report.response_status || 'ERR'}
            </div>
          </div>

          {/* Latency ms */}
          <div
            className={`p-3 rounded-xl border text-center ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase mb-1">
              <Clock className="w-3 h-3 text-blue-400" /> Latency
            </div>
            <div className={`font-mono font-bold text-lg ${isMinimal ? 'text-[#2C2924]' : 'text-white'}`}>
              {report.latency_ms} <span className="text-xs text-slate-400">ms</span>
            </div>
          </div>

          {/* Scan Duration */}
          <div
            className={`p-3 rounded-xl border text-center ${
              isMinimal ? 'bg-[#EAE5DB] border-[#D8D2C5]' : 'bg-white/[0.03] border-white/10'
            }`}
          >
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] font-mono uppercase mb-1">
              <Activity className="w-3 h-3 text-purple-400" /> Audit Time
            </div>
            <div className={`font-mono font-bold text-lg ${isMinimal ? 'text-[#2C2924]' : 'text-white'}`}>
              {report.scan_duration_ms} <span className="text-xs text-slate-400">ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
