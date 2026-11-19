import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUp,
  Box,
  ExternalLink,
  FileText,
  List,
  Printer,
  Wrench,
  X,
} from 'lucide-react';
import {
  ComponentId,
  DEFAULT_PROJECT_META,
  GREEN_PASTURES_MAIN_COMPONENTS,
  GREEN_PASTURES_PROCESS_STEPS,
  ILLUSTRATIVE_GALLERY,
  PAES_EVALUATION_ITEMS,
  REFERENCES_LIST,
  SIMULATED_SPECS,
  SUBSYSTEM_3D_MAP,
} from './data/portfolioData';
import { Biogas3DViewport } from './components/Biogas3DViewport';
import { TechnicalDiagrams } from './components/TechnicalDiagrams';
import { PaesHydraulicCalculator } from './components/PaesHydraulicCalculator';
import { ComplianceSection } from './components/ComplianceSection';
import { SubsystemIllustration } from './components/SubsystemIllustrations';
import { CoverPage } from './components/CoverPage';

const SECTIONS_NAV = [
  { id: 'section-1', num: '01', label: 'Title Page' },
  { id: 'section-2', num: '02', label: 'Introduction' },
  { id: 'section-3', num: '03', label: 'Simulated Subject' },
  { id: 'section-4', num: '04', label: 'PAES Requirements' },
  { id: 'section-5', num: '05', label: 'Simulated Inspection' },
  { id: 'section-6', num: '06', label: 'Compliance Table' },
  { id: 'section-7', num: '07', label: 'Documentation' },
  { id: 'section-8', num: '08', label: 'Findings & Discussion' },
  { id: 'section-9', num: '09', label: 'Recommendations' },
  { id: 'section-10', num: '10', label: 'Conclusion' },
  { id: 'section-11', num: '11', label: 'References' },
];

const AD_STAGES = [
  {
    step: '01',
    stage: 'Hydrolysis',
    substrates: 'Complex fats, proteins & fibrous swine solids',
    output: 'Soluble monomers (sugars, amino & fatty acids)',
  },
  {
    step: '02',
    stage: 'Acidogenesis',
    substrates: 'Soluble organic monomers via fermentative bacteria',
    output: 'Volatile fatty acids (VFAs), alcohols & H₂',
  },
  {
    step: '03',
    stage: 'Acetogenesis',
    substrates: 'VFAs & alcohols converted by syntrophic acetogens',
    output: 'Acetic acid (CH₃COOH), H₂ & CO₂ precursors',
  },
  {
    step: '04',
    stage: 'Methanogenesis',
    substrates: 'Strict anaerobic archaea at 30–32 °C, pH 6.8–7.4',
    output: 'Biogas (~62% CH₄, ~37% CO₂, trace H₂S)',
  },
];

const REMEDIATION_ROADMAP = [
  {
    priority: 'P1',
    severityLabel: 'PAES 413:2001 Section 6.2 · Inlet Pipe',
    title: 'Upgrade Inlet Pipe Sizing to ≥ 0.20 m Minimum Inner Diameter',
    paesTarget: 'Deficiency 01 (Non-Compliant) · Target ≥ 0.20 m (20 cm)',
    baselineGap:
      'Simulated PVC inlet conduit inner diameter is 0.06 m (6 cm; 0.10 m cited in Ch. 9 brief), causing severe flow constriction.',
    targetRetrofit:
      'Replace the restrictive PVC inlet pipe with a PVC conduit having a minimum inner diameter of at least 0.20 m (20 cm / 200 mm).',
    verificationStep:
      'Check and record the pipe diameter in the final design and verify the installed dimension (≥ 0.20 m) during inspection.',
    componentId: 'inlet-pipe' as ComponentId,
    rationale:
      'Eliminates severe flow constriction and frequent clogging from high-solid swine manure, complying directly with PAES 413:2001 Section 6.2.',
  },
  {
    priority: 'P2',
    severityLabel: 'PAES 413:2001 Section 7.1.1 / 6.2 · Feeding Channel',
    title: 'Reconstruct the Concrete Feeding Channel Slope to ≥ 2.0%',
    paesTarget: 'Deficiency 02 (Non-Compliant) · Deficit: 1.6 percentage points',
    baselineGap:
      'Near-flat 0.4% slope (0.004 m/m) from substrate source to collecting tank causes premature sediment deposition.',
    targetRetrofit:
      'Demolish and re-pour the concrete feeding channel to achieve a verified minimum gradient of at least 2.0% (0.02 m/m).',
    verificationStep:
      'Survey invert elevations and horizontal run after re-pouring to verify a continuous ≥ 2.0% gradient and self-cleansing flow.',
    componentId: 'feeding-channel' as ComponentId,
    rationale:
      'Overcomes the near-flat 0.4% slope that causes premature sediment deposition, ensuring self-cleansing open-channel scouring velocity.',
  },
  {
    priority: 'P3',
    severityLabel: 'PAES 413:2001 Operational Guidelines · Preventive Audit',
    title: 'Implement Routine Quarterly Engineering Audits',
    paesTarget: 'Preventive Reliability · Seals, Valve Ratings & Flow Performance',
    baselineGap:
      'Absence of scheduled post-commissioning checks allows minor hydraulic bottlenecks, seal wear, or valve drift to escalate.',
    targetRetrofit:
      'Establish a quarterly engineering inspection schedule to monitor structural seals, gas valve ratings, and slurry flow performance.',
    verificationStep:
      'Log quarterly seal integrity, pressure-valve gauge calibration, and channel flow velocity records in the farm maintenance ledger.',
    componentId: 'safety-skid' as ComponentId,
    rationale:
      'Prevents minor hydraulic bottlenecks from turning into system failures and supports long-term facility reliability under PAES 413:2001 operational guidelines.',
  },
];

export default function App() {
  const projectMeta = DEFAULT_PROJECT_META;

  const [selected3DComponent, setSelected3DComponent] = useState<ComponentId | null>(null);
  const [retrofitMode, setRetrofitMode] = useState(false);
  const [highlightedEvalId, setHighlightedEvalId] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string>('section-1');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    const sectionIds = SECTIONS_NAV.map((s) => s.id);
    const sectionElements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (sectionElements.length === 0) return;

    const revealElement = (el: HTMLElement) => {
      if (el.getAttribute('data-revealed') !== 'true') {
        el.setAttribute('data-revealed', 'true');
      }
    };

    const syncScrollState = () => {
      const vh = window.innerHeight || 800;
      setShowBackToTop(window.scrollY > 420);

      // Reveal any section currently in or above the viewport
      for (const el of sectionElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= vh * 0.94) {
          revealElement(el);
        }
      }

      // Determine active section based on sticky-header offset
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 48;
      if (nearBottom) {
        setActiveSectionId(sectionIds[sectionIds.length - 1]);
        return;
      }

      const spyOffset = 150;
      let currentId = sectionIds[0];
      for (const el of sectionElements) {
        if (el.getBoundingClientRect().top <= spyOffset) {
          currentId = el.id;
        } else {
          break;
        }
      }
      setActiveSectionId(currentId);
    };

    // Immediately reveal section-1 and check initial scroll position
    revealElement(sectionElements[0]);
    syncScrollState();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealElement(entry.target as HTMLElement);
          }
        }
      },
      { threshold: 0.04, rootMargin: '0px 0px -28px 0px' }
    );

    for (const el of sectionElements) {
      observer.observe(el);
    }

    let rafId = 0;
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        syncScrollState();
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [mobileNavOpen]);

  const activeNavItem =
    SECTIONS_NAV.find((s) => s.id === activeSectionId) ?? SECTIONS_NAV[0];

  const handleNavigateToSection = (sectionId: string) => {
    const target = document.getElementById(sectionId);
    if (target) {
      target.setAttribute('data-revealed', 'true');
      setActiveSectionId(sectionId);
    }
    setMobileNavOpen(false);
  };

  const handleInspectIn3D = (componentId: ComponentId, enableRetrofit?: boolean) => {
    if (typeof enableRetrofit === 'boolean') {
      setRetrofitMode(enableRetrofit);
    }
    setSelected3DComponent(componentId);
    const viewportEl = document.getElementById('twin-viewport');
    viewportEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleScrollToTop = () => {
    setMobileNavOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToEvaluation = (componentId: ComponentId) => {
    const fallbackMap: Partial<Record<ComponentId, ComponentId>> = {
      'gas-dome': 'safety-skid',
      'substrate-source': 'feeding-channel',
      'mixing-tank': 'feeding-channel',
    };
    const lookupId = fallbackMap[componentId] ?? componentId;
    const match =
      PAES_EVALUATION_ITEMS.find((item) => item.componentId === componentId) ??
      PAES_EVALUATION_ITEMS.find((item) => item.componentId === lookupId);
    const section5 = document.getElementById('section-5');
    section5?.setAttribute('data-revealed', 'true');
    setActiveSectionId('section-5');
    if (match) {
      setHighlightedEvalId(match.id);
      const target =
        document.getElementById(`eval-card-${match.id}`) ?? section5;
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      section5?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-[#070d14] text-slate-100">
      {/* TOP BAR CONTRACT: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#070d14]/90 backdrop-blur-md border-b border-slate-800/90 px-6 py-3.5">
        <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-base font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0"
          >
            BABE 101 Portfolio
          </a>

          <nav
            aria-label="Primary navigation"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300"
          >
            <a
              href="#cover-page"
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Cover
            </a>
            <a
              href="#twin-viewport"
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              3D Twin
            </a>
            <a
              href="#section-3"
              onClick={() => handleNavigateToSection('section-3')}
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Case Study
            </a>
            <a
              href="#section-6"
              onClick={() => handleNavigateToSection('section-6')}
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              PAES Audit
            </a>
            <a
              href="#section-7"
              onClick={() => handleNavigateToSection('section-7')}
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Documentation
            </a>
            <a
              href="#section-8"
              onClick={() => handleNavigateToSection('section-8')}
              className="hover:text-emerald-300 underline-offset-4 hover:underline transition-colors whitespace-nowrap shrink-0"
            >
              Findings
            </a>
          </nav>

          <div className="flex items-center shrink-0">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </header>

      <main id="top" className="max-w-[1380px] mx-auto px-4 sm:px-6 py-8 space-y-12">
        {/* FORMAL ANIMATED COVER PAGE */}
        <CoverPage
          meta={projectMeta}
          onExplore3D={() => {
            document.getElementById('twin-viewport')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          onJumpToReport={() => {
            handleNavigateToSection('section-1');
            document.getElementById('section-1')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />

        {/* HERO HEADER & INTERACTIVE 3D BIOGAS PLANT STAGE */}
        <section id="twin-viewport" className="scroll-mt-20 pt-2 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                <span>{projectMeta.institution}</span>
                <span aria-hidden="true">·</span>
                <span>{projectMeta.courseCode} ({projectMeta.semester})</span>
                <span aria-hidden="true">·</span>
                <span>{projectMeta.groupNumber}</span>
                <span aria-hidden="true">·</span>
                <span>Specific Farm: {projectMeta.specificFarm}</span>
                <span aria-hidden="true">·</span>
                <span className="text-amber-400 font-semibold">SIMULATED CASE SCENARIO</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-white mt-2 text-balance">
                {projectMeta.projectTitle} — PAES 413:2001 Biogas Plant Assessment
              </h1>
              <p className="text-sm sm:text-base text-slate-300 mt-2 leading-relaxed max-w-2xl">
                Interactive 3D structural digital twin and PAES 413:2001 compliance evaluation for{' '}
                <strong className="text-white">Green Pastures Swine Farm Biogas Plant</strong> (Barangay San Roque, Zamboanga City) — highlighting the{' '}
                <span className="font-mono font-medium text-rose-400">0.06 m</span> PVC inlet pipe and{' '}
                <span className="font-mono font-medium text-rose-400">0.4%</span> concrete feeding channel deficiencies.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 no-print">
              <a
                href="/assets/aistudio/Green_Pastures_PAES_413_Detailed_Technical_Assessment__1__a2fce99a.pdf"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-200 bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 hover:text-white rounded-lg transition-colors whitespace-nowrap"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Parts 2–4 Assessment PDF</span>
              </a>
            </div>
          </div>

          {/* 3D Interactive Three.js Biogas Plant with Projected Hotspots & Modal */}
          <Biogas3DViewport
            selectedComponent={selected3DComponent}
            onSelectComponent={setSelected3DComponent}
            onJumpToEvaluation={handleJumpToEvaluation}
            retrofitMode={retrofitMode}
            onRetrofitModeChange={setRetrofitMode}
          />

          {/* 4-Column Simulated KPI & Compliance Strip Below Hero (Live-Synced with 3D Retrofit Toggle) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print-avoid-break">
            <div
              className={`bg-slate-900/90 border rounded-lg p-4 transition-colors duration-200 ${
                retrofitMode ? 'border-emerald-500/60' : 'border-slate-800'
              }`}
            >
              <p className="text-[11px] font-mono text-slate-400">SEC 6.2 · INLET PIPE BORE</p>
              <p
                className={`text-2xl font-mono font-semibold mt-1 tabular-nums transition-colors ${
                  retrofitMode ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {retrofitMode ? '≥ 0.20 m' : '0.06 m'}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {retrofitMode ? '(20 cm PVC)' : '(6 cm PVC)'}
                </span>
              </p>
              <p
                className={`text-xs mt-1 tabular-nums ${
                  retrofitMode ? 'text-emerald-300/90' : 'text-slate-400'
                }`}
              >
                {retrofitMode
                  ? 'Retrofit: +0.14 m bore · 11.1× flow area'
                  : 'PAES 413 Req: ≥ 0.20 m (20 cm)'}
              </p>
            </div>

            <div
              className={`bg-slate-900/90 border rounded-lg p-4 transition-colors duration-200 ${
                retrofitMode ? 'border-emerald-500/60' : 'border-slate-800'
              }`}
            >
              <p className="text-[11px] font-mono text-slate-400">SEC 7.1.1 · FEED CHANNEL SLOPE</p>
              <p
                className={`text-2xl font-mono font-semibold mt-1 tabular-nums transition-colors ${
                  retrofitMode ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {retrofitMode ? '≥ 2.0%' : '0.4%'}{' '}
                <span className="text-xs font-normal text-slate-400">
                  {retrofitMode ? '(0.02 m/m)' : '(0.004 m/m)'}
                </span>
              </p>
              <p
                className={`text-xs mt-1 tabular-nums ${
                  retrofitMode ? 'text-emerald-300/90' : 'text-slate-400'
                }`}
              >
                {retrofitMode
                  ? 'Retrofit: +1.6% pts · 5× gravity slope'
                  : 'PAES 413 Req: ≥ 2.0% (0.02 m/m)'}
              </p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-4">
              <p className="text-[11px] font-mono text-slate-400">PARTS 1–4 FACILITY</p>
              <p className="text-lg font-display font-semibold text-white mt-1.5">
                Brgy. San Roque
              </p>
              <p className="text-xs text-slate-400 mt-1">Zamboanga City, Philippines 7000</p>
            </div>

            <div
              className={`bg-slate-900/90 border rounded-lg p-4 transition-colors duration-200 ${
                retrofitMode ? 'border-emerald-500/60' : 'border-slate-800'
              }`}
            >
              <p className="text-[11px] font-mono text-slate-400">ACTIVE 3D MODEL SCENARIO</p>
              <p
                className={`text-lg font-display font-semibold mt-1.5 ${
                  retrofitMode ? 'text-emerald-400' : 'text-white'
                }`}
              >
                {retrofitMode ? 'PAES Retrofit Active' : 'Baseline Audit Model'}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-400">
                  {retrofitMode ? 'Sec. 6.2 & 7.1.1 resolved' : 'Sections 1–11 complete'}
                </span>
                <button
                  type="button"
                  onClick={() => setRetrofitMode((prev) => !prev)}
                  className="no-print text-[11px] font-mono font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-2 whitespace-nowrap"
                >
                  {retrofitMode ? 'Baseline' : 'Retrofit →'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Formal Print-Only Engineering Report Header Banner */}
        <div className="print-only border-b-2 border-slate-900 pb-2 mb-4">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-xs font-mono font-bold text-slate-900">
              {projectMeta.institution.toUpperCase()} · {projectMeta.courseCode} ({projectMeta.semester})
            </p>
            <p className="text-xs font-mono text-slate-700">
              {projectMeta.groupNumber} · Instructor: {projectMeta.instructor}
            </p>
          </div>
          <p className="text-[11px] text-slate-600 mt-0.5">
            {projectMeta.projectTitle} — {projectMeta.assignedStandard} · Educational Simulation Report
          </p>
        </div>

        {/* 11-SECTION E-PORTFOLIO BODY WITH STICKY SECTION INDEX */}
        <div className="print-report-grid grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-8 border-t border-slate-800/90">
          {/* Left Sticky Portfolio Index (Desktop) */}
          <aside className="lg:col-span-3 min-w-0 lg:sticky lg:top-20 space-y-5 no-print">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-800/80">
                <p className="text-[11px] font-mono text-emerald-400/90">
                  E-PORTFOLIO SECTIONS
                </p>
                <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                  {activeNavItem.num} / 11
                </span>
              </div>
              <nav aria-label="Portfolio sections" className="space-y-1">
                {SECTIONS_NAV.map((sec) => {
                  const isActive = activeSectionId === sec.id;
                  return (
                    <a
                      key={sec.id}
                      href={`#${sec.id}`}
                      aria-current={isActive ? 'location' : undefined}
                      onClick={() => handleNavigateToSection(sec.id)}
                      className={`flex items-center justify-between gap-2 px-2.5 py-1.5 text-xs rounded-md border transition-colors ${
                        isActive
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 font-semibold'
                          : 'text-slate-300 border-transparent hover:text-white hover:bg-slate-800/70 font-medium'
                      }`}
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`font-mono text-[11px] tabular-nums ${
                            isActive ? 'text-emerald-400' : 'text-slate-500'
                          }`}
                        >
                          {sec.num}
                        </span>
                        <span className="truncate">{sec.label}</span>
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 sm:p-5">
              <p className="text-[11px] font-mono text-emerald-400/90 mb-3 pb-2.5 border-b border-slate-800/80">
                QUICK 3D SUBSYSTEM FOCUS
              </p>
              <div className="space-y-1">
                {(Object.keys(SUBSYSTEM_3D_MAP) as ComponentId[]).map((id) => {
                  const sub = SUBSYSTEM_3D_MAP[id];
                  const active = selected3DComponent === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleInspectIn3D(id)}
                      className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md border transition-colors flex items-center justify-between gap-2 ${
                        active
                          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/60 font-medium'
                          : 'text-slate-300 border-transparent hover:bg-slate-800/70 hover:text-white'
                      }`}
                    >
                      <span className="truncate">
                        <span className="font-mono text-[10px] text-slate-500 mr-1.5">
                          {sub.hotspotNumber}
                        </span>
                        {sub.name}
                      </span>
                      <span
                        className={`font-mono text-[10px] shrink-0 ${
                          sub.complianceStatus === 'Compliant'
                            ? 'text-emerald-400'
                            : sub.complianceStatus === 'Partially Compliant'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                        }`}
                      >
                        {sub.complianceStatus === 'Compliant'
                          ? '●'
                          : sub.complianceStatus === 'Partially Compliant'
                            ? '▲'
                            : '✖'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* Right Main 11-Section Engineering Report */}
          <div className="lg:col-span-9 min-w-0 space-y-16">
            {/* SECTION 1: TITLE PAGE (ARCHITECTURAL COVER DESIGN) */}
            <section
              id="section-1"
              data-revealed="true"
              className="scroll-mt-24 bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden section-reveal"
            >
              {/* Deep Blueprint Cover Banner */}
              <div className="bg-slate-950/80 text-white p-6 sm:p-8 border-b border-slate-800 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    {/* Crisp SVG Institutional Engineering Crest */}
                    <svg
                      viewBox="0 0 64 64"
                      className="w-14 h-14 shrink-0 text-emerald-400"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="56"
                        height="56"
                        rx="10"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M16 42 C16 26, 48 26, 48 42 Z"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <line x1="32" y1="16" x2="32" y2="48" stroke="currentColor" strokeWidth="1.75" />
                      <circle cx="32" cy="14" r="3" fill="currentColor" />
                      <line x1="14" y1="48" x2="50" y2="48" stroke="currentColor" strokeWidth="2" />
                    </svg>

                    <div>
                      <p className="text-xs font-mono text-emerald-400">
                        SECTION 01 · TITLE PAGE & ACADEMIC LEDGER
                      </p>
                      <p className="text-xs text-slate-300 mt-1">
                        Republic of the Philippines · {projectMeta.institution}
                      </p>
                      <p className="text-sm font-medium text-white">
                        {projectMeta.college} · {projectMeta.department}
                      </p>
                      <p className="text-xs font-mono text-slate-400 mt-0.5">
                        {projectMeta.semester}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-800">
                  <p className="text-xs font-mono text-slate-400">
                    SEMESTER PROJECT · PAES-BASED SIMULATION AND COMPLIANCE ASSESSMENT
                  </p>
                  <h2 className="text-xl sm:text-2xl font-display font-bold text-white mt-1.5 text-balance">
                    {projectMeta.projectTitle}
                  </h2>
                </div>
              </div>

              {/* Clean Structured Metadata Grid Covering All Title Page Guide Requirements */}
              <div className="p-6 sm:p-8 space-y-6">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">NAME OF INSTITUTION</dt>
                    <dd className="text-white font-semibold mt-1">{projectMeta.institution}</dd>
                    <dd className="text-xs text-slate-400 mt-0.5">
                      {projectMeta.college} · {projectMeta.department}
                    </dd>
                  </div>

                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">
                      COURSE & SEMESTER / ACADEMIC YEAR
                    </dt>
                    <dd className="text-white font-semibold mt-1">{projectMeta.courseTitle}</dd>
                    <dd className="text-xs font-mono text-slate-400 mt-1">
                      Semester / A.Y.: {projectMeta.semester}
                    </dd>
                  </div>

                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">
                      ASSIGNED PAES & SPECIFIC FARM
                    </dt>
                    <dd className="text-white font-semibold mt-1">
                      Assigned PAES: Biogas Plant (PAES 413:2001)
                    </dd>
                    <dd className="text-xs text-slate-300 mt-0.5">
                      Specific Farm:{' '}
                      <span className="font-semibold text-emerald-300">{projectMeta.specificFarm}</span>
                    </dd>
                    <dd className="text-[11px] text-slate-400 mt-0.5">
                      {projectMeta.assignedStandard}
                    </dd>
                  </div>

                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">GROUP NUMBER</dt>
                    <dd className="text-white font-semibold mt-1">{projectMeta.groupNumber}</dd>
                    <dd className="text-xs text-slate-400 mt-0.5">
                      {projectMeta.members.length} Student Contributors
                    </dd>
                  </div>

                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">NAME OF INSTRUCTOR</dt>
                    <dd className="text-white font-semibold mt-1">{projectMeta.instructor}</dd>
                    <dd className="text-xs text-slate-400 mt-0.5">
                      Course Faculty · ABE Department
                    </dd>
                  </div>

                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5">
                    <dt className="text-[11px] font-mono text-slate-400">DATE OF SUBMISSION</dt>
                    <dd className="text-white font-semibold font-mono mt-1">
                      {projectMeta.submissionDate}
                    </dd>
                    <dd className="text-xs text-slate-400 mt-0.5">
                      Simulated E-Portfolio Deliverable
                    </dd>
                  </div>
                </dl>

                <div>
                  <p className="text-xs font-mono text-slate-400 mb-3">
                    ASSESSMENT TEAM ROSTER (GROUP MEMBERS)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectMeta.members.map((m, idx) => (
                      <div
                        key={m.id}
                        className="flex items-center gap-3 p-3 border border-slate-800 rounded-lg bg-slate-950/75"
                      >
                        <div className="w-8 h-8 rounded-md bg-slate-900 border border-slate-700 text-emerald-400 font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                          0{idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-white truncate">{m.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{m.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: INTRODUCTION (GREEN PASTURES SWINE FARM — PART 2) */}
            <section id="section-2" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4">
                <p className="text-xs font-mono text-emerald-400/90">
                  SECTION 02 · SIMULATED FACILITY SCENARIO & PROBLEM STATEMENT
                </p>
                <h2 className="text-2xl font-semibold text-white mt-1">02. Introduction</h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4 text-sm text-slate-300 leading-relaxed">
                  <div className="bg-amber-950/35 border border-amber-800/60 rounded-lg p-3.5 text-xs text-amber-200 space-y-1">
                    <p>
                      <strong className="font-semibold text-amber-100">Simulated Facility Profile:</strong>{' '}
                      <span className="font-semibold text-white">Green Pastures Swine Farm Biogas Plant</span> ·{' '}
                      {projectMeta.facilityLocation}
                    </p>
                    <p>
                      <strong className="font-semibold text-amber-100">Assigned Standard:</strong> PAES 413:2001 (Agricultural Structures – Biogas Plant). This is an educational simulated technical case scenario.
                    </p>
                  </div>

                  <p>
                    <strong className="text-white">Validated Inspection Scenario:</strong> During the evaluation of the facility, a validated inspection revealed a major structural and functional deficiency concerning the{' '}
                    <strong className="text-slate-100">inlet pipe specifications</strong> and{' '}
                    <strong className="text-slate-100">substrate delivery system</strong> at the Green Pastures Swine Farm Biogas Plant in Barangay San Roque, Zamboanga City.
                  </p>

                  <p>
                    <strong className="text-white">PAES 413:2001 Requirements vs. Measured Conditions:</strong> According to{' '}
                    <span className="font-mono font-medium text-slate-100">PAES 413:2001</span>, the inlet pipe of a biogas plant must have a minimum diameter of{' '}
                    <span className="font-mono font-semibold text-emerald-300">0.2 meters (20 cm)</span>, while the concrete feeding channels directing the substrate to the collecting tank must maintain a minimum slope of{' '}
                    <span className="font-mono font-semibold text-emerald-300">2%</span> to facilitate the proper and unobstructed flow of high-solid animal waste.
                  </p>

                  <p>
                    <strong className="text-white">Identified Deficiencies:</strong> After measuring and evaluating the simulated facility, the Green Pastures Swine Farm Biogas Plant was found to have an undersized{' '}
                    <strong className="text-slate-100">PVC inlet pipe</strong> with a diameter of only{' '}
                    <span className="font-mono font-semibold text-rose-400">0.06 meters (6 cm)</span>. Furthermore, the connecting concrete feeder channel had a nearly flat gradient, with a measured slope of approximately{' '}
                    <span className="font-mono font-semibold text-rose-400">0.4%</span>, falling below the required standard. These deficiencies may hinder the proper movement of swine manure into the biogas digester, potentially affecting the facility&apos;s overall operation and efficiency.
                  </p>
                </div>

                {/* Visual 4-Stage Anaerobic Digestion & PAES Alignment Diagram */}
                <div className="lg:col-span-5 bg-slate-900/90 text-slate-100 border border-slate-800 rounded-xl p-5 space-y-3.5">
                  <div>
                    <p className="text-[11px] font-mono text-emerald-400">
                      PROCESS SCIENCE · ANAEROBIC PATHWAY
                    </p>
                    <h3 className="text-sm font-semibold text-white mt-0.5">
                      Four-Stage Methanogenesis Inside Reactor
                    </h3>
                  </div>

                  <div className="space-y-2.5">
                    {AD_STAGES.map((item) => (
                      <div
                        key={item.step}
                        className="bg-slate-950/80 border border-slate-800 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-white">
                            <span className="font-mono text-emerald-400 mr-2">{item.step}</span>
                            {item.stage}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">{item.substrates}</p>
                        <p className="text-[11px] font-mono text-emerald-300 mt-1">
                          → {item.output}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: DESCRIPTION OF THE SIMULATED SUBJECT (GREEN PASTURES — PART 3) */}
            <section id="section-3" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4">
                <p className="text-xs font-mono text-emerald-400/90">
                  SECTION 03 · GREEN PASTURES SWINE FARM PROFILE (SIMULATED DATA)
                </p>
                <h2 className="text-2xl font-semibold text-white mt-1">
                  03. Description of the Simulated Subject
                </h2>
              </div>

              {/* 3.1 Name & Type + 3.2 Intended Purpose */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm text-slate-300 leading-relaxed">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-mono text-slate-400">
                    3.1 NAME AND TYPE OF FACILITY
                  </p>
                  <h3 className="text-base font-semibold text-white">
                    GREEN PASTURES SWINE FARM
                  </h3>
                  <p>
                    The subject of the assessment is <strong className="text-white">GREEN PASTURES SWINE FARM</strong>, a simulated swine waste-to-biogas facility located at {projectMeta.facilityLocation}. It is classified as a biogas facility because it is designed to process organic waste through anaerobic digestion and produce biogas.
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
                  <p className="text-xs font-mono text-slate-400">3.2 INTENDED PURPOSE</p>
                  <h3 className="text-base font-semibold text-white">
                    Swine Manure Collection & Anaerobic Conveyance
                  </h3>
                  <p>
                    The facility is intended to manage pig manure generated by the swine farm by collecting and conveying it to an anaerobic digester. The digester provides an oxygen-free environment in which microorganisms break down organic matter and generate biogas. The main purpose of the feeding system is to move the collected substrate from its source to the collecting tank and then through the inlet pipe into the digester.
                  </p>
                </div>
              </div>

              {/* 3.3 Main Components Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-xs font-mono text-slate-400">3.3 SUBSTRATE DELIVERY & REACTOR CHAIN</p>
                  <h3 className="text-base font-semibold text-white mt-0.5">
                    3.3 Main Components
                  </h3>
                </div>
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950/90 text-slate-200 border-b border-slate-800 font-mono">
                        <th className="py-2.5 px-3.5 w-64">Component</th>
                        <th className="py-2.5 px-3.5">Function in the Simulated Facility</th>
                        <th className="py-2.5 px-3.5 text-right no-print">3D Twin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {GREEN_PASTURES_MAIN_COMPONENTS.map((row) => (
                        <tr key={row.no} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3.5 font-semibold text-white">
                            {row.no}. {row.component}
                          </td>
                          <td className="py-2.5 px-3.5 leading-relaxed">
                            {row.functionInFacility}
                          </td>
                          <td className="py-2.5 px-3.5 text-right no-print">
                            <button
                              type="button"
                              onClick={() => handleInspectIn3D(row.componentId)}
                              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                            >
                              <Box className="w-3.5 h-3.5" />
                              <span>Focus</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 3.4 Process Flow */}
              <div className="bg-slate-900/90 text-white border border-slate-800 rounded-xl p-6 space-y-4">
                <div>
                  <p className="text-xs font-mono text-emerald-400">3.4 PROCESS FLOW</p>
                  <h3 className="text-base font-semibold text-white mt-0.5">
                    Simulated Substrate Movement Sequence
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {GREEN_PASTURES_PROCESS_STEPS.map((step, i) => (
                    <div
                      key={step}
                      className="bg-slate-950/85 border border-slate-800 rounded-lg p-3 flex flex-col justify-between"
                    >
                      <span className="text-[10px] font-mono text-emerald-400">STEP 0{i + 1}</span>
                      <p className="text-xs font-semibold text-white mt-1 leading-snug">{step}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  The concrete channel is intended to convey substrate from the source to the collecting tank. The inlet pipe then conveys the substrate from the collecting tank into the digester. The two evaluated PAES provisions (Section 6.2 &amp; Section 7.1.1) address the dimensions and arrangement of these flow paths.
                </p>
              </div>

              {/* 4-Card Simulated Illustrative Visual Gallery */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-mono text-slate-400">
                      ILLUSTRATIVE 3D MODEL VIEWS · BLENDER-STYLE CUTAWAY
                    </p>
                    <h3 className="text-base font-semibold text-white mt-0.5">
                      Green Pastures 3D Model Subsystems &amp; Components
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400">
                    Click any card to focus that unit in the 3D viewport above
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ILLUSTRATIVE_GALLERY.map((item) => (
                    <div
                      key={item.title}
                      className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950/75 flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] bg-slate-950 overflow-hidden">
                          <SubsystemIllustration variant={item.variant} />
                        </div>
                        <div className="p-3.5">
                          <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                            {item.caption}
                          </p>
                        </div>
                      </div>
                      <div className="px-3.5 pb-3.5">
                        <button
                          type="button"
                          onClick={() => handleInspectIn3D(item.id)}
                          className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300"
                        >
                          <Box className="w-3.5 h-3.5" />
                          <span>Focus &amp; Inspect in 3D</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3.5 Simulated Technical Specifications & 3.6 Design and Operating Characteristics */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-6 text-sm text-slate-300 leading-relaxed">
                <div>
                  <h3 className="text-xs font-mono text-slate-400 mb-3">
                    3.5 SIMULATED TECHNICAL SPECIFICATIONS (ALL VALUES HYPOTHETICAL)
                  </h3>
                  <div className="overflow-x-auto thin-scrollbar border border-slate-800 rounded-lg">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-950/85 border-b border-slate-800 font-mono text-slate-300">
                          <th className="py-2.5 px-3.5">Parameter</th>
                          <th className="py-2.5 px-3.5">Simulated Value / Description</th>
                          <th className="py-2.5 px-3.5">Unit / Basis</th>
                          <th className="py-2.5 px-3.5">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800 text-slate-300">
                        {SIMULATED_SPECS.map((row) => (
                          <tr key={row.parameter} className="hover:bg-slate-800/40">
                            <td className="py-2.5 px-3.5 font-medium text-white">
                              {row.parameter}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono font-semibold text-emerald-300">
                              {row.simulatedValue}
                            </td>
                            <td className="py-2.5 px-3.5 font-mono text-slate-400">{row.unit}</td>
                            <td className="py-2.5 px-3.5">{row.basisOrNote}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <div>
                    <p className="text-xs font-mono text-slate-400">
                      3.6 DESIGN AND OPERATING CHARACTERISTICS RELEVANT TO THE ASSESSMENT
                    </p>
                    <p className="mt-1.5">
                      The assessment assumes that the concrete channel is intended to move substrate by gravity toward the collecting tank. A channel slope that is too small may reduce the available gravitational driving force and allow solids to settle or accumulate. The inlet pipe must also provide a sufficiently large passage for the substrate. A pipe diameter below the stated minimum may restrict the flow of manure and increase the likelihood of blockage, especially when the substrate contains solids.
                    </p>
                    <p className="mt-2 text-xs text-slate-300 bg-slate-950/75 border border-slate-800 rounded-lg p-3">
                      <strong className="text-white">Scope Note:</strong> These are potential engineering effects, not proof that a blockage or operational failure has already occurred in an actual facility. The simulation uses them to explain why the PAES dimensional requirements matter.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTIONS 4, 5, 6: PAES REQUIREMENTS, 5-QUESTION EVALUATION & COMPLIANCE TABLE */}
            <ComplianceSection
              highlightedEvalId={highlightedEvalId}
              onInspectIn3D={handleInspectIn3D}
            />

            {/* SECTION 7: DOCUMENTATION */}
            <section id="section-7" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4">
                <p className="text-xs font-mono text-emerald-400/90">
                  SECTION 07 · DRAWINGS, CALCULATIONS & SUPPORTING RECORDS
                </p>
                <h2 className="text-2xl font-semibold text-white mt-1">
                  07. Documentation
                </h2>
                <p className="text-sm text-slate-300 mt-1.5">
                  Interactive cross-section drawings, mass-flow schematics, hydraulic retention verification calculations, and team contribution accountability record. All visuals are labeled{' '}
                  <span className="font-mono font-medium text-emerald-300">SIMULATED / ILLUSTRATIVE</span>.
                </p>
              </div>

              <TechnicalDiagrams onInspectIn3D={handleInspectIn3D} />

              <PaesHydraulicCalculator
                retrofitMode={retrofitMode}
                onApplyTo3D={(enableRetrofit, componentId) =>
                  handleInspectIn3D(componentId, enableRetrofit)
                }
              />

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 print-avoid-break">
                <div className="mb-3">
                  <p className="text-[11px] font-mono text-emerald-400/90">
                    PORTFOLIO OUTPUT · TEAM ACCOUNTABILITY
                  </p>
                  <h3 className="text-sm font-semibold text-white mt-0.5">
                    Individual &amp; Group Contribution Record
                  </h3>
                </div>
                <div className="divide-y divide-slate-800 text-xs">
                  {projectMeta.members.map((m) => (
                    <div key={m.id} className="py-2.5">
                      <p className="font-semibold text-white">
                        {m.name} <span className="font-normal text-slate-400">· {m.role}</span>
                      </p>
                      <p className="text-slate-300 mt-0.5 leading-relaxed">{m.contribution}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* SECTION 8: FINDINGS AND DISCUSSION (GREEN PASTURES TECHNICAL ASSESSMENT) */}
            <section id="section-8" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-emerald-400/90">
                    SECTION 08 · GREEN PASTURES SWINE FARM FINDINGS &amp; ENGINEERING DISCUSSION
                  </p>
                  <h2 className="text-2xl font-semibold text-white mt-1">
                    08. Findings and Discussion
                  </h2>
                </div>

                <a
                  href="/assets/aistudio/Green_Pastures_PAES_413_Detailed_Technical_Assessment__3__383811cc.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Findings &amp; Conclusion PDF</span>
                </a>
              </div>

              {/* Overall Assessment Scope & Compliance Summary Strip */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-mono text-slate-400">
                      EVALUATED FEEDING &amp; CORE PROVISIONS (SECTIONS 4–8)
                    </p>
                    <h3 className="text-base font-semibold text-white mt-0.5">
                      Compliance Split &amp; Identified Dimensional Gaps
                    </h3>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs font-mono tabular-nums">
                    <span className="text-rose-400 font-semibold">
                      ✖ 2 Feeding Provisions Non-Compliant (Sec. 6.2 &amp; 7.1.1)
                    </span>
                    <span className="text-emerald-400 font-semibold">
                      ● 2 Tank/Valve Checks Compliant (Ch. 5–6)
                    </span>
                  </div>
                </div>

                <div
                  className="w-full h-3.5 rounded-md overflow-hidden flex border border-slate-800"
                  role="img"
                  aria-label="2 feeding system provisions Non-Compliant; 2 tank and gas outlet checks Compliant"
                >
                  <div className="bg-rose-500 h-full" style={{ width: '50%' }} />
                  <div className="bg-emerald-500 h-full" style={{ width: '50%' }} />
                </div>

                {/* 8.1 Major Compliant Features (Assessment Scope) */}
                <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 space-y-1.5 text-sm">
                  <p className="text-xs font-mono font-semibold text-emerald-400">
                    8.1 MAJOR COMPLIANT FEATURES (WITHIN TWO-PROVISION FEEDING ASSESSMENT)
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    No compliant feature has been confirmed within the two feeding-system provisions evaluated in the detailed assessment. The simulated inlet pipe diameter (
                    <span className="font-mono font-medium text-rose-400 tabular-nums">0.06 m</span>) is below the Section 6.2 minimum (
                    <span className="font-mono font-medium text-emerald-300 tabular-nums">0.20 m</span>), and the simulated concrete channel slope (
                    <span className="font-mono font-medium text-rose-400 tabular-nums">0.4%</span>) is below the Section 7.1.1 minimum (
                    <span className="font-mono font-medium text-emerald-300 tabular-nums">2.0%</span>). This statement is limited to these two evaluated features; as documented in Chapters 5–6, the underground digester wall structure and gas outlet valve/gauge met structural and pressure guidelines.
                  </p>
                </div>
              </div>

              {/* 8.2 Deficiencies Identified (Finding 1 & Finding 2) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <article className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-mono text-rose-400 font-semibold">
                          8.2 FINDING 1 · PAES 413:2001 SEC. 6.2
                        </p>
                        <h3 className="text-base font-semibold text-white mt-0.5">
                          Inlet Pipe Diameter
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-semibold text-rose-400 tabular-nums shrink-0">
                        −0.14 m Deficit
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      The simulated PVC inlet pipe has a diameter of{' '}
                      <span className="font-mono font-semibold text-rose-400 tabular-nums">
                        0.06 m (6 cm)
                      </span>
                      , while PAES 413:2001 Section 6.2 requires a minimum diameter of{' '}
                      <span className="font-mono font-semibold text-emerald-300 tabular-nums">
                        0.20 m (20 cm)
                      </span>
                      . The simulated pipe is therefore{' '}
                      <span className="font-mono font-medium text-white tabular-nums">0.14 m</span> smaller than the required minimum and does not satisfy the stated criterion.
                    </p>
                    <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-white">Engineering discussion: </span>
                      The reduced pipe diameter limits the available cross-sectional passage for the substrate. Since pig manure may contain solid material, the narrow passage may increase resistance to flow and the possibility of blockage. Restricted feeding may interrupt or slow the transfer of substrate into the digester.
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleInspectIn3D('inlet-pipe')}
                      className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Focus 0.06 m Inlet Pipe in 3D</span>
                    </button>
                  </div>
                </article>

                <article className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[11px] font-mono text-rose-400 font-semibold">
                          8.2 FINDING 2 · PAES 413:2001 SEC. 7.1.1
                        </p>
                        <h3 className="text-base font-semibold text-white mt-0.5">
                          Concrete Feeding Channel Slope
                        </h3>
                      </div>
                      <span className="font-mono text-xs font-semibold text-rose-400 tabular-nums shrink-0">
                        −1.6% pts Deficit
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">
                      The simulated concrete feeding channel has a slope of{' '}
                      <span className="font-mono font-semibold text-rose-400 tabular-nums">
                        0.4%
                      </span>
                      , while PAES 413:2001 Section 7.1.1 requires a minimum slope of{' '}
                      <span className="font-mono font-semibold text-emerald-300 tabular-nums">
                        2%
                      </span>{' '}
                      for channels carrying substrate from its source to the collecting tank. The simulated slope is{' '}
                      <span className="font-mono font-medium text-white tabular-nums">1.6 percentage points</span>{' '}
                      below the minimum and does not satisfy the stated criterion.
                    </p>
                    <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 leading-relaxed">
                      <span className="font-semibold text-white">Engineering discussion: </span>
                      The low slope provides less vertical fall along the channel. This may reduce gravity-driven movement and allow solids to settle or accumulate. Accumulation may lead to slow conveyance, frequent cleaning, or blockage of the feeding channel.
                    </div>
                  </div>
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleInspectIn3D('feeding-channel')}
                      className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Focus 0.4% Channel in 3D</span>
                    </button>
                  </div>
                </article>
              </div>

              {/* 8.3 Technical Risks, 8.4 Difficult Requirements, 8.5 Provisions & 8.6 Implications */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
                  <div>
                    <p className="text-[11px] font-mono text-slate-400">8.3 OPERATIONAL EXPOSURE</p>
                    <h3 className="text-sm font-semibold text-white mt-0.5">
                      Technical Risks and Concerns
                    </h3>
                  </div>
                  <ul className="list-disc pl-5 space-y-1.5 text-slate-300 leading-relaxed text-xs sm:text-sm marker:text-emerald-400">
                    <li>Restricted substrate flow through the undersized inlet pipe.</li>
                    <li>
                      Increased possibility of clogging in the inlet pipe, particularly when the substrate contains solids.
                    </li>
                    <li>Slow movement of substrate through the shallow concrete channel.</li>
                    <li>Potential accumulation and settling of solids in the feeding channel.</li>
                    <li>
                      Interrupted or inconsistent delivery of substrate to the collecting tank and digester.
                    </li>
                    <li>
                      Additional cleaning and maintenance requirements if the deficiencies are not corrected.
                    </li>
                  </ul>
                  <p className="text-xs text-slate-400 pt-2 border-t border-slate-800">
                    These are potential risks associated with the identified deficiencies. The simulation does not establish that each event has occurred.
                  </p>
                </div>

                <div className="space-y-5">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
                    <p className="text-[11px] font-mono text-slate-400">
                      8.4 CONSTRUCTABILITY &amp; ELEVATION CONSTRAINTS
                    </p>
                    <h3 className="text-sm font-semibold text-white">
                      Requirements That Were Difficult to Satisfy
                    </h3>
                    <p className="text-slate-300 leading-relaxed">
                      The main challenge in the simulated case is meeting the minimum dimensions and slope required by PAES. The inlet pipe must be increased from{' '}
                      <span className="font-mono font-medium text-rose-400 tabular-nums">0.06 m</span> to at least{' '}
                      <span className="font-mono font-medium text-emerald-300 tabular-nums">0.20 m</span>. The channel must also be redesigned or regraded so that its slope reaches at least{' '}
                      <span className="font-mono font-medium text-emerald-300 tabular-nums">2%</span>. These changes may require adjustments to the layout, elevations, connections, and construction details of the feeding system.
                    </p>
                  </div>

                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2">
                    <p className="text-[11px] font-mono text-slate-400">
                      8.5 IMPORTANT PAES PROVISIONS ENCOUNTERED
                    </p>
                    <h3 className="text-sm font-semibold text-white">
                      Measurable Standard Benchmarks
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-slate-300 leading-relaxed text-xs sm:text-sm marker:text-emerald-400">
                      <li>
                        <strong className="text-white">Section 6.2</strong> establishes a minimum inlet pipe diameter of{' '}
                        <span className="font-mono text-emerald-300 tabular-nums">0.2 m</span>.
                      </li>
                      <li>
                        <strong className="text-white">Section 7.1.1</strong> requires concrete channels from the substrate source to the collecting tank to have a minimum slope of{' '}
                        <span className="font-mono text-emerald-300 tabular-nums">2%</span>.
                      </li>
                    </ul>
                    <p className="text-xs text-slate-400 pt-1">
                      These two provisions are important because they give measurable criteria that can be compared directly with the simulated facility specifications.
                    </p>
                  </div>
                </div>
              </div>

              {/* 8.6 Implications & Overall Finding */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
                <div className="space-y-1.5">
                  <p className="text-[11px] font-mono text-slate-400">
                    8.6 IMPLICATIONS OF THE FINDINGS
                  </p>
                  <p className="text-slate-300 leading-relaxed">
                    The findings show that the feeding system, as described in the simulation, does not meet the two selected minimum PAES criteria. If these deficiencies were present in an operating facility, they could affect the reliable movement of substrate and increase the possibility of blockages or accumulation. Correcting the inlet pipe diameter and channel slope would align these features with the evaluated requirements, though corrections alone do not prove full plant compliance across all PAES provisions.
                  </p>
                </div>
                <div className="bg-rose-950/35 border border-rose-800/60 rounded-lg p-4 space-y-1.5">
                  <p className="text-[11px] font-mono font-semibold text-rose-400">
                    8.7 OVERALL FEEDING SYSTEM FINDING
                  </p>
                  <p className="text-slate-100 font-medium leading-relaxed">
                    Based on the assumed measurements, GREEN PASTURES SWINE FARM is{' '}
                    <span className="font-mono font-semibold text-rose-400">NON-COMPLIANT</span>{' '}
                    with PAES 413:2001 Section 6.2 for inlet pipe diameter and Section 7.1.1 for concrete feeding channel slope. This conclusion applies strictly to the two feeding provisions assessed.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 9: RECOMMENDATIONS (CHAPTER 9 — CORRECTIVE MEASURES & ROUTINE AUDITS) */}
            <section id="section-9" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-emerald-400/90">
                    SECTION 09 · CHAPTER 9 PROPOSED ENGINEERING ACTIONS &amp; FIELD VERIFICATION
                  </p>
                  <h2 className="text-2xl font-semibold text-white mt-1">
                    09. Recommendations
                  </h2>
                  <p className="text-sm text-slate-300 mt-1">
                    To resolve the identified deficiencies in accordance with PAES 413:2001, the following three specific engineering actions are proposed.
                  </p>
                </div>

                <a
                  href="/assets/aistudio/BABE-101-CHAPTERS-9_aacb066f.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chapter 9 PDF</span>
                </a>
              </div>

              {/* Verification Table matching Assessment Section 7.6 */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto thin-scrollbar">
                  <table className="w-full text-left border-collapse text-xs min-w-[720px]">
                    <thead>
                      <tr className="bg-slate-950/90 text-slate-200 border-b border-slate-800 font-mono">
                        <th className="py-2.5 px-4 w-56">Identified Deficiency</th>
                        <th className="py-2.5 px-4">Recommended Corrective Measure</th>
                        <th className="py-2.5 px-4 w-72">Verification After Correction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 align-top">
                      {REMEDIATION_ROADMAP.map((rec) => {
                        const isPreventive = rec.priority === 'P3';
                        return (
                          <tr key={rec.priority} className="hover:bg-slate-800/40">
                            <td
                              className={`py-3 px-4 font-semibold tabular-nums ${
                                isPreventive ? 'text-amber-300' : 'text-rose-400'
                              }`}
                            >
                              {rec.baselineGap}
                            </td>
                            <td className="py-3 px-4 leading-relaxed text-white">
                              {rec.targetRetrofit}
                            </td>
                            <td className="py-3 px-4 leading-relaxed">{rec.verificationStep}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actionable Engineering Cards with 3D Twin Focus */}
              <div className="space-y-4">
                {REMEDIATION_ROADMAP.map((rec) => {
                  const isPreventive = rec.priority === 'P3';
                  return (
                    <article
                      key={rec.priority}
                      className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3.5"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-700 text-emerald-400 font-mono text-xs font-semibold shrink-0">
                            {rec.priority}
                          </div>
                          <div>
                            <p className="text-xs font-mono text-slate-400">
                              {rec.severityLabel} · {rec.paesTarget}
                            </p>
                            <h3 className="text-base font-semibold text-white mt-0.5">
                              {rec.title}
                            </h3>
                          </div>
                        </div>

                        <div className="no-print flex flex-wrap items-center gap-2">
                          {!isPreventive && (
                            <button
                              type="button"
                              onClick={() => handleInspectIn3D(rec.componentId, true)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap"
                            >
                              <Wrench className="w-3.5 h-3.5" />
                              <span>Preview Retrofit in 3D</span>
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleInspectIn3D(rec.componentId, false)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
                          >
                            <Box className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inspect Baseline</span>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        <div
                          className={`rounded-lg p-3 border ${
                            isPreventive
                              ? 'bg-amber-950/35 border-amber-800/60'
                              : 'bg-rose-950/35 border-rose-800/60'
                          }`}
                        >
                          <p
                            className={`font-mono font-semibold ${
                              isPreventive ? 'text-amber-300' : 'text-rose-400'
                            }`}
                          >
                            {isPreventive
                              ? 'OPERATIONAL RELIABILITY GAP'
                              : 'SIMULATED BASELINE DEFICIENCY'}
                          </p>
                          <p className="text-slate-200 mt-1 tabular-nums">{rec.baselineGap}</p>
                        </div>
                      <div className="bg-emerald-950/35 border border-emerald-800/60 rounded-lg p-3">
                        <p className="font-mono font-semibold text-emerald-400">
                          RECOMMENDED PAES ACTION
                        </p>
                        <p className="text-slate-200 mt-1 tabular-nums">{rec.targetRetrofit}</p>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 leading-relaxed">{rec.rationale}</p>
                  </article>
                  );
                })}
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">Design Integration Scope Note:</strong> The corrective measures above should be incorporated into the final simulated design. In an actual project, the final pipe and channel design should also be checked for hydraulic capacity, structural adequacy, constructability, maintenance access, and any other applicable standards or requirements beyond the two provisions evaluated here.
              </div>
            </section>

            {/* SECTION 10: CONCLUSION (CHAPTER 10) */}
            <section id="section-10" className="scroll-mt-24 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-mono text-emerald-400/90">
                    SECTION 10 · OVERALL CONCLUSION &amp; ENGINEERING REFLECTION
                  </p>
                  <h2 className="text-2xl font-semibold text-white mt-1">10. Conclusion</h2>
                </div>

                <a
                  href="/assets/aistudio/Chapter_10_16756a81.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900/90 border border-slate-700 hover:border-emerald-500/60 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Chapters 10–11 PDF</span>
                </a>
              </div>

              <div className="bg-slate-900/90 text-white border border-slate-800 rounded-xl p-6 space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <p className="text-xs font-mono text-rose-400">
                      OVERALL FEEDING-SYSTEM ASSESSMENT VERDICT
                    </p>
                    <h3 className="text-xl font-display font-bold text-white mt-1">
                      NON-COMPLIANT on Evaluated PAES 413:2001 Provisions (Sec. 6.2 &amp; Sec. 7.1.1)
                    </h3>
                  </div>
                  <div className="grid grid-cols-2 gap-6 text-center font-mono tabular-nums">
                    <div>
                      <p className="text-lg font-bold text-rose-400">0.06 m vs 0.20 m</p>
                      <p className="text-[10px] text-slate-400">SEC. 6.2 (−0.14 m SHORTFALL)</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-rose-400">0.4% vs 2.0%</p>
                      <p className="text-[10px] text-slate-400">SEC. 7.1.1 (−1.6% PTS GAP)</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3.5 text-sm text-slate-300 leading-relaxed">
                  <p>
                    The simulated technical assessment of{' '}
                    <strong className="text-white">GREEN PASTURES SWINE FARM</strong> evaluated the compliance of its swine waste-to-biogas facility with selected provisions of{' '}
                    <span className="font-mono text-emerald-300">
                      PAES 413:2001 – Agricultural Structures – Biogas Plant
                    </span>
                    , focusing on the inlet pipe diameter under Section 6.2 and the slope of the concrete feeding channel under Section 7.1.1 to determine whether simulated specifications satisfied minimum technical requirements and to identify necessary corrective measures.
                  </p>
                  <p>
                    Based on the technical evaluation, two major deficiencies were identified. First, the simulated inlet pipe has a diameter of{' '}
                    <span className="font-mono text-rose-300 tabular-nums">0.06 m (6 cm)</span>, below the required minimum of{' '}
                    <span className="font-mono text-emerald-300 tabular-nums">0.20 m (20 cm)</span> (a shortfall of{' '}
                    <span className="font-mono tabular-nums">0.14 m</span>). Second, the concrete feeding channel has a simulated slope of{' '}
                    <span className="font-mono text-rose-300 tabular-nums">0.4%</span>, below the required minimum of{' '}
                    <span className="font-mono text-emerald-300 tabular-nums">2%</span> (a difference of{' '}
                    <span className="font-mono tabular-nums">1.6 percentage points</span>). These deficiencies may restrict the movement of pig manure, increase the possibility of clogging, and cause the accumulation of solid waste within the feeding system.
                  </p>
                  <p>
                    Overall, the simulated facility is classified as{' '}
                    <strong className="text-rose-300">NON-COMPLIANT</strong> with the two PAES provisions evaluated. To address these deficiencies, the inlet pipe must be redesigned or replaced with one having a diameter of at least{' '}
                    <span className="font-mono text-emerald-300 tabular-nums">0.20 m</span>, while the concrete feeding channel must be reconstructed or regraded to achieve a minimum slope of{' '}
                    <span className="font-mono text-emerald-300 tabular-nums">2%</span>. However, this assessment is limited to the two selected provisions and does not establish the compliance status of the entire biogas facility.
                  </p>
                  <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 leading-relaxed space-y-1.5">
                    <p className="font-mono text-[11px] font-semibold text-emerald-400">
                      ABE STANDARDS &amp; LEARNING REFLECTION
                    </p>
                    <p>
                      Through this project, the group gained a better understanding of the importance of applying Philippine Agricultural Engineering Standards in evaluating agricultural structures and facilities. It demonstrated that compliance with technical specifications, proper measurements, and systematic evaluation are essential in identifying design deficiencies and recommending appropriate engineering solutions—highlighting the role of Agricultural and Biosystems Engineering in developing effective agricultural waste management systems that support operational efficiency, environmental protection, and sustainable agricultural practices.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 11: REFERENCES (CHAPTER 11) */}
            <section id="section-11" className="scroll-mt-24 pb-8 space-y-6 section-reveal">
              <div className="border-b border-slate-800/90 pb-4">
                <p className="text-xs font-mono text-emerald-400/90">
                  SECTION 11 · STANDARDS &amp; TECHNICAL SOURCES
                </p>
                <h2 className="text-2xl font-semibold text-white mt-1">11. References</h2>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl divide-y divide-slate-800">
                {REFERENCES_LIST.map((ref, idx) => (
                  <div key={ref.id} className="p-4 sm:p-5 flex items-start gap-3 text-sm">
                    <span className="font-mono text-xs text-slate-500 pt-0.5 shrink-0 tabular-nums">
                      [{idx + 1}]
                    </span>
                    <div className="space-y-1.5 min-w-0">
                      <p className="text-slate-200 leading-relaxed">{ref.citation}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs">
                        <span className="font-mono text-slate-400">{ref.category}</span>
                        {ref.url && (
                          <a
                            href={ref.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2 break-all"
                          >
                            <span>{ref.url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 bg-[#070d14] py-6 px-6 text-xs text-slate-400">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <span>
            WMSU College of Engineering · Agricultural and Biosystems Engineering Department · BABE 101
          </span>
          <span className="font-mono text-emerald-400/80">
            Educational Simulation E-Portfolio · PAES 413:2001 Assessment
          </span>
        </div>
      </footer>

      {/* Mobile Quick-Jump Backdrop & Drawer (screens < lg) */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 lg:hidden no-print"
          aria-hidden="true"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      {mobileNavOpen && (
        <nav
          id="mobile-chapter-drawer"
          aria-label="Mobile chapter navigation"
          className="fixed bottom-20 right-4 left-4 sm:left-auto sm:w-80 z-50 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden lg:hidden no-print"
        >
          <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between gap-2">
            <div>
              <p className="text-[11px] font-mono text-emerald-400">QUICK CHAPTER JUMP</p>
              <p className="text-xs font-semibold text-white tabular-nums">
                Active: Section {activeNavItem.num} of 11
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileNavOpen(false)}
              aria-label="Close chapter menu"
              className="min-h-[44px] min-w-[44px] -mr-2 flex items-center justify-center text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 border-b border-slate-800 bg-slate-950/40">
            <a
              href="#cover-page"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] px-3 rounded-lg border border-slate-800 bg-slate-900 hover:border-emerald-500/50 text-xs font-medium text-slate-200 flex items-center justify-center transition-colors"
            >
              Cover Page
            </a>
            <a
              href="#twin-viewport"
              onClick={() => setMobileNavOpen(false)}
              className="min-h-[44px] px-3 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Box className="w-3.5 h-3.5" />
              <span>3D Twin</span>
            </a>
          </div>

          <ul className="max-h-[52vh] overflow-y-auto thin-scrollbar divide-y divide-slate-800/80 p-2">
            {SECTIONS_NAV.map((s) => {
              const isActive = activeSectionId === s.id;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={() => handleNavigateToSection(s.id)}
                    aria-current={isActive ? 'location' : undefined}
                    className={`min-h-[44px] px-3 rounded-lg flex items-center gap-3 text-xs transition-colors ${
                      isActive
                        ? 'bg-emerald-500/15 text-emerald-300 font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                    }`}
                  >
                    <span
                      className={`font-mono text-[11px] tabular-nums ${
                        isActive ? 'text-emerald-400' : 'text-slate-500'
                      }`}
                    >
                      {s.num}
                    </span>
                    <span className="truncate">{s.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      {/* Floating Bottom-Right Mobile Quick-Jump & Back-to-Top Controls */}
      <div className="fixed bottom-4 right-4 z-30 flex items-center gap-2 no-print">
        <button
          type="button"
          onClick={() => setMobileNavOpen((prev) => !prev)}
          aria-expanded={mobileNavOpen}
          aria-controls="mobile-chapter-drawer"
          aria-label="Jump to report section"
          className={`lg:hidden min-h-[44px] px-3.5 rounded-lg border shadow-lg flex items-center gap-2 text-xs font-medium transition-colors whitespace-nowrap ${
            mobileNavOpen
              ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-semibold'
              : 'bg-slate-950/95 text-slate-100 border-slate-700 hover:border-emerald-500/60'
          }`}
        >
          {mobileNavOpen ? (
            <X className="w-4 h-4 shrink-0" />
          ) : (
            <List className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <span>Chapters</span>
          <span
            className={`font-mono tabular-nums ${
              mobileNavOpen ? 'text-slate-900' : 'text-emerald-400'
            }`}
          >
            {activeNavItem.num}/11
          </span>
        </button>

        {showBackToTop && (
          <button
            type="button"
            onClick={handleScrollToTop}
            aria-label="Back to top"
            title="Back to top"
            className="min-h-[44px] min-w-[44px] px-3 rounded-lg bg-slate-950/95 border border-slate-700 hover:border-emerald-500/60 text-slate-200 hover:text-emerald-300 shadow-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors whitespace-nowrap"
          >
            <ArrowUp className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Top</span>
          </button>
        )}
      </div>
    </div>
  );
}
