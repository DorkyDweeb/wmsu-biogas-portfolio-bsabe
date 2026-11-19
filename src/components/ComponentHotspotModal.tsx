import React, { useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import {
  COMPONENT_ORDER,
  ComponentId,
  ComplianceStatus,
  SUBSYSTEM_3D_MAP,
} from '../data/portfolioData';
import { SubsystemIllustration } from './SubsystemIllustrations';

interface ComponentHotspotModalProps {
  componentId: ComponentId;
  retrofitMode?: boolean;
  onClose: () => void;
  onSelectComponent: (id: ComponentId) => void;
  onJumpToEvaluation: (id: ComponentId) => void;
}

function StatusDisplay({ status }: { status: ComplianceStatus }) {
  if (status === 'Compliant') {
    return (
      <span className="font-mono text-xs font-semibold text-emerald-400">● Compliant</span>
    );
  }
  if (status === 'Partially Compliant') {
    return (
      <span className="font-mono text-xs font-semibold text-amber-400">
        ▲ Partially Compliant
      </span>
    );
  }
  return <span className="font-mono text-xs font-semibold text-rose-400">✖ Non-Compliant</span>;
}

export const ComponentHotspotModal: React.FC<ComponentHotspotModalProps> = ({
  componentId,
  retrofitMode = false,
  onClose,
  onSelectComponent,
  onJumpToEvaluation,
}) => {
  const info = SUBSYSTEM_3D_MAP[componentId];
  const currentIndex = COMPONENT_ORDER.indexOf(componentId);
  const isRetrofittedPart =
    retrofitMode && (componentId === 'feeding-channel' || componentId === 'inlet-pipe');
  const effectiveStatus: ComplianceStatus = isRetrofittedPart
    ? 'Compliant'
    : info.complianceStatus;

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + COMPONENT_ORDER.length) % COMPONENT_ORDER.length;
    onSelectComponent(COMPONENT_ORDER[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % COMPONENT_ORDER.length;
    onSelectComponent(COMPONENT_ORDER[nextIdx]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${info.name} Component Details`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-start justify-between gap-4 bg-slate-950/70">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
              <span>
                HOTSPOT {info.hotspotNumber} OF {String(COMPONENT_ORDER.length).padStart(2, '0')}
              </span>
              <span aria-hidden="true">·</span>
              <span>{isRetrofittedPart ? 'PAES RETROFIT PREVIEW' : 'SIMULATED SUBSYSTEM DATA'}</span>
              <span aria-hidden="true">·</span>
              <StatusDisplay status={effectiveStatus} />
            </div>
            <h3 className="text-lg font-display font-bold text-white mt-1">{info.name}</h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close component modal"
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto thin-scrollbar grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left: Precision Vector Schematic + Simulated Metrics */}
          <div className="md:col-span-6 space-y-4">
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-950">
              <div className="aspect-[4/3] bg-slate-950">
                <SubsystemIllustration variant={info.illustrationVariant} />
              </div>
              <div className="px-3 py-2 bg-slate-950 text-[11px] font-mono text-slate-300 border-t border-slate-800">
                {info.imageCaption}
              </div>
            </div>

            {/* Simulated Performance Data Grid */}
            <div>
              <p className="text-[11px] font-mono text-slate-400 mb-2">
                SIMULATED PERFORMANCE TELEMETRY
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                {info.simulatedMetrics.map((metric) => (
                  <div
                    key={metric.label}
                    className="bg-slate-950/80 border border-slate-800 rounded-lg p-3"
                  >
                    <p className="text-[11px] text-slate-400">{metric.label}</p>
                    <p className="text-base font-mono font-semibold text-emerald-300 mt-0.5 tabular-nums">
                      {metric.value}{' '}
                      <span className="text-[11px] font-normal text-slate-400">
                        {metric.unit}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Engineering Description, Specs & PAES Assessment */}
          <div className="md:col-span-6 space-y-4 text-sm">
            <div>
              <p className="text-[11px] font-mono text-slate-400">
                FUNCTIONAL &amp; PROCESS DESCRIPTION
              </p>
              <p className="text-slate-300 mt-1 leading-relaxed">{info.functionDescription}</p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <p className="text-[11px] font-mono text-slate-400">
                SIMULATED DIMENSIONS &amp; CAPACITY
              </p>
              <p className="text-white font-medium mt-1">{info.simulatedDimensions}</p>
            </div>

            <div className="border-t border-slate-800 pt-3">
              <p className="text-[11px] font-mono text-slate-400">
                SIMULATED CONSTRUCTION MATERIALS
              </p>
              <p className="text-slate-300 mt-1 leading-relaxed">{info.simulatedMaterial}</p>
            </div>

            {isRetrofittedPart && (
              <div className="bg-emerald-950/45 border border-emerald-700/70 rounded-lg p-3.5">
                <p className="text-[11px] font-mono font-semibold text-emerald-400">
                  PAES 413:2001 RETROFIT ACTIVE (CH. 9 RECOMMENDATION)
                </p>
                <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed tabular-nums">
                  {componentId === 'inlet-pipe'
                    ? 'Upgraded from undersized 0.06 m (6 cm) baseline conduit to ≥ 0.20 m (20 cm) full-bore PVC inlet pipe — eliminating hydraulic constriction and satisfying PAES 413:2001 Section 6.2.'
                    : 'Reconstructed from near-flat 0.4% baseline grade to ≥ 2.0% gravity-flow concrete channel slope — restoring self-cleansing scouring velocity and satisfying PAES 413:2001 Section 7.1.1.'}
                </p>
              </div>
            )}

            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-mono text-slate-400">
                  {isRetrofittedPart ? 'BASELINE PAES 413:2001 AUDIT FINDING' : 'PAES 413:2001 AUDIT FINDING'}
                </span>
                <StatusDisplay status={info.complianceStatus} />
              </div>
              <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{info.paesNote}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                onClose();
                onJumpToEvaluation(componentId);
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
            >
              View Full PAES Evaluation
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
