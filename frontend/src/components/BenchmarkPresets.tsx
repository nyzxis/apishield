import { BenchmarkPreset, ThemeMode } from '../types';
import { Landmark, ShoppingCart, Activity, ShieldCheck, ArrowUpRight, Zap } from 'lucide-react';

interface BenchmarkPresetsProps {
  benchmarks: BenchmarkPreset[];
  onSelectPreset: (preset: BenchmarkPreset, autoScan?: boolean) => void;
  activeId: string | null;
  theme: ThemeMode;
}

const PRESET_ICONS: Record<string, any> = {
  'broken-bank-bola': Landmark,
  'ecommerce-mass-assignment': ShoppingCart,
  'healthcare-jwt-bypass': Activity,
  'hardened-enterprise': ShieldCheck
};

export default function BenchmarkPresets({
  benchmarks,
  onSelectPreset,
  activeId,
  theme
}: BenchmarkPresetsProps) {
  const isMinimal = theme === 'minimalist';

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap
            className={`w-4 h-4 ${isMinimal ? 'text-[#2C2924]' : 'text-cyan-400 animate-pulse'}`}
          />
          <h2
            className={`text-xs font-mono font-bold uppercase tracking-wider ${
              isMinimal ? 'text-[#2C2924]' : 'text-slate-200'
            }`}
          >
            One-Click Vulnerability Benchmarks (Sandbox Playground)
          </h2>
        </div>
        <span
          className={`text-[11px] font-mono hidden sm:inline ${
            isMinimal ? 'text-[#2C2924]/60' : 'text-slate-400'
          }`}
        >
          Select a live OWASP target to reproduce exploits
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {benchmarks.map((preset) => {
          const Icon = PRESET_ICONS[preset.id] || Landmark;
          const isActive = activeId === preset.id;
          const isHardened = preset.id === 'hardened-enterprise';

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset, true)}
              className={`group relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                isMinimal
                  ? isActive
                    ? 'bg-[#EAE5DB] border-[#2C2924] shadow-md ring-2 ring-[#2C2924]/20'
                    : 'bg-[#F4F1EA] border-[#D8D2C5] hover:border-[#2C2924]/40 hover:bg-[#EAE5DB]/60'
                  : isActive
                  ? 'bg-gradient-to-b from-cyan-950/40 to-blue-950/30 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400'
                  : 'glass-panel-interactive border-white/10 hover:border-cyan-500/30'
              }`}
            >
              <div>
                {/* Header row with Icon & Category */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isHardened
                        ? isMinimal
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : preset.severity === 'CRITICAL'
                        ? isMinimal
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : isMinimal
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isHardened
                        ? isMinimal
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : preset.severity === 'CRITICAL'
                        ? isMinimal
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        : isMinimal
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {preset.category}
                  </span>
                </div>

                {/* Title and Subtitle */}
                <h3
                  className={`font-mono font-bold text-sm leading-tight mb-1 group-hover:text-cyan-400 transition-colors ${
                    isMinimal ? 'text-[#2C2924]' : 'text-slate-100'
                  }`}
                >
                  {preset.title}
                </h3>
                <p
                  className={`text-xs leading-relaxed line-clamp-2 mb-3 ${
                    isMinimal ? 'text-[#2C2924]/70' : 'text-slate-400'
                  }`}
                >
                  {preset.subtitle}
                </p>
              </div>

              {/* Bottom Target URI & Action */}
              <div
                className={`pt-2 border-t flex items-center justify-between font-mono text-[11px] ${
                  isMinimal ? 'border-[#D8D2C5] text-[#2C2924]/80' : 'border-white/10 text-slate-400'
                }`}
              >
                <span className="truncate max-w-[170px] text-cyan-400/90 font-medium">
                  {preset.method} {preset.target_url}
                </span>
                <span className="flex items-center gap-0.5 text-xs text-cyan-400 font-bold group-hover:translate-x-0.5 transition-transform">
                  Launch <ArrowUpRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
