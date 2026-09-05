import React from 'react';
import { Shield, Github, Sun, Moon, FileText, Database, Radio } from 'lucide-react';
import { ThemeMode } from '../types';

interface NavbarProps {
  theme: ThemeMode;
  onToggleTheme: () => void;
  serverStatus: {
    status: string;
    database_backend: string;
    owasp_version: string;
  };
  onOpenExport: () => void;
  hasScanReport: boolean;
}

export default function Navbar({
  theme,
  onToggleTheme,
  serverStatus,
  onOpenExport,
  hasScanReport
}: NavbarProps) {
  const isMinimal = theme === 'minimalist';

  return (
    <header className="sticky top-0 z-40 w-full px-4 pt-2 pb-2 transition-colors duration-200">
      {/* Top Breadcrumb & Suite Navigation Strip */}
      <div className="max-w-7xl mx-auto mb-2 px-2 flex items-center justify-between font-mono text-[11px]">
        <div className="flex items-center gap-1.5">
          <a
            href="https://nyzxis.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className={`hover:underline flex items-center gap-1 ${
              isMinimal ? 'text-[#2C2924]/70 hover:text-[#2C2924]' : 'text-slate-400 hover:text-cyan-400'
            }`}
          >
            ✦ Arfa Danial / Portfolio
          </a>
          <span className="text-slate-500">›</span>
          <span className="text-slate-500 hidden md:inline">Cybersecurity Suite</span>
          <span className="text-slate-500 hidden md:inline">›</span>
          <span className={`font-bold ${isMinimal ? 'text-[#2C2924]' : 'text-cyan-300'}`}>APIShield</span>
        </div>

        {/* Cross-Suite Switcher Menu */}
        <div className="hidden sm:flex items-center gap-2 text-[10px]">
          <span className="text-slate-500">Suite:</span>
          <a href="https://malguard.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-amber-400">MalGuard</a>
          <span className="text-slate-600">•</span>
          <a href="https://vulnshield.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-cyan-400">VulnShield</a>
          <span className="text-slate-600">•</span>
          <a href="https://pwsec-nyz.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-emerald-400">KeyVault</a>
          <span className="text-slate-600">•</span>
          <a href="https://phishingdetector-nyzxis.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-rose-400">PhishGuard</a>
        </div>
      </div>

      <div
        className={`max-w-7xl mx-auto rounded-2xl px-4 py-2.5 flex items-center justify-between transition-all duration-200 ${
          isMinimal
            ? 'bg-[#F4F1EA]/90 border border-[#D8D2C5] shadow-sm backdrop-blur-md'
            : 'glass-panel'
        }`}
      >
        {/* Brand & Suite Identity */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-105 ${
              isMinimal
                ? 'bg-[#2C2924] text-[#F4F1EA]'
                : 'bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
            }`}
          >
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                className={`font-mono font-extrabold tracking-tight text-base sm:text-lg ${
                  isMinimal ? 'text-[#2C2924]' : 'text-white'
                }`}
              >
                APISHIELD
              </span>
              <span
                className={`hidden sm:inline-block text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full ${
                  isMinimal
                    ? 'bg-[#E5E0D5] text-[#2C2924]/80 border border-[#D8D2C5]'
                    : 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                }`}
              >
                OWASP TOP 10 (2023)
              </span>
            </div>
            <p
              className={`text-[11px] font-mono leading-tight ${
                isMinimal ? 'text-[#2C2924]/60' : 'text-slate-400'
              }`}
            >
              Automated API Security Pentesting Engine //{' '}
              <a
                href="https://github.com/nyzxis"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-cyan-400 transition-colors"
              >
                @nyzxis
              </a>
            </p>
          </div>
        </div>

        {/* Status & Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Server / DB Telemetry Badge */}
          <div
            className={`hidden md:flex items-center gap-2 px-3 py-1 rounded-xl text-xs font-mono transition-colors ${
              isMinimal
                ? 'bg-[#EAE5DB] border border-[#D8D2C5] text-[#2C2924]'
                : 'bg-white/[0.04] border border-white/10 text-slate-300'
            }`}
            title={`Database: ${serverStatus.database_backend}`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] truncate max-w-[140px]">
              {serverStatus.database_backend.includes('PostgreSQL') ? 'PostgreSQL' : 'Active DB'}
            </span>
          </div>

          {/* Export Executive Dossier Button */}
          {hasScanReport && (
            <button
              onClick={onOpenExport}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all duration-200 active:scale-95 cursor-pointer ${
                isMinimal
                  ? 'bg-[#2C2924] text-white hover:bg-[#3D3933]'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export Dossier</span>
            </button>
          )}

          {/* Dual-Theme Switcher */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle visual theme"
            className={`p-2 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
              isMinimal
                ? 'bg-[#EAE5DB] border border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                : 'bg-white/[0.05] border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
            title={`Switch to ${isMinimal ? 'Cyber Obsidian' : 'Minimalist Paper'} mode`}
          >
            {isMinimal ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-300" />}
          </button>

          {/* GitHub Source Link */}
          <a
            href="https://github.com/nyzxis/apishield"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source repository on GitHub"
            className={`p-2 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
              isMinimal
                ? 'bg-[#EAE5DB] border border-[#D8D2C5] text-[#2C2924] hover:bg-[#DFDAD0]'
                : 'bg-white/[0.05] border border-white/10 text-slate-200 hover:bg-white/10 hover:text-white'
            }`}
            title="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
