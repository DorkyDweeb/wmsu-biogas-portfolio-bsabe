import React, { useMemo, useState } from 'react';
import { Box, ChevronDown, ChevronRight, FileText, Search } from 'lucide-react';
import {
  ComponentId,
  ComplianceStatus,
  GREEN_PASTURES_CH5_INSPECTION,
  GREEN_PASTURES_PAES_CLAUSES,
  PAES_EVALUATION_ITEMS,
  PaesEvaluationItem,
} from '../data/portfolioData';

interface ComplianceSectionProps {
  highlightedEvalId: string | null;
  onInspectIn3D: (id: ComponentId) => void;
}

function StatusText({ status }: { status: ComplianceStatus }) {
  if (status === 'Compliant') {
    return <span className="font-mono text-xs font-semibold text-emerald-400">● Compliant</span>;
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

export const ComplianceSection: React.FC<ComplianceSectionProps> = ({
  highlightedEvalId,
  onInspectIn3D,
}) => {
  const [statusFilter, setStatusFilter] = useState<'All' | ComplianceStatus>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEvalIds, setExpandedEvalIds] = useState<Record<string, boolean>>({
    'eval-1': true,
    'eval-2': true,
  });

  const toggleEval = (id: string) => {
    setExpandedEvalIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const counts = useMemo(() => {
    return {
      All: PAES_EVALUATION_ITEMS.length,
      Compliant: PAES_EVALUATION_ITEMS.filter((i) => i.status === 'Compliant').length,
      'Partially Compliant': PAES_EVALUATION_ITEMS.filter(
        (i) => i.status === 'Partially Compliant'
      ).length,
      'Non-Compliant': PAES_EVALUATION_ITEMS.filter((i) => i.status === 'Non-Compliant').length,
    };
  }, []);

  const filteredRows = useMemo(() => {
    return PAES_EVALUATION_ITEMS.filter((item) => {
      const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
      const q = searchTerm.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.componentName.toLowerCase().includes(q) ||
        item.paesReference.toLowerCase().includes(q) ||
        item.requirementSummary.toLowerCase().includes(q) ||
        item.simulatedCondition.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [statusFilter, searchTerm]);

  return (
    <div className="space-y-16">
      {/* SECTION 4: APPLICABLE PAES REQUIREMENTS (GREEN PASTURES SWINE FARM) */}
      <section id="section-4" className="scroll-mt-24 space-y-6 section-reveal">
        <div className="border-b border-slate-800/90 pb-4">
          <p className="text-xs font-mono text-emerald-400/90">
            SECTION 04 · NORMATIVE BASIS (GREEN PASTURES SWINE FARM)
          </p>
          <h2 className="text-2xl font-semibold text-white mt-1">
            04. Applicable PAES Requirements
          </h2>
        </div>

        {/* 4.1 Applicable Standard */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2 text-sm text-slate-300 leading-relaxed">
          <p className="text-xs font-mono font-semibold text-slate-400">
            4.1 APPLICABLE STANDARD
          </p>
          <p className="font-semibold text-white">
            Standard:{' '}
            <span className="font-mono text-emerald-300">
              PAES 413:2001 – Agricultural Structures – Biogas Plant
            </span>
          </p>
          <p className="text-xs text-slate-400 leading-relaxed">
            The following clauses are the specific provisions used in this simulated assessment. Only the relevant requirements are presented; the entire PAES document is not reproduced.
          </p>
        </div>

        {/* 4.2 & 4.3 Evaluated PAES Clauses */}
        <div className="space-y-5">
          {GREEN_PASTURES_PAES_CLAUSES.map((clause) => (
            <article
              key={clause.id}
              className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden"
            >
              <div className="px-5 py-4 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-mono text-slate-400">
                    {clause.sectionLabel} · PAES CLAUSE EVALUATION
                  </p>
                  <h3 className="text-base font-semibold text-white mt-0.5">{clause.title}</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-semibold text-rose-400">
                    ✖ {clause.result}
                  </span>
                  <button
                    type="button"
                    onClick={() => onInspectIn3D(clause.componentId)}
                    className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-emerald-300 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 rounded-md transition-colors whitespace-nowrap"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Focus in 3D</span>
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-4">
                <div className="bg-emerald-950/35 border border-emerald-800/60 rounded-lg p-3.5 text-xs text-emerald-100">
                  <span className="font-mono font-semibold text-emerald-300">
                    Requirement from the supplied excerpt:{' '}
                  </span>
                  <span className="italic font-medium">{clause.excerptQuote}</span>
                </div>

                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800">
                        <th className="py-2.5 px-3.5 w-48">Required Information</th>
                        <th className="py-2.5 px-3.5">Assessment Detail</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80 text-slate-300">
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          PAES number and title
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-slate-200">{clause.paesNumberAndTitle}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          Relevant provision
                        </td>
                        <td className="py-2.5 px-3.5 font-medium text-slate-200">{clause.relevantProvision}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          Applicable requirement
                        </td>
                        <td className="py-2.5 px-3.5">{clause.applicableRequirement}</td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          Technical parameter
                        </td>
                        <td className="py-2.5 px-3.5 font-mono text-emerald-300 font-semibold">
                          {clause.technicalParameter}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">Simulated value</td>
                        <td className="py-2.5 px-3.5 font-mono text-rose-400 font-semibold">
                          {clause.simulatedValue}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3.5 font-medium text-white">
                          Relevance to the case
                        </td>
                        <td className="py-2.5 px-3.5">{clause.relevanceToCase}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-slate-950/75 border border-slate-800 rounded-lg p-3.5 text-xs text-slate-300 leading-relaxed">
                  <p className="font-mono font-semibold text-white mb-1">
                    WHY THIS REQUIREMENT IS RELEVANT:
                  </p>
                  <p>{clause.whyRelevant}</p>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* 4.4 Summary of Applicable Requirements */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-3">
          <div>
            <p className="text-[11px] font-mono text-slate-400">4.4 SUMMARY MATRIX</p>
            <h3 className="text-base font-semibold text-white mt-0.5">
              4.4 Summary of Applicable Requirements
            </h3>
          </div>
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 text-slate-300 font-mono border-b border-slate-800">
                  <th className="py-2.5 px-3.5">Provision</th>
                  <th className="py-2.5 px-3.5">PAES Minimum Criterion</th>
                  <th className="py-2.5 px-3.5">Simulated Measurement</th>
                  <th className="py-2.5 px-3.5">Result</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-300">
                {GREEN_PASTURES_PAES_CLAUSES.map((clause) => (
                  <tr key={clause.id} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3.5 font-semibold text-white">
                      {clause.relevantProvision}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-emerald-300">
                      {clause.paesMinimumCriterion}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-rose-400 font-semibold">
                      {clause.simulatedMeasurement}
                    </td>
                    <td className="py-2.5 px-3.5 font-mono text-rose-400 font-semibold">
                      ✖ {clause.result}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 5: SIMULATED INSPECTION / EVALUATION (CHAPTER 5) */}
      <section id="section-5" className="scroll-mt-24 space-y-6 section-reveal">
        <div className="border-b border-slate-800/90 pb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-mono text-emerald-400/90">
              SECTION 05 · GREEN PASTURES SWINE FARM FIELD AUDIT (SIMULATED)
            </p>
            <h2 className="text-2xl font-semibold text-white mt-1">
              05. Simulated Inspection / Evaluation
            </h2>
          </div>

          <a
            href="/assets/aistudio/BABE-101-CHAPTERS-5-6_876b5136.pdf"
            target="_blank"
            rel="noreferrer"
            className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-900 border border-slate-700 hover:border-emerald-500/60 hover:text-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Chapters 5–6 PDF</span>
          </a>
        </div>

        {/* Chapter 5 Narrative Overview */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-2.5 text-sm text-slate-300 leading-relaxed">
          {GREEN_PASTURES_CH5_INSPECTION.intro.map((para, idx) => (
            <p key={idx}>{para}</p>
          ))}
        </div>

        {/* 5.1 Substrate Loading and Inlet System Audit */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <p className="text-xs font-mono text-rose-400 font-semibold">
              5.1 SUBSTRATE LOADING AND INLET SYSTEM AUDIT · NON-COMPLIANT PATHWAY
            </p>
            <h3 className="text-base font-semibold text-white mt-0.5">
              5.1 Substrate Loading and Inlet System Audit
            </h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {GREEN_PASTURES_CH5_INSPECTION.subsection51Intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {[
              GREEN_PASTURES_CH5_INSPECTION.inletPipeAudit,
              GREEN_PASTURES_CH5_INSPECTION.feedingChannelAudit,
            ].map((audit) => (
              <div
                key={audit.componentId}
                className="border border-slate-800 rounded-lg p-4 bg-slate-950/75 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{audit.title}</h4>
                    <span className="font-mono text-[11px] font-semibold text-rose-400 shrink-0">
                      ✖ Non-Compliant
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <span className="font-semibold text-white">Field Measurement (Simulated): </span>
                    {audit.fieldMeasurement}
                  </div>
                  <div className="text-xs text-emerald-100 bg-emerald-950/40 border border-emerald-800/60 rounded-md p-2.5 leading-relaxed">
                    <span className="font-semibold text-emerald-300">PAES Standard Requirement: </span>
                    {audit.paesRequirement}
                  </div>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onInspectIn3D(audit.componentId)}
                    className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Focus in 3D Twin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5.2 Digester Tank and Gas Safety Equipment Evaluation */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <p className="text-xs font-mono text-emerald-400 font-semibold">
              5.2 DIGESTER TANK AND GAS SAFETY EQUIPMENT EVALUATION · COMPLIANT CORE
            </p>
            <h3 className="text-base font-semibold text-white mt-0.5">
              5.2 Digester Tank and Gas Safety Equipment Evaluation
            </h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {GREEN_PASTURES_CH5_INSPECTION.subsection52Intro}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {[
              GREEN_PASTURES_CH5_INSPECTION.digesterWallAudit,
              GREEN_PASTURES_CH5_INSPECTION.gasOutletAudit,
            ].map((item) => (
              <div
                key={item.componentId}
                className="border border-slate-800 rounded-lg p-4 bg-slate-950/75 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-semibold text-white">{item.title}</h4>
                    <span className="font-mono text-[11px] font-semibold text-emerald-400 shrink-0">
                      ● Compliant
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{item.summary}</p>
                </div>
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onInspectIn3D(item.componentId)}
                    className="no-print inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                  >
                    <Box className="w-3.5 h-3.5" />
                    <span>Focus in 3D Twin</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5.3 Inspection Summary */}
        <div className="bg-emerald-950/35 text-slate-100 border border-emerald-800/60 rounded-xl p-5 space-y-2">
          <p className="text-xs font-mono text-emerald-400">5.3 INSPECTION SUMMARY</p>
          <p className="text-sm text-slate-200 leading-relaxed">
            {GREEN_PASTURES_CH5_INSPECTION.summary53}
          </p>
        </div>

        {/* Five-Question ABE Detailed Item Cards (Linked with 3D Modal Inspection) */}
        <div className="space-y-3 pt-2">
          <p className="text-xs font-mono text-slate-400">
            FIVE-QUESTION TECHNICAL EVALUATION BREAKDOWN (EXPANDABLE ITEMS 01–04)
          </p>
          {PAES_EVALUATION_ITEMS.map((item: PaesEvaluationItem) => {
            const isOpen = !!expandedEvalIds[item.id] || highlightedEvalId === item.id;
            return (
              <div
                key={item.id}
                id={`eval-card-${item.id}`}
                className={`bg-slate-900/90 border rounded-lg transition-colors ${
                  highlightedEvalId === item.id ? 'border-emerald-500' : 'border-slate-800'
                }`}
              >
                <div className="px-5 py-4 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => toggleEval(item.id)}
                    className="flex items-center gap-3 text-left flex-1 min-w-[240px]"
                  >
                    {isOpen ? (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                    <div>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span className="font-mono tabular-nums">0{item.no}</span>
                        <span aria-hidden="true">·</span>
                        <span>{item.paesReference}</span>
                      </div>
                      <h3 className="text-base font-semibold text-white mt-0.5">
                        {item.componentName}
                      </h3>
                    </div>
                  </button>

                  <div className="flex items-center gap-4 shrink-0">
                    <StatusText status={item.status} />
                    <button
                      type="button"
                      onClick={() => onInspectIn3D(item.componentId)}
                      className="no-print flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 hover:text-emerald-300 bg-slate-950 border border-slate-700 hover:border-emerald-500/60 rounded-md transition-colors whitespace-nowrap"
                    >
                      <Box className="w-3.5 h-3.5" />
                      <span>Focus in 3D</span>
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="px-5 pb-5 pt-3 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-mono text-slate-400">
                          1. WHAT DOES THE PAES REQUIRE?
                        </p>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {item.q1WhatPaesRequires}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-slate-400">
                          2. WHAT DOES THE SIMULATED CASE PROVIDE?
                        </p>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {item.q2WhatCaseProvides}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-slate-400">
                          3. DOES THE SIMULATED CASE COMPLY?
                        </p>
                        <p className="text-white font-medium mt-1">{item.q3DoesItComply}</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-xs font-mono text-slate-400">
                          4. WHAT IS THE BASIS FOR THE ASSESSMENT?
                        </p>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {item.q4BasisForAssessment}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-slate-400">
                          5. WHAT SHOULD BE DONE IF NOT SATISFIED?
                        </p>
                        <p className="text-slate-300 mt-1 leading-relaxed">
                          {item.q5CorrectiveAction}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 6: COMPLIANCE ASSESSMENT TABLE (CHAPTER 6) */}
      <section id="section-6" className="scroll-mt-24 section-reveal">
        <div className="border-b border-slate-800/90 pb-4 mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-emerald-400/90">
              SECTION 06 · CHAPTER 6 COMPLIANCE TABLE (GREEN PASTURES SWINE FARM)
            </p>
            <h2 className="text-2xl font-semibold text-white mt-1">
              06. Compliance Assessment Table
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3 max-w-full">
            {/* Segmented Status Filter */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg max-w-full">
              {(['All', 'Compliant', 'Partially Compliant', 'Non-Compliant'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                      statusFilter === tab
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tab} ({counts[tab]})
                  </button>
                )
              )}
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter table..."
                aria-label="Filter compliance assessment table"
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto thin-scrollbar">
            <table className="w-full text-left border-collapse min-w-[960px]">
              <thead>
                <tr className="bg-slate-950 text-slate-300 text-[11px] font-mono border-b border-slate-800">
                  <th className="py-3 px-4 w-12">No.</th>
                  <th className="py-3 px-4 w-56">PAES Requirement / Standard</th>
                  <th className="py-3 px-4 w-64">Condition / Simulated Data</th>
                  <th className="py-3 px-4 w-44">Compliance Status</th>
                  <th className="py-3 px-4">Evaluation / Findings</th>
                  <th className="py-3 px-4">Recommendations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-xs text-slate-300 align-top">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No evaluation rows match the current filter.
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        highlightedEvalId === row.id
                          ? 'bg-emerald-950/35'
                          : 'hover:bg-slate-800/40'
                      }
                    >
                      <td className="py-3.5 px-4 font-mono font-semibold text-white tabular-nums">
                        {row.no}
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-semibold text-white">{row.componentName}</p>
                        <p className="font-mono text-[11px] text-emerald-400 mt-1">
                          {row.paesReference}
                        </p>
                        <p className="text-slate-400 mt-1 leading-relaxed">
                          {row.requirementSummary}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 leading-relaxed tabular-nums">
                        {row.simulatedCondition}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <StatusText status={row.status} />
                      </td>
                      <td className="py-3.5 px-4 leading-relaxed">
                        <p className="font-medium text-white">{row.q3DoesItComply}</p>
                        <p className="mt-1 text-slate-400">{row.q4BasisForAssessment}</p>
                      </td>
                      <td className="py-3.5 px-4 leading-relaxed">{row.recommendation}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};
