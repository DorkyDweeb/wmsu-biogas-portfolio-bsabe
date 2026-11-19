import React from 'react';
import { ComponentId, IllustrationVariant } from '../data/portfolioData';

export type IllustrationKey = IllustrationVariant;

export function getIllustrationKey(componentId: ComponentId): IllustrationKey {
  switch (componentId) {
    case 'substrate-source':
    case 'feeding-channel':
      return 'substrate-channel';
    case 'mixing-tank':
    case 'inlet-pipe':
      return 'inlet-conduit';
    case 'drainage-trench':
      return 'plant-layout-3d';
    case 'safety-skid':
      return 'safety-manifold';
    case 'utilization-genset':
      return 'utilization-genset';
    case 'digester-shell':
    case 'gas-dome':
    case 'outlet-tank':
    default:
      return 'digester-cutaway';
  }
}

interface SubsystemIllustrationProps {
  variant: IllustrationKey;
  className?: string;
}

export const SubsystemIllustration: React.FC<SubsystemIllustrationProps> = ({
  variant,
  className = 'w-full h-full',
}) => {
  if (variant === 'substrate-channel') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="CAD elevation of Green Pastures swine housing substrate source and 0.4% concrete feeding channel"
      >
        <defs>
          <pattern id="cadGridSub" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGridSub)" />

        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 01 · SUBSTRATE SOURCE &amp; 0.4% CONCRETE FEEDING CHANNEL
        </text>
        <text x="620" y="26" textAnchor="end" fill="#fb7185" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          ✖ PAES SEC 7.1.1 NON-COMPLIANT
        </text>

        {/* Concrete Plant Pad Datum matching 3D West Apron */}
        <line x1="20" y1="336" x2="620" y2="336" stroke="#64748b" strokeWidth="1.4" strokeDasharray="6 4" />
        <text x="26" y="326" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          CONCRETE PAD EL. +0.16 m (3D MODEL WEST APRON)
        </text>

        {/* Swine Housing / Substrate Source Bay (left) */}
        <rect x="34" y="180" width="136" height="156" fill="#334155" stroke="#cbd5e1" strokeWidth="2" />
        {/* Galvanized Pen Guard Rail Posts & Yellow Top Rail matching 3D */}
        <line x1="48" y1="128" x2="48" y2="180" stroke="#cbd5e1" strokeWidth="4" />
        <line x1="154" y1="128" x2="154" y2="180" stroke="#cbd5e1" strokeWidth="4" />
        <line x1="42" y1="136" x2="160" y2="136" stroke="#eab308" strokeWidth="5" />
        {/* Manure Washdown Sump */}
        <rect x="64" y="216" width="96" height="28" fill="#115e59" stroke="#2dd4bf" strokeWidth="1.2" />
        <text x="102" y="114" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          1. Substrate Source
        </text>
        <text x="102" y="164" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="IBM Plex Sans, sans-serif">
          Swine Pen Washdown
        </text>

        {/* 0.4% Nearly Flat Concrete Feeding Channel */}
        <polygon points="170,224 468,228 468,266 170,266" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
        {/* Settled Slurry & Solid Accumulation inside flat channel */}
        <polygon points="170,236 468,240 468,254 170,254" fill="#115e59" opacity="0.85" />
        <circle cx="240" cy="247" r="4" fill="#fbbf24" opacity="0.7" />
        <circle cx="315" cy="248" r="5" fill="#fbbf24" opacity="0.7" />
        <circle cx="395" cy="249" r="4" fill="#fbbf24" opacity="0.7" />

        {/* Red Required 2.0% Slope Reference Line matching 3D comparison bar */}
        <line x1="170" y1="172" x2="468" y2="226" stroke="#ef4444" strokeWidth="2.5" strokeDasharray="6 4" />
        <text x="320" y="168" textAnchor="middle" fill="#fb7185" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          PAES 413 Sec. 7.1.1 Min Slope: 2.0% (0.02 m/m)
        </text>
        <text x="320" y="286" textAnchor="middle" fill="#fbbf24" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          Measured Channel Slope: ~0.4% (0.004 m/m) — Settling Risk
        </text>

        {/* Collecting Tank Entry (right) */}
        <rect x="468" y="196" width="136" height="140" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="478" y="236" width="116" height="90" fill="#115e59" opacity="0.68" />
        <text x="536" y="182" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          3. Collecting Tank
        </text>

        {/* Diagnostic Note Box */}
        <rect x="34" y="366" width="570" height="84" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <text x="52" y="390" fill="#5eead4" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          3D MODEL LINK · GREEN PASTURES SUBSTRATE DELIVERY (HOTSPOT 01)
        </text>
        <text x="52" y="412" fill="#e2e8f0" fontSize="10" fontFamily="IBM Plex Sans, sans-serif">
          Nearly flat 0.4% feeder trench reduces gravitational driving force, causing high-solid swine manure to settle before reaching the collecting tank.
        </text>
        <text x="52" y="432" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          Flow: Pig Manure Collection → Concrete Feeding Channel (0.4%) → Collecting Tank
        </text>
      </svg>
    );
  }

  if (variant === 'inlet-conduit') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="CAD cross-section of collecting tank and undersized 0.06 m PVC inlet pipe entering the anaerobic digester"
      >
        <defs>
          <pattern id="cadGridInlet" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGridInlet)" />

        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 02 · COLLECTING TANK &amp; 0.06 m (6 cm) PVC INLET PIPE
        </text>
        <text x="620" y="26" textAnchor="end" fill="#fb7185" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          ✖ PAES SEC 6.2 NON-COMPLIANT
        </text>

        {/* Grade datum */}
        <line x1="20" y1="242" x2="620" y2="242" stroke="#64748b" strokeWidth="1.2" strokeDasharray="6 4" />

        {/* Collecting Tank with Agitator & Screen matching 3D */}
        <rect x="46" y="160" width="186" height="162" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="58" y="206" width="162" height="104" fill="#115e59" opacity="0.65" />
        <rect x="40" y="130" width="198" height="10" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.2" />
        <rect x="114" y="100" width="28" height="30" rx="3" fill="#d97706" stroke="#fde68a" strokeWidth="1.2" />
        <line x1="128" y1="140" x2="128" y2="280" stroke="#38bdf8" strokeWidth="3.5" />
        <rect x="92" y="258" width="72" height="8" fill="#38bdf8" />
        <line x1="186" y1="176" x2="174" y2="298" stroke="#e2e8f0" strokeWidth="3.5" strokeDasharray="5 3" />
        <text x="139" y="88" textAnchor="middle" fill="#f8fafc" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          Collecting Tank
        </text>

        {/* Red Dashed PAES 0.20 m (20 cm) Required Bore Envelope matching 3D Wireframe Sleeve */}
        <line x1="232" y1="274" x2="462" y2="334" stroke="#ef4444" strokeWidth="32" strokeOpacity="0.22" />
        <line x1="232" y1="258" x2="462" y2="318" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6 4" />
        <line x1="232" y1="290" x2="462" y2="350" stroke="#ef4444" strokeWidth="1.8" strokeDasharray="6 4" />

        {/* Actual Slender 0.06 m (6 cm) White PVC Inlet Pipe matching 3D */}
        <line x1="232" y1="274" x2="462" y2="334" stroke="#e2e8f0" strokeWidth="8" strokeLinecap="round" />
        <rect x="352" y="278" width="12" height="44" transform="rotate(14 358 300)" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1.2" />

        {/* Anaerobic Digester Entry Wall */}
        <rect x="462" y="196" width="24" height="190" fill="#475569" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="486" y="236" width="112" height="150" fill="#115e59" opacity="0.55" />
        <line x1="486" y1="236" x2="598" y2="236" stroke="#2dd4bf" strokeWidth="2" />
        <text x="542" y="184" textAnchor="middle" fill="#5eead4" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          Anaerobic Digester
        </text>

        {/* Cross-Section Diameter Comparison Inset */}
        <rect x="46" y="366" width="552" height="88" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <circle cx="104" cy="410" r="28" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="104" cy="410" r="8.5" fill="#e2e8f0" />
        <text x="150" y="394" fill="#fb7185" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          BORE COMPARISON (HOTSPOT 02 · PAES 413 SEC. 6.2)
        </text>
        <text x="150" y="414" fill="#e2e8f0" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          • Outer Red Ring: 0.20 m (200 mm / 20 cm) PAES Minimum Required Diameter
        </text>
        <text x="150" y="434" fill="#cbd5e1" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          • Inner Solid Circle: 0.06 m (60 mm / 6 cm) Simulated PVC Pipe (~9% area)
        </text>
      </svg>
    );
  }

  if (variant === 'plant-layout-3d') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="Integrated 3D plant layout plan for Green Pastures Swine Farm biogas plant"
      >
        <defs>
          <pattern id="cadGridPlan" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGridPlan)" />

        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 04 · GREEN PASTURES 3D PLANT SITE &amp; PROCESS PLAN
        </text>
        <text x="620" y="26" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          BRGY. SAN ROQUE, ZAMBOANGA CITY
        </text>

        {/* Concrete Pad Outline matching extended 3D pad */}
        <rect x="28" y="84" width="584" height="270" rx="8" fill="#1e293b" fillOpacity="0.45" stroke="#475569" strokeWidth="1.5" strokeDasharray="6 4" />

        {/* 1. Swine Pen Source */}
        <rect x="44" y="210" width="64" height="82" fill="#334155" stroke="#cbd5e1" strokeWidth="1.6" />
        <text x="76" y="308" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          01 Source
        </text>

        {/* 2. 0.4% Feeding Channel */}
        <rect x="108" y="240" width="76" height="22" fill="#475569" stroke="#ef4444" strokeWidth="1.8" />
        <text x="146" y="230" textAnchor="middle" fill="#fb7185" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
          0.4% Channel
        </text>

        {/* 3. Collecting Tank */}
        <rect x="184" y="218" width="64" height="66" fill="#0f2936" stroke="#ef4444" strokeWidth="1.8" />
        <text x="216" y="302" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          Collecting
        </text>

        {/* 4. 0.06 m PVC Inlet */}
        <line x1="248" y1="251" x2="310" y2="251" stroke="#ef4444" strokeWidth="12" strokeOpacity="0.25" />
        <line x1="248" y1="251" x2="310" y2="251" stroke="#e2e8f0" strokeWidth="4" />
        <text x="279" y="236" textAnchor="middle" fill="#fb7185" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
          0.06m PVC
        </text>

        {/* 5. Anaerobic Digester & Dome */}
        <circle cx="372" cy="251" r="62" fill="#115e59" fillOpacity="0.45" stroke="#5eead4" strokeWidth="2.2" />
        <line x1="372" y1="196" x2="372" y2="306" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 3" />
        <circle cx="372" cy="251" r="14" fill="#475569" stroke="#f59e0b" strokeWidth="2" />
        <text x="372" y="330" textAnchor="middle" fill="#5eead4" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          Anaerobic Digester
        </text>

        {/* Outlet Pipe & Pit */}
        <line x1="434" y1="251" x2="496" y2="251" stroke="#3b82f6" strokeWidth="7" />
        <rect x="496" y="216" width="68" height="70" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.6" />
        <text x="530" y="304" textAnchor="middle" fill="#cbd5e1" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          Outlet Pit
        </text>

        {/* Biogas Line to Safety Skid & Utilization Pad */}
        <path d="M 372 237 L 420 140 L 520 118" fill="none" stroke="#f59e0b" strokeWidth="3.5" />
        <rect x="404" y="122" width="44" height="34" fill="#1e293b" stroke="#fbbf24" strokeWidth="1.4" />
        <text x="426" y="112" textAnchor="middle" fill="#fde68a" fontSize="8.5" fontFamily="IBM Plex Mono, monospace">
          Safety Skid
        </text>
        <rect x="504" y="96" width="84" height="48" fill="#0f766e" stroke="#5eead4" strokeWidth="1.5" />
        <text x="546" y="124" textAnchor="middle" fill="#ffffff" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          Utilization
        </text>

        {/* Legend Footer */}
        <rect x="28" y="374" width="584" height="76" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <text x="46" y="398" fill="#5eead4" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          3.4 PROCESS FLOW ALIGNED WITH 3D DIGITAL TWIN
        </text>
        <text x="46" y="420" fill="#e2e8f0" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Pig Manure Collection → Concrete Channel (0.4%) → Collecting Tank → Inlet Pipe (0.06 m) → Digester
        </text>
        <text x="46" y="438" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Sans, sans-serif">
          Red highlights denote Green Pastures Parts 2–4 evaluated deficiencies (PAES 413 Sec. 6.2 &amp; Sec. 7.1.1).
        </text>
      </svg>
    );
  }

  if (variant === 'digester-cutaway') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="CAD engineering cutaway of the anaerobic digester and fixed-dome gas chamber receiving the 0.06 m PVC inlet"
      >
        <defs>
          <pattern id="cadGrid1" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
          <pattern id="rcHatch1" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="#64748b" strokeWidth="1.2" opacity="0.45" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGrid1)" />

        {/* Title block corner */}
        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 03 · ANAEROBIC DIGESTER &amp; FIXED-DOME CUTAWAY (3D MODEL)
        </text>
        <text x="620" y="26" textAnchor="end" fill="#94a3b8" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          CAPACITY: PENDING DESIGN
        </text>

        {/* Ground datum */}
        <line x1="24" y1="226" x2="616" y2="226" stroke="#64748b" strokeWidth="1.2" strokeDasharray="6 4" />
        <text x="28" y="218" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          GRADE EL. +0.00 m
        </text>

        {/* Gravel bedding sub-base */}
        <rect x="135" y="406" width="370" height="16" fill="#334155" stroke="#94a3b8" strokeWidth="1" />
        <text x="320" y="418" textAnchor="middle" fill="#cbd5e1" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          COMPACTED GRAVEL SUB-BASE
        </text>

        {/* Left incoming 0.06 m PVC inlet pipe entering digester (matches 3D model) */}
        <line x1="36" y1="268" x2="167" y2="316" stroke="#ef4444" strokeWidth="22" strokeOpacity="0.22" />
        <line x1="36" y1="268" x2="167" y2="316" stroke="#e2e8f0" strokeWidth="6" strokeLinecap="round" />
        <text x="92" y="258" textAnchor="middle" fill="#fb7185" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          0.06 m PVC Inlet
        </text>

        {/* Reinforced concrete base slab & walls */}
        <rect x="145" y="388" width="350" height="18" fill="url(#rcHatch1)" stroke="#cbd5e1" strokeWidth="1.8" />
        <rect x="145" y="210" width="22" height="178" fill="url(#rcHatch1)" stroke="#cbd5e1" strokeWidth="1.8" />
        <rect x="473" y="210" width="22" height="178" fill="url(#rcHatch1)" stroke="#cbd5e1" strokeWidth="1.8" />

        {/* Hemispherical Concrete Dome */}
        <path
          d="M 145 210 A 175 130 0 0 1 495 210 L 473 210 A 153 110 0 0 0 167 210 Z"
          fill="url(#rcHatch1)"
          stroke="#cbd5e1"
          strokeWidth="1.8"
        />

        {/* Gas Headspace & Teal Gas-Proofing Membrane */}
        <path d="M 167 210 A 153 110 0 0 1 473 210 L 473 242 L 167 242 Z" fill="#0f2936" />
        <path
          d="M 172 210 A 148 105 0 0 1 468 210"
          fill="none"
          stroke="#2dd4bf"
          strokeWidth="2.5"
          strokeDasharray="6 3"
        />

        {/* Anaerobic Slurry Body */}
        <rect x="167" y="242" width="306" height="146" fill="#115e59" opacity="0.58" />
        <line x1="167" y1="242" x2="473" y2="242" stroke="#2dd4bf" strokeWidth="2" />

        {/* Central Baffle Wall */}
        <rect x="313" y="264" width="14" height="124" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.5" />

        {/* Rising Methane Bubbles */}
        {[
          [210, 355, 4], [235, 320, 5], [260, 285, 3.5], [285, 345, 4.5],
          [245, 260, 3], [360, 350, 4], [390, 310, 5], [420, 275, 4], [440, 335, 3.5],
        ].map(([cx, cy, r], i) => (
          <circle key={i} cx={cx} cy={cy} r={r} fill="#5eead4" opacity="0.85" />
        ))}

        {/* Gas Dome Turret & Brass Main Valve */}
        <rect x="298" y="64" width="44" height="20" fill="#475569" stroke="#e2e8f0" strokeWidth="1.5" />
        <line x1="320" y1="64" x2="320" y2="42" stroke="#f59e0b" strokeWidth="4" />
        <line x1="320" y1="42" x2="455" y2="42" stroke="#f59e0b" strokeWidth="4" />
        <circle cx="320" cy="48" r="6" fill="#dc2626" stroke="#fecaca" strokeWidth="1.5" />

        {/* Outlet connecting pipe */}
        <rect x="473" y="268" width="65" height="16" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1.2" />
        <rect x="538" y="216" width="68" height="96" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.6" />
        <rect x="544" y="250" width="56" height="56" fill="#115e59" opacity="0.65" />

        {/* Clean Leader Labels */}
        <text x="320" y="156" textAnchor="middle" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          BIOGAS HEADSPACE (CH₄ + CO₂)
        </text>
        <text x="320" y="172" textAnchor="middle" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          Oxygen-Free Anaerobic Zone
        </text>
        <text x="240" y="314" textAnchor="middle" fill="#e2e8f0" fontSize="10.5" fontFamily="IBM Plex Sans, sans-serif">
          Digesting Slurry
        </text>
        <text x="320" y="256" textAnchor="middle" fill="#f8fafc" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Baffle Wall
        </text>
        <text x="572" y="206" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Outlet Pit
        </text>
      </svg>
    );
  }

  if (variant === 'mixing-inlet') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="CAD engineering schematic of Green Pastures 0.4% concrete feeding channel, collecting tank, and 0.06 m PVC inlet pipe"
      >
        <defs>
          <pattern id="cadGrid2" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGrid2)" />

        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 02 · GREEN PASTURES FEEDING CHANNEL & 0.06 m PVC INLET
        </text>
        <text x="620" y="26" textAnchor="end" fill="#fb7185" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          ✖ SEC 6.2 & SEC 7.1.1 NON-COMPLIANT
        </text>

        {/* Ground Datum */}
        <line x1="24" y1="258" x2="616" y2="258" stroke="#64748b" strokeWidth="1.2" strokeDasharray="6 4" />
        <text x="28" y="248" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          GRADE EL. +0.00 m
        </text>

        {/* 1. Substrate Source (Swine Housing Collection Point) */}
        <rect x="26" y="136" width="84" height="72" fill="#1e293b" stroke="#cbd5e1" strokeWidth="1.8" />
        <rect x="34" y="168" width="68" height="32" fill="#115e59" opacity="0.7" />
        <text x="68" y="122" textAnchor="middle" fill="#e2e8f0" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          Substrate Source
        </text>
        <text x="68" y="156" textAnchor="middle" fill="#94a3b8" fontSize="8.5" fontFamily="IBM Plex Sans, sans-serif">
          Swine Pen
        </text>

        {/* 2. Concrete Feeding Channel (Nearly flat 0.4% slope vs 2.0% PAES Req) */}
        <polygon points="110,180 250,183 250,208 110,208" fill="#334155" stroke="#cbd5e1" strokeWidth="1.6" />
        <line x1="110" y1="189" x2="250" y2="192" stroke="#2dd4bf" strokeWidth="3" />
        {/* Dashed red reference line showing required 2.0% slope */}
        <line x1="110" y1="158" x2="250" y2="184" stroke="#fb7185" strokeWidth="1.8" strokeDasharray="5 3" />
        <text x="180" y="148" textAnchor="middle" fill="#fb7185" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          PAES Req ≥ 2.0% Slope
        </text>
        <text x="180" y="226" textAnchor="middle" fill="#fbbf24" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
          Measured: 0.4% (Settling Risk)
        </text>

        {/* 3. Collecting Tank */}
        <rect x="250" y="156" width="128" height="154" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
        <rect x="260" y="198" width="108" height="100" fill="#115e59" opacity="0.65" />
        <text x="314" y="144" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Collecting Tank
        </text>

        {/* 4. Undersized 0.06 m (6 cm) PVC Inlet Pipe + 0.20 m PAES Comparison Envelope */}
        {/* Translucent red dashed envelope representing required 0.20 m bore */}
        <line x1="378" y1="278" x2="508" y2="338" stroke="#fb7185" strokeWidth="26" strokeOpacity="0.24" strokeLinecap="butt" />
        <line x1="378" y1="265" x2="508" y2="325" stroke="#fb7185" strokeWidth="1.4" strokeDasharray="5 4" />
        <line x1="378" y1="291" x2="508" y2="351" stroke="#fb7185" strokeWidth="1.4" strokeDasharray="5 4" />
        {/* Actual narrow 0.06 m PVC pipe */}
        <line x1="378" y1="278" x2="508" y2="338" stroke="#e2e8f0" strokeWidth="7" strokeLinecap="round" />

        {/* 5. Anaerobic Digester Wall Penetration */}
        <rect x="504" y="210" width="22" height="196" fill="#475569" stroke="#cbd5e1" strokeWidth="1.8" />
        <rect x="526" y="246" width="84" height="160" fill="#115e59" opacity="0.5" />
        <line x1="526" y1="246" x2="610" y2="246" stroke="#2dd4bf" strokeWidth="2" />
        <text x="568" y="200" textAnchor="middle" fill="#5eead4" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Digester
        </text>

        {/* Callout Box */}
        <rect x="26" y="346" width="440" height="106" rx="6" fill="#0f172a" stroke="#334155" strokeWidth="1.2" />
        <text x="42" y="370" fill="#fb7185" fontSize="10.5" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          SIMULATED AUDIT DEFICIENCIES (PAES 413:2001):
        </text>
        <text x="42" y="394" fill="#e2e8f0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          • Sec 6.2 Inlet Pipe: 0.06 m (6 cm) PVC  | Req: ≥ 0.20 m (20 cm)
        </text>
        <text x="42" y="418" fill="#e2e8f0" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          • Sec 7.1.1 Concrete Channel: 0.4% Slope | Req: ≥ 2.0% (0.02 m/m)
        </text>
        <text x="42" y="440" fill="#94a3b8" fontSize="9.5" fontFamily="IBM Plex Sans, sans-serif">
          Restricted bore & low gravitational fall risk solids settling and clogging.
        </text>
      </svg>
    );
  }

  if (variant === 'safety-manifold') {
    return (
      <svg
        viewBox="0 0 640 480"
        className={className}
        role="img"
        aria-label="CAD P&ID schematic of the PAES 413 gas safety manifold, manometer, condensate trap, and H2S scrubber"
      >
        <defs>
          <pattern id="cadGrid3" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
          </pattern>
        </defs>

        <rect width="640" height="480" fill="#0b1220" />
        <rect width="640" height="480" fill="url(#cadGrid3)" />

        <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          FIG 03 · GAS CONDITIONING & SAFETY MANIFOLD
        </text>
        <text x="620" y="26" textAnchor="end" fill="#fb7185" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          ✖ BASELINE MISSING RETROFITS
        </text>

        {/* Steel Skid Frame */}
        <rect x="44" y="100" width="552" height="280" rx="8" fill="none" stroke="#475569" strokeWidth="4" />
        <line x1="44" y1="340" x2="596" y2="340" stroke="#475569" strokeWidth="6" />

        {/* Main Biogas Pipeline */}
        <line x1="24" y1="220" x2="170" y2="220" stroke="#f59e0b" strokeWidth="10" />
        <line x1="240" y1="220" x2="310" y2="220" stroke="#f59e0b" strokeWidth="10" />
        <line x1="350" y1="220" x2="430" y2="220" stroke="#f59e0b" strokeWidth="10" />
        <line x1="505" y1="220" x2="616" y2="220" stroke="#f59e0b" strokeWidth="10" />

        {/* 1. Brass Main Isolation Valve (Present in Baseline) */}
        <circle cx="96" cy="220" r="18" fill="#d97706" stroke="#fde68a" strokeWidth="2" />
        <line x1="96" y1="194" x2="96" y2="202" stroke="#ef4444" strokeWidth="4" />
        <line x1="80" y1="194" x2="112" y2="194" stroke="#ef4444" strokeWidth="4" />
        <text x="96" y="256" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Main Valve (Present)
        </text>

        {/* 2. Iron-Sponge H2S Scrubber Vessel (Retrofit) */}
        <rect x="170" y="135" width="70" height="175" rx="8" fill="#7f1d1d" stroke="#f87171" strokeWidth="2" />
        <rect x="178" y="165" width="54" height="115" fill="#991b1b" stroke="#fca5a5" strokeWidth="1" strokeDasharray="4 3" />
        <text x="205" y="218" textAnchor="middle" fill="#fee2e2" fontSize="10" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
          Fe₂O₃
        </text>
        <text x="205" y="233" textAnchor="middle" fill="#fecaca" fontSize="9" fontFamily="IBM Plex Mono, monospace">
          Scrubber
        </text>
        <text x="205" y="328" textAnchor="middle" fill="#fca5a5" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          H₂S Stripper
        </text>

        {/* 3. Low-Point Condensate Water Trap */}
        <rect x="310" y="205" width="40" height="115" rx="6" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        <rect x="316" y="275" width="28" height="39" fill="#0284c7" opacity="0.7" />
        <text x="330" y="338" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Condensate Trap
        </text>

        {/* 4. U-Tube Water Manometer & Blow-Off Relief Leg */}
        <line x1="275" y1="220" x2="275" y2="120" stroke="#f59e0b" strokeWidth="4" />
        <path
          d="M 262 118 L 262 185 A 13 13 0 0 0 288 185 L 288 118"
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="4"
        />
        <path
          d="M 262 155 L 262 185 A 13 13 0 0 0 288 185 L 288 140"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="3"
        />
        <text x="275" y="88" textAnchor="middle" fill="#5eead4" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          U-Tube Relief (900 mm H₂O)
        </text>

        {/* 5. Inline Brass Wire-Mesh Flame Arrestor */}
        <rect x="430" y="198" width="75" height="44" rx="4" fill="#92400e" stroke="#fbbf24" strokeWidth="2" />
        <line x1="445" y1="200" x2="445" y2="240" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="467" y1="200" x2="467" y2="240" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 2" />
        <line x1="490" y1="200" x2="490" y2="240" stroke="#fde68a" strokeWidth="1.5" strokeDasharray="3 2" />
        <text x="467" y="262" textAnchor="middle" fill="#fde68a" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          Flame Arrestor
        </text>

        {/* Flow arrows & telemetry callout */}
        <text x="42" y="206" fill="#fde68a" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          RAW GAS →
        </text>
        <text x="530" y="206" fill="#5eead4" fontSize="10" fontFamily="IBM Plex Mono, monospace">
          CLEAN CH₄ →
        </text>
        <text x="320" y="420" textAnchor="middle" fill="#94a3b8" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
          SIMULATED BASELINE: 1,850 ppm H₂S · NO RELIEF LEG OR ARRESTOR
        </text>
      </svg>
    );
  }

  // utilization-genset
  return (
    <svg
      viewBox="0 0 640 480"
      className={className}
      role="img"
      aria-label="CAD elevation of the 5 kVA biogas generator set, safety bollards, and methane flare"
    >
      <defs>
        <pattern id="cadGrid4" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#1e293b" strokeWidth="0.7" />
        </pattern>
      </defs>

      <rect width="640" height="480" fill="#0b1220" />
      <rect width="640" height="480" fill="url(#cadGrid4)" />

      <text x="20" y="26" fill="#5eead4" fontSize="11" fontFamily="IBM Plex Mono, monospace" fontWeight="600">
        FIG 04 · 5 kVA BIOGAS UTILIZATION SKID (SIMULATED)
      </text>
      <text x="620" y="26" textAnchor="end" fill="#fbbf24" fontSize="10" fontFamily="IBM Plex Mono, monospace">
        3.8 kW AVG LOAD · 2.1 m³/hr
      </text>

      {/* Concrete Equipment Pad */}
      <rect x="65" y="340" width="510" height="28" fill="#475569" stroke="#cbd5e1" strokeWidth="1.8" />
      <text x="320" y="392" textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="IBM Plex Mono, monospace">
        2.20 m × 1.40 m REINFORCED CONCRETE PAD
      </text>

      {/* Yellow Safety Bollards */}
      <rect x="86" y="250" width="16" height="90" rx="3" fill="#eab308" stroke="#fef08a" strokeWidth="1.4" />
      <rect x="538" y="250" width="16" height="90" rx="3" fill="#eab308" stroke="#fef08a" strokeWidth="1.4" />

      {/* 5 kVA Generator Canopy */}
      <rect x="145" y="180" width="245" height="160" rx="6" fill="#0f766e" stroke="#5eead4" strokeWidth="2" />
      <rect x="165" y="205" width="130" height="110" fill="#134e4a" stroke="#2dd4bf" strokeWidth="1.2" />
      {/* Control Meter Box */}
      <rect x="312" y="205" width="60" height="72" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
      <circle cx="330" cy="228" r="8" fill="none" stroke="#38bdf8" strokeWidth="1.5" />
      <circle cx="354" cy="228" r="8" fill="none" stroke="#10b981" strokeWidth="1.5" />

      {/* Exhaust Muffler Stack */}
      <rect x="180" y="84" width="28" height="96" fill="#94a3b8" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M 194 84 L 194 64 L 216 54" fill="none" stroke="#cbd5e1" strokeWidth="10" strokeLinecap="round" />
      <text x="194" y="44" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontFamily="IBM Plex Mono, monospace">
        Exhaust Stack
      </text>

      {/* Biogas Feed Line */}
      <line x1="25" y1="290" x2="145" y2="290" stroke="#f59e0b" strokeWidth="8" />
      <line x1="390" y1="290" x2="468" y2="290" stroke="#f59e0b" strokeWidth="6" />
      <text x="80" y="276" textAnchor="middle" fill="#fde68a" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
        CH₄ Feed
      </text>

      {/* Excess-Gas Stainless Flare Stack & Blue Methane Flame */}
      <rect x="460" y="195" width="24" height="145" fill="#64748b" stroke="#e2e8f0" strokeWidth="1.5" />
      <path d="M 472 110 C 456 145, 456 185, 472 195 C 488 185, 488 145, 472 110 Z" fill="#38bdf8" opacity="0.88" />
      <path d="M 472 138 C 464 158, 464 184, 472 193 C 480 184, 480 158, 472 138 Z" fill="#e0f2fe" />
      <text x="472" y="96" textAnchor="middle" fill="#7dd3fc" fontSize="10" fontFamily="IBM Plex Mono, monospace">
        Methane Flare
      </text>

      <text x="230" y="254" textAnchor="middle" fill="#ffffff" fontSize="12" fontWeight="700" fontFamily="IBM Plex Mono, monospace">
        5 kVA BIOGAS
      </text>
      <text x="230" y="272" textAnchor="middle" fill="#99f6e4" fontSize="10.5" fontFamily="IBM Plex Mono, monospace">
        GENSET UNIT
      </text>
    </svg>
  );
};
