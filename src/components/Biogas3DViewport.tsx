import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Crosshair,
  Eye,
  Layers,
  Pause,
  Play,
  RotateCcw,
  ShieldAlert,
  Wrench,
} from 'lucide-react';
import {
  BiogasPlantController,
  CameraPresetKey,
  ProjectedHotspot,
  SceneControlState,
} from '../three/BiogasPlantScene';
import {
  COMPONENT_ORDER,
  ComponentId,
  ComplianceStatus,
  SUBSYSTEM_3D_MAP,
} from '../data/portfolioData';
import { ComponentHotspotModal } from './ComponentHotspotModal';
import { SubsystemIllustration } from './SubsystemIllustrations';

interface Biogas3DViewportProps {
  selectedComponent: ComponentId | null;
  onSelectComponent: (id: ComponentId | null) => void;
  onJumpToEvaluation: (id: ComponentId) => void;
  retrofitMode: boolean;
  onRetrofitModeChange: (enabled: boolean) => void;
}

const CAMERA_BUTTONS: { key: CameraPresetKey; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'mixing', label: 'Feeding & Tank' },
  { key: 'digester', label: 'Digester' },
  { key: 'dome', label: 'Gas Dome' },
  { key: 'outlet', label: 'Outlet Pit' },
  { key: 'utilization', label: 'Utilization' },
];

function getHotspotBorderClass(status: ComplianceStatus, isSelected: boolean): string {
  if (isSelected) return 'border-sky-400 bg-sky-600 text-white';
  switch (status) {
    case 'Compliant':
      return 'border-emerald-400 bg-slate-950/90 text-emerald-300 hover:bg-emerald-950';
    case 'Partially Compliant':
      return 'border-amber-400 bg-slate-950/90 text-amber-300 hover:bg-amber-950';
    case 'Non-Compliant':
      return 'border-rose-400 bg-slate-950/90 text-rose-300 hover:bg-rose-950';
  }
}

export const Biogas3DViewport: React.FC<Biogas3DViewportProps> = ({
  selectedComponent,
  onSelectComponent,
  onJumpToEvaluation,
  retrofitMode,
  onRetrofitModeChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const controllerRef = useRef<BiogasPlantController | null>(null);
  const hotspotRefs = useRef<Record<ComponentId, HTMLButtonElement | null>>({
    'substrate-source': null,
    'feeding-channel': null,
    'mixing-tank': null,
    'inlet-pipe': null,
    'digester-shell': null,
    'gas-dome': null,
    'safety-skid': null,
    'outlet-tank': null,
    'drainage-trench': null,
    'utilization-genset': null,
  });

  const [sceneState, setSceneState] = useState<SceneControlState>({
    cameraPreset: 'overview',
    cutaway: true,
    explodeAmount: 0,
    flowActive: true,
    showComplianceHighlights: true,
    showHotspots: true,
    retrofitMode,
    selectedComponent: null,
  });

  const [modalComponent, setModalComponent] = useState<ComponentId | null>(null);
  const [controlsCollapsed, setControlsCollapsed] = useState(false);
  const [contextLost, setContextLost] = useState(false);
  const [mountAttempt, setMountAttempt] = useState(0);

  const onSelectRef = useRef(onSelectComponent);
  onSelectRef.current = onSelectComponent;

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    let controller: BiogasPlantController | null = null;
    try {
      controller = new BiogasPlantController(el, {
        onSelect: (id) => {
          setSceneState((prev) => ({ ...prev, selectedComponent: id }));
          setModalComponent(id);
          onSelectRef.current(id);
        },
        onHotspotsUpdate: (projected: ProjectedHotspot[]) => {
          for (let i = 0; i < projected.length; i++) {
            const hp = projected[i];
            const btn = hotspotRefs.current[hp.id];
            if (!btn) continue;
            if (!hp.visible) {
              btn.style.opacity = '0';
              btn.style.pointerEvents = 'none';
            } else {
              btn.style.opacity = '1';
              btn.style.pointerEvents = 'auto';
              btn.style.transform = `translate3d(${hp.x}px, ${hp.y}px, 0) translate(-50%, -50%)`;
            }
          }
        },
        onContextLost: () => setContextLost(true),
        onContextRestored: () => setContextLost(false),
      });
      controllerRef.current = controller;

      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      if (reduced) {
        controller.updateState({ flowActive: false });
        setSceneState((prev) => ({ ...prev, flowActive: false }));
      }
    } catch {
      setContextLost(true);
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        e.key.toLowerCase() === 'h' &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        setControlsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      controller?.dispose();
      controllerRef.current = null;
    };
  }, [mountAttempt]);

  useEffect(() => {
    if (controllerRef.current && selectedComponent !== sceneState.selectedComponent) {
      if (selectedComponent) {
        controllerRef.current.focusComponent(selectedComponent);
      } else {
        controllerRef.current.updateState({ selectedComponent: null });
      }
      setSceneState((prev) => ({ ...prev, selectedComponent }));
    }
  }, [selectedComponent, sceneState.selectedComponent]);

  useEffect(() => {
    setSceneState((prev) => {
      if (prev.retrofitMode === retrofitMode) return prev;
      controllerRef.current?.updateState({ retrofitMode });
      return { ...prev, retrofitMode };
    });
    if (controllerRef.current) {
      controllerRef.current.updateState({ retrofitMode });
    }
  }, [retrofitMode]);

  const updateControl = (patch: Partial<SceneControlState>) => {
    if (typeof patch.retrofitMode === 'boolean' && patch.retrofitMode !== retrofitMode) {
      onRetrofitModeChange(patch.retrofitMode);
    }
    setSceneState((prev) => {
      const next = { ...prev, ...patch };
      controllerRef.current?.updateState(patch);
      return next;
    });
  };

  const handleHotspotClick = (id: ComponentId) => {
    controllerRef.current?.focusComponent(id);
    setSceneState((prev) => ({ ...prev, selectedComponent: id }));
    onSelectComponent(id);
    setModalComponent(id);
  };

  const resetView = () => {
    updateControl({
      cameraPreset: 'overview',
      cutaway: true,
      explodeAmount: 0,
      retrofitMode: false,
      selectedComponent: null,
    });
    setModalComponent(null);
    onSelectComponent(null);
  };

  const getEffectiveStatus = (id: ComponentId): ComplianceStatus => {
    if (retrofitMode && (id === 'feeding-channel' || id === 'inlet-pipe')) {
      return 'Compliant';
    }
    return SUBSYSTEM_3D_MAP[id].complianceStatus;
  };

  return (
    <>
    <div className="print-only border border-slate-300 rounded-lg p-4 bg-white print-avoid-break">
      <div className="flex items-center justify-between gap-4 border-b border-slate-300 pb-2 mb-3">
        <div>
          <p className="text-[10px] font-mono text-slate-600">
            PRINT FIGURE 01 · GREEN PASTURES SWINE FARM · PAES 413:2001 DIGITAL TWIN SNAPSHOT
          </p>
          <p className="text-sm font-semibold text-slate-900 mt-0.5">
            {retrofitMode
              ? 'PAES 413:2001 Compliant Retrofit View (≥ 0.20 m Inlet Pipe · ≥ 2.0% Channel Slope)'
              : 'Simulated Baseline View (0.06 m PVC Inlet Pipe · 0.4% Concrete Feeding Channel)'}
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-600 shrink-0">
          2D VECTOR PRINT SUBSTITUTE
        </span>
      </div>
      <div className="rounded-md overflow-hidden border border-slate-300 aspect-[4/3] max-w-[480px] mx-auto">
        <SubsystemIllustration variant="plant-layout-3d" />
      </div>
      <p className="text-[11px] text-slate-600 mt-2">
        Note: Interactive Three.js WebGL controls are replaced by this vector isometric layout in printed PDF copies.
      </p>
    </div>

    <div className="no-print relative w-full h-[560px] lg:h-[640px] bg-[#0b1320] rounded-xl overflow-hidden border border-slate-800 select-none">
      {/* Isolated WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full" />

      {/* Projected 3D Component Hotspots Layer (60fps DOM transform updates) */}
      <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
        {COMPONENT_ORDER.map((id) => {
          const info = SUBSYSTEM_3D_MAP[id];
          const isSelected = sceneState.selectedComponent === id;
          return (
            <button
              key={id}
              ref={(node) => {
                hotspotRefs.current[id] = node;
              }}
              type="button"
              onClick={() => handleHotspotClick(id)}
              style={{ opacity: 0, left: 0, top: 0 }}
              aria-label={`Inspect ${info.name}`}
              className={`group absolute flex items-center gap-1.5 px-2 py-1 rounded-md border text-[11px] font-mono font-semibold shadow-sm transition-colors duration-150 whitespace-nowrap ${getHotspotBorderClass(
                getEffectiveStatus(id),
                isSelected
              )}`}
            >
              <span>{info.hotspotNumber}</span>
              <span className="max-w-0 overflow-hidden group-hover:max-w-[140px] group-focus-visible:max-w-[140px] transition-all duration-200 font-sans font-medium text-white">
                {info.shortLabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* WebGL Context Lost / Unavailable Interactive Isometric Fallback */}
      {contextLost && (
        <div className="absolute inset-0 z-30 bg-[#0b1320] flex flex-col justify-between p-4 sm:p-6 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-mono text-amber-400">
                WEBGL FALLBACK · INTERACTIVE ISOMETRIC 3D MODE
              </p>
              <p className="text-sm font-semibold text-white mt-0.5">
                3D Hardware Acceleration Interrupted — Select Any Subsystem Below or Retry WebGL
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setContextLost(false);
                setMountAttempt((n) => n + 1);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-teal-600 hover:bg-teal-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry 3D Viewport</span>
            </button>
          </div>

          <div className="my-3 flex-1 min-h-0 flex items-center justify-center">
            <div className="w-full max-w-3xl h-full max-h-[340px] rounded-lg overflow-hidden border border-slate-800 bg-slate-950">
              <SubsystemIllustration variant="plant-layout-3d" />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {COMPONENT_ORDER.map((id) => {
              const info = SUBSYSTEM_3D_MAP[id];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => {
                    onSelectComponent(id);
                    setModalComponent(id);
                  }}
                  className={`px-2.5 py-1.5 rounded-md border text-[11px] font-mono font-semibold transition-colors whitespace-nowrap ${getHotspotBorderClass(
                    getEffectiveStatus(id),
                    sceneState.selectedComponent === id
                  )}`}
                >
                  {info.hotspotNumber} · {info.shortLabel}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Minimal Top-Left Viewport Title & Live Mode Indicator */}
      <div className="absolute top-4 left-4 right-4 sm:right-auto z-10 pointer-events-none max-w-md">
        <div
          className={`bg-slate-950/92 border rounded-lg px-3.5 py-2.5 transition-colors duration-200 ${
            retrofitMode ? 'border-emerald-500/60' : 'border-slate-800'
          }`}
        >
          <p
            className={`text-xs font-mono tracking-wide ${
              retrofitMode ? 'text-emerald-400' : 'text-teal-400'
            }`}
          >
            {retrofitMode
              ? 'PAES 413:2001 COMPLIANT RETROFIT · CH. 9 PREVIEW'
              : 'GREEN PASTURES SWINE FARM · PAES 413:2001 DIGITAL TWIN'}
          </p>
          <h2 className="text-sm font-semibold text-white mt-0.5 tabular-nums">
            {retrofitMode
              ? 'Upgraded ≥ 2.0% Sloped Channel & ≥ 0.20 m PVC Inlet Pipe'
              : 'Baseline 0.4% Concrete Channel & 0.06 m PVC Inlet Model'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {retrofitMode
              ? 'Live retrofit active · 3.3× inlet bore & 5× channel slope restored (Sec. 6.2 & 7.1.1)'
              : 'Drag to orbit · Scroll to zoom · Toggle PAES Retrofit below to preview Ch. 9 upgrades'}
          </p>
        </div>
      </div>

      {/* Unified Collapsible Bottom Control Dock */}
      <div className="absolute inset-x-3 bottom-4 z-20 flex justify-center pointer-events-none">
        <div
          className="w-full max-w-[980px] pointer-events-auto transition-transform duration-200"
          style={{
            transform: controlsCollapsed
              ? 'translateY(calc(100% - 30px))'
              : 'translateY(0)',
          }}
        >
          <div className="flex justify-center mb-1.5">
            <button
              type="button"
              onClick={() => setControlsCollapsed((v) => !v)}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/95 border border-slate-700 rounded-md text-[11px] font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap"
            >
              {controlsCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5" />
                  <span>Show 3D Controls (H)</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span>Hide Controls (H)</span>
                </>
              )}
            </button>
          </div>

          <div className="bg-slate-950/95 border border-slate-700/90 rounded-lg px-3.5 py-2.5 flex flex-col gap-2.5 max-w-full min-w-0">
          {/* Primary Row: Baseline vs. PAES Retrofit Switch + Camera Presets */}
          <div className="flex flex-wrap items-center justify-between gap-2 max-w-full min-w-0">
            {/* Segmented Baseline vs. PAES 413:2001 Retrofit Toggle */}
            <div
              role="group"
              aria-label="Design scenario comparison"
              className="inline-flex items-center p-0.5 rounded-md bg-slate-900 border border-slate-700/90 max-w-full overflow-x-auto thin-scrollbar"
            >
              <button
                type="button"
                aria-pressed={!retrofitMode}
                onClick={() => updateControl({ retrofitMode: false })}
                className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  !retrofitMode
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 font-semibold'
                    : 'text-slate-400 hover:text-white border border-transparent'
                }`}
              >
                Baseline · 0.06m / 0.4%
              </button>
              <button
                type="button"
                aria-pressed={retrofitMode}
                onClick={() => updateControl({ retrofitMode: true })}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  retrofitMode
                    ? 'bg-emerald-400 text-slate-950 font-semibold border border-emerald-300'
                    : 'text-slate-300 hover:text-emerald-300 border border-transparent'
                }`}
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>PAES Retrofit · ≥0.20m / ≥2.0%</span>
              </button>
            </div>

            {/* Camera Views */}
            <div className="flex items-center gap-1 overflow-x-auto thin-scrollbar pb-0.5 max-w-full min-w-0">
              {CAMERA_BUTTONS.map((btn) => {
                const active = sceneState.cameraPreset === btn.key;
                return (
                  <button
                    key={btn.key}
                    type="button"
                    onClick={() => updateControl({ cameraPreset: btn.key })}
                    className={`px-2.5 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-emerald-400 text-slate-950 font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Structural & Simulation Toggles */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800/80 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-300 whitespace-nowrap">
              <Layers className="w-3.5 h-3.5 text-teal-400" />
              <span>Explode</span>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={sceneState.explodeAmount}
                onChange={(e) => updateControl({ explodeAmount: parseFloat(e.target.value) })}
                aria-label="Exploded view separation"
                className="w-20 accent-teal-500 cursor-pointer"
              />
            </label>

            <button
              type="button"
              onClick={() => updateControl({ showHotspots: !sceneState.showHotspots })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                sceneState.showHotspots
                  ? 'bg-slate-800 border-sky-500/70 text-sky-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span>Hotspots</span>
            </button>

            <button
              type="button"
              onClick={() => updateControl({ cutaway: !sceneState.cutaway })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                sceneState.cutaway
                  ? 'bg-slate-800 border-teal-500/70 text-teal-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Cutaway</span>
            </button>

            <button
              type="button"
              onClick={() => updateControl({ flowActive: !sceneState.flowActive })}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                sceneState.flowActive
                  ? 'bg-slate-800 border-teal-500/70 text-teal-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              {sceneState.flowActive ? (
                <Pause className="w-3.5 h-3.5" />
              ) : (
                <Play className="w-3.5 h-3.5" />
              )}
              <span>Flow Sim</span>
            </button>

            <button
              type="button"
              onClick={() =>
                updateControl({ showComplianceHighlights: !sceneState.showComplianceHighlights })
              }
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 ${
                sceneState.showComplianceHighlights
                  ? 'bg-slate-800 border-amber-500/70 text-amber-300'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Audit Rings</span>
            </button>

            <button
              type="button"
              onClick={resetView}
              title="Reset 3D view"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 border border-slate-700 rounded transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
          </div>
        </div>
      </div>

      {/* Rich Hotspot Inspection Modal */}
      {modalComponent && (
        <ComponentHotspotModal
          componentId={modalComponent}
          retrofitMode={retrofitMode}
          onClose={() => setModalComponent(null)}
          onSelectComponent={(nextId) => {
            handleHotspotClick(nextId);
          }}
          onJumpToEvaluation={onJumpToEvaluation}
        />
      )}
    </div>
    </>
  );
};
