import React, { useState } from 'react';
import { Box, Calculator, CheckCircle2, RotateCcw, Wrench, XCircle } from 'lucide-react';
import { ComponentId } from '../data/portfolioData';

interface PaesHydraulicCalculatorProps {
  retrofitMode: boolean;
  onApplyTo3D: (enableRetrofit: boolean, focusComponent: ComponentId) => void;
}

const BASELINE_INLET_M = 0.06;
const PAES_MIN_INLET_M = 0.2;
const PAES_MIN_SLOPE_PCT = 2.0;
const BASELINE_ACTIVE_VOL_M3 = 19.0;
const DOME_HEADSPACE_M3 = 4.8;
const CHANNEL_RUN_M = 3.0;
const MANNING_N = 0.015; // Troweled concrete open channel
const CHANNEL_WIDTH_M = 0.48;
const SLURRY_DEPTH_M = 0.08;
const HYDRAULIC_RADIUS_M =
  (CHANNEL_WIDTH_M * SLURRY_DEPTH_M) / (CHANNEL_WIDTH_M + 2 * SLURRY_DEPTH_M); // 0.06 m

export const PaesHydraulicCalculator: React.FC<PaesHydraulicCalculatorProps> = ({
  retrofitMode,
  onApplyTo3D,
}) => {
  // Feeding Hydraulics (PAES 413:2001 Sec. 6.2 & Sec. 7.1.1)
  const [inletDiameterM, setInletDiameterM] = useState<number>(BASELINE_INLET_M);
  const [channelSlopePct, setChannelSlopePct] = useState<number>(0.4);

  // Digester & Biogas Yield Sizing
  const [swineHeads, setSwineHeads] = useState<number>(120);
  const [manurePerHead, setManurePerHead] = useState<number>(2.25);
  const [waterRatio, setWaterRatio] = useState<number>(1.0);
  const [targetHrt, setTargetHrt] = useState<number>(35);

  // --- Hydraulic Calculations ---
  const inletPass = inletDiameterM >= PAES_MIN_INLET_M - 1e-6;
  const slopePass = channelSlopePct >= PAES_MIN_SLOPE_PCT - 1e-6;

  const pipeAreaCm2 = Math.PI * Math.pow((inletDiameterM * 100) / 2, 2);
  const baselineAreaCm2 = Math.PI * Math.pow((BASELINE_INLET_M * 100) / 2, 2);
  const areaMultiplier = pipeAreaCm2 / baselineAreaCm2;
  const boreDeltaM = inletDiameterM - PAES_MIN_INLET_M;

  const slopeDecimal = channelSlopePct / 100;
  const manningVelocityMs =
    (1 / MANNING_N) * Math.pow(HYDRAULIC_RADIUS_M, 2 / 3) * Math.sqrt(slopeDecimal);
  const baselineVelocityMs =
    (1 / MANNING_N) * Math.pow(HYDRAULIC_RADIUS_M, 2 / 3) * Math.sqrt(0.004);
  const velocityRatio = manningVelocityMs / baselineVelocityMs;
  const elevationDropCm = CHANNEL_RUN_M * slopeDecimal * 100;
  const slopeDeltaPct = channelSlopePct - PAES_MIN_SLOPE_PCT;

  // --- Digester HRT & Biogas Yield Calculations ---
  const dailyManureKg = swineHeads * manurePerHead;
  const dailyWaterL = dailyManureKg * waterRatio;
  const dailySlurryM3 = (dailyManureKg + dailyWaterL) / 1000;
  const requiredActiveVol = dailySlurryM3 * targetHrt;
  const capacityUtilizationPct = (requiredActiveVol / BASELINE_ACTIVE_VOL_M3) * 100;
  const digesterFits = requiredActiveVol <= BASELINE_ACTIVE_VOL_M3;

  const estimatedGasLow = dailyManureKg * 0.035;
  const estimatedGasHigh = dailyManureKg * 0.0415;
  const estimatedMethaneMid = ((estimatedGasLow + estimatedGasHigh) / 2) * 0.62;
  const domeRatioPct = (DOME_HEADSPACE_M3 / Math.max(estimatedGasHigh, 0.1)) * 100;

  const feedingCompliant = inletPass && slopePass;

  // Visual pipe bore comparison circle radius (PAES 0.20m = 36px radius)
  const paesCircleR = 36;
  const selectedCircleR = Math.min(48, Math.max(8, (inletDiameterM / PAES_MIN_INLET_M) * paesCircleR));

  const loadBaselinePreset = () => {
    setInletDiameterM(0.06);
    setChannelSlopePct(0.4);
    setSwineHeads(120);
    setManurePerHead(2.25);
    setWaterRatio(1.0);
    setTargetHrt(35);
  };

  const loadRetrofitPreset = () => {
    setInletDiameterM(0.2);
    setChannelSlopePct(2.0);
    setSwineHeads(120);
    setManurePerHead(2.25);
    setWaterRatio(1.0);
    setTargetHrt(35);
  };

  return (
    <div
      id="paes-hydraulic-calculator"
      className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden print-avoid-break"
    >
      {/* Header Bar with Scenario Presets */}
      <div className="border-b border-slate-800 px-5 py-4 flex flex-wrap items-center justify-between gap-4 bg-slate-950/75">
        <div>
          <p className="text-xs font-mono text-emerald-400/90 flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" />
            <span>INTERACTIVE PAES 413:2001 HYDRAULIC &amp; BIOGAS WORKBENCH</span>
          </p>
          <h3 className="text-base font-semibold text-white mt-0.5">
            Feeding Conduit Hydraulics (Sec. 6.2 &amp; 7.1.1) &amp; Digester HRT Sizing Calculator
          </h3>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadBaselinePreset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-300 bg-rose-950/40 hover:bg-rose-950/70 border border-rose-800/70 rounded-md transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Load Baseline (0.06m · 0.4%)</span>
          </button>
          <button
            type="button"
            onClick={loadRetrofitPreset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-md transition-colors whitespace-nowrap"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Load PAES Retrofit (0.20m · 2.0%)</span>
          </button>
          <button
            type="button"
            onClick={() => onApplyTo3D(feedingCompliant, 'inlet-pipe')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-colors whitespace-nowrap"
          >
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {feedingCompliant
                ? retrofitMode
                  ? 'View Retrofit in 3D'
                  : 'Apply Retrofit to 3D'
                : 'View Baseline in 3D'}
            </span>
          </button>
        </div>
      </div>

      {/* Part 1: PAES 413:2001 Feeding Hydraulics (Inlet Bore + Channel Slope) */}
      <div className="p-5 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Sec 6.2 Inlet Pipe Bore Card */}
          <div
            className={`rounded-xl border p-4 sm:p-5 bg-slate-950/75 space-y-4 transition-colors ${
              inletPass ? 'border-emerald-700/60' : 'border-rose-800/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono text-slate-400">
                  PAES 413:2001 SEC. 6.2 · INLET CONDUIT
                </p>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  PVC Inlet Pipe Inner Diameter (D)
                </h4>
              </div>
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-semibold shrink-0 ${
                  inletPass ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {inletPass ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </>
                )}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Live Proportional Pipe Cross-Section Visual */}
              <div className="shrink-0 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 flex flex-col items-center">
                <svg
                  width="112"
                  height="112"
                  viewBox="0 0 112 112"
                  role="img"
                  aria-label={`Inlet pipe cross-section comparison: ${inletDiameterM.toFixed(2)} meters vs 0.20 meter PAES minimum`}
                >
                  {/* PAES 0.20 m Reference Ring */}
                  <circle
                    cx="56"
                    cy="56"
                    r={paesCircleR}
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  {/* Selected Bore Circle */}
                  <circle
                    cx="56"
                    cy="56"
                    r={selectedCircleR}
                    fill={inletPass ? 'rgba(16, 185, 129, 0.24)' : 'rgba(244, 63, 94, 0.24)'}
                    stroke={inletPass ? '#34d399' : '#fb7185'}
                    strokeWidth="2"
                  />
                  <text
                    x="56"
                    y="60"
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontFamily="IBM Plex Mono, monospace"
                    fontWeight="600"
                  >
                    {(inletDiameterM * 100).toFixed(0)} cm
                  </text>
                </svg>
                <span className="text-[10px] font-mono text-slate-400 mt-1">
                  Dashed: 20 cm Min
                </span>
              </div>

              <div className="flex-1 w-full space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <label htmlFor="calc-inlet-diameter" className="text-slate-300 font-medium">
                      Pipe Bore Diameter
                    </label>
                    <span
                      className={`font-mono font-semibold tabular-nums ${
                        inletPass ? 'text-emerald-300' : 'text-rose-400'
                      }`}
                    >
                      {inletDiameterM.toFixed(2)} m ({(inletDiameterM * 100).toFixed(0)} cm)
                    </span>
                  </div>
                  <input
                    id="calc-inlet-diameter"
                    type="range"
                    min={0.06}
                    max={0.3}
                    step={0.01}
                    value={inletDiameterM}
                    onChange={(e) => setInletDiameterM(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer no-print"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums no-print whitespace-nowrap">
                    <span>0.06m Base</span>
                    <span className="text-emerald-400/90">0.20m PAES Min</span>
                    <span>0.30m</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5 text-xs">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                    <p className="text-[10px] font-mono text-slate-400">FLOW AREA (πD²/4)</p>
                    <p className="text-sm font-mono font-semibold text-white mt-0.5 tabular-nums">
                      {pipeAreaCm2.toFixed(1)} cm²
                    </p>
                    <p className="text-[11px] font-mono text-emerald-400/90 tabular-nums">
                      {areaMultiplier.toFixed(1)}× vs. 6 cm
                    </p>
                  </div>
                  <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                    <p className="text-[10px] font-mono text-slate-400">PAES MARGIN</p>
                    <p
                      className={`text-sm font-mono font-semibold mt-0.5 tabular-nums ${
                        inletPass ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {boreDeltaM >= 0 ? `+${boreDeltaM.toFixed(2)} m` : `${boreDeltaM.toFixed(2)} m`}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {inletPass ? 'Solids clear freely' : 'High clogging risk'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sec 7.1.1 Concrete Channel Slope Card */}
          <div
            className={`rounded-xl border p-4 sm:p-5 bg-slate-950/75 space-y-4 transition-colors ${
              slopePass ? 'border-emerald-700/60' : 'border-rose-800/60'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-mono text-slate-400">
                  PAES 413:2001 SEC. 7.1.1 · OPEN CHANNEL
                </p>
                <h4 className="text-sm font-semibold text-white mt-0.5">
                  Concrete Feeding Channel Gradient (S)
                </h4>
              </div>
              <span
                className={`inline-flex items-center gap-1 font-mono text-xs font-semibold shrink-0 ${
                  slopePass ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {slopePass ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PASS</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>FAIL</span>
                  </>
                )}
              </span>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label htmlFor="calc-channel-slope" className="text-slate-300 font-medium">
                    Longitudinal Channel Slope
                  </label>
                  <span
                    className={`font-mono font-semibold tabular-nums ${
                      slopePass ? 'text-emerald-300' : 'text-rose-400'
                    }`}
                  >
                    {channelSlopePct.toFixed(1)}% ({slopeDecimal.toFixed(3)} m/m)
                  </span>
                </div>
                <input
                  id="calc-channel-slope"
                  type="range"
                  min={0.2}
                  max={4.0}
                  step={0.1}
                  value={channelSlopePct}
                  onChange={(e) => setChannelSlopePct(Number(e.target.value))}
                  className="w-full accent-emerald-400 cursor-pointer no-print"
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5 tabular-nums no-print">
                  <span>0.2%</span>
                  <span className="text-rose-400/90">0.4% (Baseline)</span>
                  <span className="text-emerald-400/90">2.0% (PAES Min)</span>
                  <span>4.0%</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-xs">
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] font-mono text-slate-400">MANNING VELOCITY</p>
                  <p className="text-sm font-mono font-semibold text-white mt-0.5 tabular-nums">
                    {manningVelocityMs.toFixed(2)} m/s
                  </p>
                  <p className="text-[11px] font-mono text-emerald-400/90 tabular-nums">
                    {velocityRatio.toFixed(2)}× vs. 0.4%
                  </p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] font-mono text-slate-400">DROP / 3.0 m RUN</p>
                  <p className="text-sm font-mono font-semibold text-white mt-0.5 tabular-nums">
                    {elevationDropCm.toFixed(1)} cm
                  </p>
                  <p className="text-[11px] text-slate-400">Min req: 6.0 cm</p>
                </div>
                <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-2.5">
                  <p className="text-[10px] font-mono text-slate-400">SLOPE MARGIN</p>
                  <p
                    className={`text-sm font-mono font-semibold mt-0.5 tabular-nums ${
                      slopePass ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {slopeDeltaPct >= 0
                      ? `+${slopeDeltaPct.toFixed(1)}%`
                      : `${slopeDeltaPct.toFixed(1)}%`}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {slopePass ? 'Self-cleansing' : 'Solids settle'}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Manning estimate: <span className="font-mono text-slate-300">V = (1/n)·Rₕ^(2/3)·S^(1/2)</span>{' '}
                using concrete <span className="font-mono text-slate-300">n = 0.015</span>, bed{' '}
                <span className="font-mono text-slate-300">b = 0.48 m</span>, slurry depth{' '}
                <span className="font-mono text-slate-300">y = 0.08 m</span>.
              </p>
            </div>
          </div>
        </div>

        {/* Part 2: Digester HRT, Active Volume & Biogas Yield Sizing */}
        <div className="pt-5 border-t border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-4">
            <div>
              <p className="text-[11px] font-mono text-emerald-400/90">
                SWINE WASTE LOADING &amp; DIGESTER CAPACITY CHECK
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Adjust herd size, dilution ratio, and retention time to verify the simulated{' '}
                <span className="font-mono text-slate-200">19.0 m³</span> digester chamber.
              </p>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="calc-swine-heads" className="font-medium text-slate-300">
                  Swine Population (Head)
                </label>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {swineHeads} head
                </span>
              </div>
              <input
                id="calc-swine-heads"
                type="range"
                min={40}
                max={240}
                step={10}
                value={swineHeads}
                onChange={(e) => setSwineHeads(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer no-print"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="calc-manure-kg" className="font-medium text-slate-300">
                  Wet Manure / Head / Day
                </label>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {manurePerHead.toFixed(2)} kg
                </span>
              </div>
              <input
                id="calc-manure-kg"
                type="range"
                min={1.5}
                max={3.5}
                step={0.05}
                value={manurePerHead}
                onChange={(e) => setManurePerHead(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer no-print"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="calc-water-ratio" className="font-medium text-slate-300">
                  Dilution Ratio (Water : Manure)
                </label>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {waterRatio.toFixed(1)} : 1
                </span>
              </div>
              <input
                id="calc-water-ratio"
                type="range"
                min={0.5}
                max={2.0}
                step={0.1}
                value={waterRatio}
                onChange={(e) => setWaterRatio(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer no-print"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <label htmlFor="calc-hrt-days" className="font-medium text-slate-300">
                  Target Hydraulic Retention Time (HRT)
                </label>
                <span className="font-mono font-semibold text-white tabular-nums">
                  {targetHrt} days
                </span>
              </div>
              <input
                id="calc-hrt-days"
                type="range"
                min={25}
                max={50}
                step={1}
                value={targetHrt}
                onChange={(e) => setTargetHrt(Number(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer no-print"
              />
            </div>
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="text-[11px] font-mono text-slate-400">DAILY INFLUENT SLURRY (Q)</p>
              <p className="text-2xl font-mono font-semibold text-white mt-1 tabular-nums">
                {dailySlurryM3.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">m³/day</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">
                {dailyManureKg.toFixed(0)} kg manure + {dailyWaterL.toFixed(0)} L water
              </p>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="text-[11px] font-mono text-slate-400">REQUIRED ACTIVE VOLUME (Q × HRT)</p>
              <p className="text-2xl font-mono font-semibold text-white mt-1 tabular-nums">
                {requiredActiveVol.toFixed(2)}{' '}
                <span className="text-xs font-normal text-slate-400">m³</span>
              </p>
              <p className="text-xs mt-1 font-mono tabular-nums">
                {digesterFits ? (
                  <span className="text-emerald-400">
                    ● Fits 19.0 m³ reactor ({capacityUtilizationPct.toFixed(0)}% load)
                  </span>
                ) : (
                  <span className="text-rose-400">
                    ✖ Exceeds 19.0 m³ reactor ({capacityUtilizationPct.toFixed(0)}% load)
                  </span>
                )}
              </p>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="text-[11px] font-mono text-slate-400">ESTIMATED DAILY BIOGAS YIELD</p>
              <p className="text-2xl font-mono font-semibold text-emerald-300 mt-1 tabular-nums">
                {estimatedGasLow.toFixed(1)}–{estimatedGasHigh.toFixed(1)}{' '}
                <span className="text-xs font-normal text-slate-400">m³/day</span>
              </p>
              <p className="text-xs text-slate-400 mt-1 tabular-nums">
                ~{estimatedMethaneMid.toFixed(1)} m³/day pure CH₄ (at 62% methane)
              </p>
            </div>

            <div className="border border-slate-800 rounded-lg p-4 bg-slate-950/80">
              <p className="text-[11px] font-mono text-slate-400">GAS CHAMBER STORAGE RATIO</p>
              <p className="text-2xl font-mono font-semibold text-white mt-1 tabular-nums">
                {domeRatioPct.toFixed(0)}%{' '}
                <span className="text-xs font-normal text-slate-400">of daily yield</span>
              </p>
              <p className="text-xs text-slate-400 mt-1">
                4.80 m³ masonry dome headspace vs. peak daily generation
              </p>
            </div>
          </div>
        </div>

        {/* Live Overall PAES Compliance Summary Bar */}
        <div
          className={`rounded-lg border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs ${
            feedingCompliant && digesterFits
              ? 'bg-emerald-950/35 border-emerald-700/60 text-emerald-200'
              : 'bg-rose-950/35 border-rose-800/60 text-rose-200'
          }`}
        >
          <div className="font-mono font-semibold">
            {feedingCompliant && digesterFits
              ? '● WORKBENCH VERDICT: PAES 413:2001 FEEDING & DIGESTER SIZING COMPLIANT'
              : `✖ WORKBENCH VERDICT: NON-COMPLIANT (${[!inletPass && 'Sec. 6.2 Inlet < 0.20 m', !slopePass && 'Sec. 7.1.1 Slope < 2.0%', !digesterFits && 'Volume > 19.0 m³'].filter(Boolean).join(' · ')})`}
          </div>
          <span className="font-mono text-[11px] text-slate-400">
            Educational Simulation · PAES 413:2001
          </span>
        </div>
      </div>
    </div>
  );
};
