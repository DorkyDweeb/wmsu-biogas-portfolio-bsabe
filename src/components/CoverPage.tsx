import React, { useEffect, useRef } from 'react';
import { ArrowDown, BookOpen } from 'lucide-react';
import { ProjectMeta } from '../data/portfolioData';

interface CoverPageProps {
  meta: ProjectMeta;
  onExplore3D: () => void;
  onJumpToReport: () => void;
}

interface HexWave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  speed: number;
  bandWidth: number;
  strength: number;
  color: string;
}

interface HexCell {
  cx: number;
  cy: number;
  phase: number;
}

const HEX_RADIUS = 26;
const HEX_ANGLES = [0, 1, 2, 3, 4, 5].map((i) => (Math.PI / 3) * i);
const HEX_UNIT_COS = HEX_ANGLES.map((a) => Math.cos(a));
const HEX_UNIT_SIN = HEX_ANGLES.map((a) => Math.sin(a));

function traceHex(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.moveTo(cx + r * HEX_UNIT_COS[0], cy + r * HEX_UNIT_SIN[0]);
  for (let i = 1; i < 6; i++) {
    ctx.lineTo(cx + r * HEX_UNIT_COS[i], cy + r * HEX_UNIT_SIN[i]);
  }
  ctx.closePath();
}

export const CoverPage: React.FC<CoverPageProps> = ({
  meta,
  onExplore3D,
  onJumpToReport,
}) => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const pointerRef = useRef<{
    x: number;
    y: number;
    active: boolean;
    lastSpawn: number;
    lastX: number;
    lastY: number;
  }>({
    x: 0,
    y: 0,
    active: false,
    lastSpawn: 0,
    lastX: -999,
    lastY: -999,
  });
  const wavesRef = useRef<HexWave[]>([]);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let width = section.clientWidth || 960;
    let height = section.clientHeight || 480;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let cells: HexCell[] = [];

    const buildGrid = () => {
      const next: HexCell[] = [];
      const dx = HEX_RADIUS * 1.5;
      const dy = Math.sqrt(3) * HEX_RADIUS;
      const cols = Math.ceil(width / dx) + 2;
      const rows = Math.ceil(height / dy) + 2;

      for (let col = -1; col < cols; col++) {
        const cx = col * dx;
        const yOffset = (col & 1) !== 0 ? dy * 0.5 : 0;
        for (let row = -1; row < rows; row++) {
          const cy = row * dy + yOffset;
          next.push({
            cx,
            cy,
            phase: ((col * 7 + row * 13) % 17) / 17,
          });
        }
      }
      cells = next;
    };

    const drawStaticLattice = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();
      for (let i = 0; i < cells.length; i++) {
        traceHex(ctx, cells[i].cx, cells[i].cy, HEX_RADIUS - 1);
      }
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.08)';
      ctx.lineWidth = 0.85;
      ctx.stroke();
    };

    const resize = () => {
      width = section.clientWidth || 960;
      height = section.clientHeight || 480;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      buildGrid();
      if (reducedMotion) {
        drawStaticLattice();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    if (reducedMotion) {
      return () => {
        ro.disconnect();
      };
    }

    const pushWave = (x: number, y: number, strong = false) => {
      const list = wavesRef.current;
      if (list.length > 20) {
        list.splice(0, list.length - 20);
      }
      list.push({
        x,
        y,
        radius: strong ? 10 : 6,
        maxRadius: strong ? 340 : 195,
        speed: strong ? 3.2 : 2.25,
        bandWidth: strong ? 56 : 42,
        strength: strong ? 0.95 : 0.56,
        color: '52, 211, 153',
      });
      if (strong) {
        list.push({
          x,
          y,
          radius: 0,
          maxRadius: 240,
          speed: 2.15,
          bandWidth: 44,
          strength: 0.65,
          color: '45, 212, 191',
        });
      }
    };

    // Initial calm hex wave emanating from the schematic side
    pushWave(width * 0.72, height * 0.5, true);

    let frameId = 0;
    let lastAmbient = performance.now();

    const tick = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // Gentle ambient hex pulse when idle so the backdrop stays alive
      if (!pointerRef.current.active && now - lastAmbient > 3200) {
        lastAmbient = now;
        pushWave(
          width * (0.28 + Math.random() * 0.5),
          height * (0.28 + Math.random() * 0.45),
          false
        );
      }

      // Advance waves
      const list = wavesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const w = list[i];
        w.radius += w.speed;
        if (w.radius - w.bandWidth > w.maxRadius) {
          list.splice(i, 1);
        }
      }

      // 1) Crisp faint base hexagonal blueprint lattice (single batched stroke)
      ctx.beginPath();
      for (let i = 0; i < cells.length; i++) {
        traceHex(ctx, cells[i].cx, cells[i].cy, HEX_RADIUS - 1);
      }
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.085)';
      ctx.lineWidth = 0.85;
      ctx.stroke();

      // 2) Illuminate individual hexagonal cells swept by cursor aura & expanding hex-waves
      const p = pointerRef.current;
      const hoverRadius = 150;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        let intensity = 0;
        let accentColor = '52, 211, 153';

        if (p.active) {
          const dx = cell.cx - p.x;
          const dy = cell.cy - p.y;
          const dist = Math.hypot(dx, dy);
          if (dist < hoverRadius) {
            const falloff = 1 - dist / hoverRadius;
            intensity += falloff * falloff * 0.55;
          }
        }

        for (let j = 0; j < list.length; j++) {
          const w = list[j];
          const dist = Math.hypot(cell.cx - w.x, cell.cy - w.y);
          const delta = Math.abs(dist - w.radius);
          if (delta < w.bandWidth) {
            const progress = Math.min(w.radius / w.maxRadius, 1);
            const fade = Math.pow(1 - progress, 1.35);
            const band = Math.cos((delta / w.bandWidth) * (Math.PI * 0.5));
            const contrib = band * band * fade * w.strength;
            if (contrib > 0.02) {
              intensity += contrib;
              if (w.color === '45, 212, 191' && contrib > 0.18) {
                accentColor = w.color;
              }
            }
          }
        }

        if (intensity <= 0.025) continue;

        const clamped = Math.min(intensity, 1);
        const innerR = HEX_RADIUS - 2.2 - clamped * 1.4;

        ctx.beginPath();
        traceHex(ctx, cell.cx, cell.cy, innerR);
        ctx.fillStyle = `rgba(${accentColor}, ${(clamped * 0.16).toFixed(3)})`;
        ctx.fill();
        ctx.strokeStyle = `rgba(${accentColor}, ${(0.12 + clamped * 0.52).toFixed(3)})`;
        ctx.lineWidth = 0.9 + clamped * 0.85;
        ctx.stroke();

        // Precision micro-node glints at hexagon vertices for strong wave peaks
        if (clamped > 0.36) {
          const nodeAlpha = ((clamped - 0.36) / 0.64) * 0.65;
          ctx.fillStyle = `rgba(167, 243, 208, ${nodeAlpha.toFixed(3)})`;
          for (let v = 0; v < 6; v += 2) {
            const vx = cell.cx + innerR * HEX_UNIT_COS[v];
            const vy = cell.cy + innerR * HEX_UNIT_SIN[v];
            ctx.fillRect(vx - 1, vy - 1, 2, 2);
          }
        }
      }

      frameId = window.requestAnimationFrame(tick);
    };

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      ro.disconnect();
    };
  }, []);

  const spawnAtPointer = (clientX: number, clientY: number, strong: boolean) => {
    const section = sectionRef.current;
    if (!section) return;
    const rect = section.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const p = pointerRef.current;
    p.x = x;
    p.y = y;
    p.active = true;

    const now = performance.now();
    const dist = Math.hypot(x - p.lastX, y - p.lastY);
    if (strong || (now - p.lastSpawn > 95 && dist > 34)) {
      p.lastSpawn = now;
      p.lastX = x;
      p.lastY = y;
      const list = wavesRef.current;
      if (list.length > 20) {
        list.splice(0, list.length - 20);
      }
      list.push({
        x,
        y,
        radius: strong ? 10 : 6,
        maxRadius: strong ? 340 : 185,
        speed: strong ? 3.2 : 2.2,
        bandWidth: strong ? 56 : 40,
        strength: strong ? 0.95 : 0.5,
        color: '52, 211, 153',
      });
      if (strong) {
        list.push({
          x,
          y,
          radius: 0,
          maxRadius: 240,
          speed: 2.15,
          bandWidth: 44,
          strength: 0.65,
          color: '45, 212, 191',
        });
      }
    }
  };

  const memberSurnames = meta.members.map((m) => m.name.split(',')[0].trim()).join(' · ');

  return (
    <section
      ref={sectionRef}
      id="cover-page"
      aria-label="E-Portfolio Cover Page"
      onPointerMove={(e) => spawnAtPointer(e.clientX, e.clientY, false)}
      onPointerDown={(e) => spawnAtPointer(e.clientX, e.clientY, true)}
      onPointerLeave={() => {
        pointerRef.current.active = false;
      }}
      className="relative bg-slate-950 text-white rounded-2xl border border-slate-800 overflow-hidden print-break-after"
    >
      {/* Subtle atmospheric top-right eco-emerald radial depth */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 78% 45%, rgba(16, 185, 129, 0.08), transparent 58%)',
        }}
      />

      {/* Interactive Hexagonal Lattice Wave Canvas Layer */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none z-0 no-print"
      />

      <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 lg:px-14 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left: Spacious, Decluttered Cover Hierarchy */}
        <div className="lg:col-span-7 space-y-6">
          <p
            className="cover-stagger text-xs font-mono tracking-wider text-teal-400 uppercase"
            style={{ animationDelay: '40ms' }}
          >
            {meta.institution} · {meta.courseCode} · {meta.semester}
          </p>

          <div className="cover-stagger space-y-3" style={{ animationDelay: '120ms' }}>
            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight text-white leading-[1.08] text-balance">
              {meta.projectTitle}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 font-normal max-w-xl leading-relaxed">
              PAES 413:2001 Biogas Plant Simulation &amp; Compliance E-Portfolio
            </p>
          </div>

          <div
            className="cover-stagger flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-400 font-mono tabular-nums pt-1"
            style={{ animationDelay: '200ms' }}
          >
            <span className="text-slate-200">{meta.groupNumber}</span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>{memberSurnames}</span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>{meta.instructor}</span>
            <span aria-hidden="true" className="text-slate-700">
              ·
            </span>
            <span>{meta.submissionDate}</span>
          </div>

          <div
            className="cover-stagger flex flex-wrap items-center gap-3 pt-2 no-print"
            style={{ animationDelay: '280ms' }}
          >
            <button
              type="button"
              onClick={onExplore3D}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-950 bg-teal-400 hover:bg-teal-300 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Explore 3D Model</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onJumpToReport}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-200 bg-slate-900/75 border border-slate-700 hover:border-slate-500 hover:text-white rounded-lg transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-4 h-4 text-teal-400" />
              <span>Read Report</span>
            </button>
          </div>
        </div>

        {/* Right: Clean Floating Biogas Schematic (Zero Card Chrome Clutter) */}
        <div
          className="cover-stagger lg:col-span-5 flex items-center justify-center"
          style={{ animationDelay: '180ms' }}
        >
          <svg
            viewBox="0 0 320 220"
            className="w-full max-w-[360px] h-auto drop-shadow-[0_12px_32px_rgba(20,184,166,0.08)]"
            role="img"
            aria-label="Animated schematic of the Green Pastures anaerobic biogas digester"
          >
            {/* Ground datum line */}
            <line
              x1="18"
              y1="172"
              x2="302"
              y2="172"
              stroke="#334155"
              strokeWidth="1.25"
              strokeDasharray="4 4"
            />

            {/* Feeding channel -> Collecting tank -> Inlet pipe */}
            <path
              d="M 24 130 L 68 132 L 68 172 L 94 172 L 94 138 L 118 160"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cover-draw"
              style={{ animationDelay: '220ms' }}
            />

            {/* Digester dome silhouette */}
            <path
              d="M 112 172 L 112 122 C 112 64, 208 64, 208 122 L 208 172 Z"
              fill="rgba(20, 184, 166, 0.08)"
              stroke="#2dd4bf"
              strokeWidth="2.4"
              strokeLinejoin="round"
              className="cover-draw"
              style={{ animationDelay: '150ms' }}
            />

            {/* Slurry level wave inside digester */}
            <path
              d="M 116 138 Q 138 132, 160 138 T 204 138 L 204 170 L 116 170 Z"
              fill="rgba(20, 184, 166, 0.22)"
            />

            {/* Outlet compensation chamber */}
            <path
              d="M 208 156 L 234 140 L 262 140 L 262 172 L 208 172"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cover-draw"
              style={{ animationDelay: '350ms' }}
            />

            {/* Top gas outlet pipe & valve */}
            <path
              d="M 160 78 L 160 40 L 268 40 L 268 92"
              fill="none"
              stroke="#34d399"
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="cover-draw"
              style={{ animationDelay: '450ms' }}
            />

            <circle cx="192" cy="40" r="4.5" fill="#020617" stroke="#34d399" strokeWidth="2" />

            {/* Rising CH4 bubbles inside dome */}
            <circle
              cx="144"
              cy="150"
              r="2.5"
              fill="#5eead4"
              className="cover-bubble"
              style={{ animationDelay: '0.2s' }}
            />
            <circle
              cx="162"
              cy="154"
              r="3"
              fill="#99f6e4"
              className="cover-bubble"
              style={{ animationDelay: '1.0s', animationDuration: '3.1s' }}
            />
            <circle
              cx="178"
              cy="148"
              r="2.3"
              fill="#5eead4"
              className="cover-bubble"
              style={{ animationDelay: '1.7s', animationDuration: '2.5s' }}
            />

            {/* Gas flow tracer */}
            <circle cx="160" cy="40" r="3" fill="#34d399" className="cover-gas-tracer" />

            {/* Utilization unit */}
            <rect
              x="246"
              y="92"
              width="44"
              height="26"
              rx="5"
              fill="rgba(52, 211, 153, 0.12)"
              stroke="#34d399"
              strokeWidth="1.6"
            />
            <text
              x="268"
              y="108"
              textAnchor="middle"
              fill="#a7f3d0"
              fontSize="9"
              fontFamily="monospace"
            >
              CH₄
            </text>

            {/* Minimal labels */}
            <text
              x="46"
              y="120"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="8.5"
              fontFamily="monospace"
            >
              FEED
            </text>
            <text
              x="160"
              y="194"
              textAnchor="middle"
              fill="#94a3b8"
              fontSize="9"
              fontFamily="monospace"
            >
              DIGESTER
            </text>
            <text
              x="238"
              y="194"
              textAnchor="middle"
              fill="#7dd3fc"
              fontSize="8.5"
              fontFamily="monospace"
            >
              OUTLET
            </text>
          </svg>
        </div>
      </div>
    </section>
  );
};
