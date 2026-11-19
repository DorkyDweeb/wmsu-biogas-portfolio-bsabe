import React, { useState } from 'react';
import { Compass, GitBranch } from 'lucide-react';
import { ComponentId } from '../data/portfolioData';

interface TechnicalDiagramsProps {
  onInspectIn3D: (id: ComponentId) => void;
}

export const TechnicalDiagrams: React.FC<TechnicalDiagramsProps> = ({ onInspectIn3D }) => {
  const [activeTab, setActiveTab] = useState<'cross-section' | 'flowchart'>('cross-section');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
      {/* Segmented Control Toolbar */}
      <div className="border-b border-slate-800 px-5 py-3.5 flex flex-wrap items-center justify-between gap-4 bg-slate-950/70">
        <div>
          <p className="text-xs font-mono text-emerald-400/90">
            SIMULATED / ILLUSTRATIVE TECHNICAL DOCUMENTATION
          </p>
          <h4 className="text-sm font-semibold text-white mt-0.5">
            Engineering Cross-Section &amp; Process Mass-Flow Blueprints
          </h4>
        </div>

        <div className="no-print flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => setActiveTab('cross-section')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'cross-section'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Cross-Section Blueprint</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flowchart')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'flowchart'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Process Flowchart</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Cross-Section Blueprint */}
      {activeTab === 'cross-section' && (
        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4 text-xs text-slate-400">
            <span>
              Click any labeled structural unit in the schematic below to highlight and focus it in the 3D Digital Twin above.
            </span>
            <span className="font-mono text-slate-500">SCALE: ILLUSTRATIVE (NOT FOR CONSTRUCTION)</span>
          </div>

          <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 overflow-x-auto">
            <svg
              viewBox="0 0 960 430"
              className="w-full min-w-[720px] h-auto"
              role="img"
              aria-label="Simulated Fixed-Dome Biogas Plant Cross-Section Blueprint"
            >
              {/* Blueprint engineering grid */}
              <defs>
                <pattern id="bpGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
                </pattern>
              </defs>
              <rect width="960" height="430" fill="#0b1220" />
              <rect width="960" height="430" fill="url(#bpGrid)" />

              {/* Ground Datum Line */}
              <line x1="20" y1="240" x2="940" y2="240" stroke="#64748b" strokeWidth="1.5" strokeDasharray="6 4" />
              <text x="28" y="232" fill="#94a3b8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                FINISHED GRADE DATUM (EL. +0.00 m)
              </text>

              {/* Upslope French Drain Deficiency Callout */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('drainage-trench')}>
                <rect x="245" y="242" width="44" height="58" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="4 2" />
                <text x="200" y="220" fill="#fbbf24" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  [GAP] French Drain
                </text>
              </g>

              {/* Mixing Tank (Left) */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('mixing-tank')}>
                <rect x="70" y="185" width="125" height="95" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="78" y="210" width="109" height="62" fill="#115e59" opacity="0.65" />
                {/* Paddle stirrer */}
                <line x1="125" y1="168" x2="125" y2="262" stroke="#38bdf8" strokeWidth="2.5" />
                <line x1="105" y1="252" x2="145" y2="252" stroke="#38bdf8" strokeWidth="3" />
                <text x="70" y="156" fill="#e2e8f0" fontSize="11" fontWeight="600" fontFamily="Plus Jakarta Sans, sans-serif">
                  1. Mixing Tank (1.80 m³)
                </text>
                <text x="70" y="170" fill="#10b981" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  ● COMPLIANT
                </text>
              </g>

              {/* Inlet Pipe */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('inlet-pipe')}>
                <path d="M 195 256 L 340 335" stroke="#3b82f6" strokeWidth="14" strokeLinecap="round" fill="none" />
                <path d="M 195 256 L 340 335" stroke="#93c5fd" strokeWidth="2" strokeDasharray="5 5" fill="none" />
                <text x="200" y="328" fill="#93c5fd" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  150 mm uPVC @ 22°
                </text>
              </g>

              {/* Digester Cylindrical Shell + Baffle + Slurry */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('digester-shell')}>
                <rect x="330" y="210" width="290" height="165" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2.5" />
                {/* Slurry volume */}
                <rect x="338" y="248" width="274" height="119" fill="#0f766e" opacity="0.55" />
                {/* Central Baffle Wall */}
                <rect x="468" y="270" width="14" height="97" fill="#64748b" stroke="#e2e8f0" strokeWidth="1" />
                {/* Gravel Sub-base */}
                <rect x="322" y="375" width="306" height="18" fill="#475569" stroke="#94a3b8" strokeWidth="1" />

                {/* Dimension Callouts */}
                <line x1="338" y1="406" x2="612" y2="406" stroke="#38bdf8" strokeWidth="1" />
                <text x="415" y="420" fill="#38bdf8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  Ø 3.40 m INTERNAL (19.0 m³ SLURRY)
                </text>
                <text x="360" y="310" fill="#e2e8f0" fontSize="11" fontWeight="600">
                  Anaerobic Digester + Baffle
                </text>
                <text x="360" y="325" fill="#fbbf24" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  ▲ PARTIAL (Single-Coat Plaster)
                </text>
              </g>

              {/* Fixed-Dome Gas Chamber */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('gas-dome')}>
                <path
                  d="M 330 210 A 145 108 0 0 1 620 210 Z"
                  fill="#0f172a"
                  stroke="#cbd5e1"
                  strokeWidth="2.5"
                />
                <path
                  d="M 342 210 A 133 96 0 0 1 608 210"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                {/* Gas Turret */}
                <rect x="458" y="84" width="34" height="22" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
                <text x="392" y="168" fill="#5eead4" fontSize="11" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
                  GAS CHAMBER (4.80 m³)
                </text>
                <text x="398" y="184" fill="#fbbf24" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  CH₄ + CO₂ Headspace
                </text>
              </g>

              {/* Safety Skid & Gas Pipeline */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('safety-skid')}>
                <path d="M 475 84 L 475 52 L 730 52 L 730 112" stroke="#f59e0b" strokeWidth="3.5" fill="none" />
                <rect x="640" y="30" width="165" height="44" rx="4" fill="#450a0a" stroke="#ef4444" strokeWidth="1.5" />
                <text x="650" y="48" fill="#fca5a5" fontSize="10" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
                  ✖ NON-COMPLIANT GAP
                </text>
                <text x="650" y="63" fill="#fecaca" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
                  Missing Manometer / H₂S Trap
                </text>
              </g>

              {/* Outlet / Displacement Tank */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('outlet-tank')}>
                <path d="M 620 278 L 710 278" stroke="#3b82f6" strokeWidth="14" fill="none" />
                <rect x="710" y="196" width="145" height="128" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                <rect x="718" y="232" width="129" height="84" fill="#115e59" opacity="0.6" />
                <line x1="710" y1="196" x2="855" y2="196" stroke="#94a3b8" strokeWidth="3" strokeDasharray="8 4" />
                <text x="704" y="170" fill="#e2e8f0" fontSize="11" fontWeight="600">
                  Outlet Tank (4.03 m³)
                </text>
                <text x="704" y="185" fill="#10b981" fontSize="10" fontFamily="IBM Plex Mono, monospace">
                  ● COMPLIANT
                </text>
              </g>

              {/* Utilization Genset Skid */}
              <g className="cursor-pointer" onClick={() => onInspectIn3D('utilization-genset')}>
                <rect x="740" y="112" width="110" height="44" fill="#0f766e" stroke="#5eead4" strokeWidth="1.5" />
                <text x="752" y="138" fill="#ffffff" fontSize="10.5" fontWeight="600" fontFamily="IBM Plex Mono, monospace">
                  5 kVA Genset
                </text>
              </g>
            </svg>
          </div>
        </div>
      )}

      {/* Tab 2: Process Flowchart */}
      {activeTab === 'flowchart' && (
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-400">
            Simulated mass-balance and safety workflow mapping raw swine waste influent through anaerobic methanogenesis to dual gas/bio-slurry recovery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="font-mono text-slate-400">STAGE 01 · INFLUENT PREP</p>
              <h5 className="text-sm font-semibold text-white mt-1">
                120 Swine → 270 kg/d Manure + 270 L/d Water
              </h5>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Screened through 15 mm stainless-steel bar rack and grit sump inside the 1.80 m³ Mixing Tank, then gravity-fed via 150 mm uPVC at 22°.
              </p>
              <p className="mt-2 font-mono text-emerald-400">● PAES 413 Mixing &amp; Inlet Compliant</p>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="font-mono text-slate-400">STAGE 02 · ANAEROBIC REACTOR</p>
              <h5 className="text-sm font-semibold text-white mt-1">
                19.0 m³ Slurry Zone · 35.2-Day HRT
              </h5>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Central 1.20 m baffle prevents short-circuiting. Hydrolysis, acidogenesis, and methanogenesis yield simulated 9.5–11.2 m³/day biogas into 4.8 m³ dome.
              </p>
              <p className="mt-2 font-mono text-amber-400">▲ Needs Multi-Coat Gas-Proofing Sealant</p>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="font-mono text-slate-400">STAGE 03 · GAS &amp; SLUDGE RECOVERY</p>
              <h5 className="text-sm font-semibold text-white mt-1">
                5 kVA Genset + 4.03 m³ Displacement Pit
              </h5>
              <p className="text-slate-300 mt-2 leading-relaxed">
                Gas line currently lacks U-tube relief trap, flame arrestor, and H₂S scrubber (Non-Compliant). Stabilized effluent exits to outlet weir for bio-fertilizer use.
              </p>
              <p className="mt-2 font-mono text-rose-400">✖ Retrofit Safety Manifold Before Startup</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
