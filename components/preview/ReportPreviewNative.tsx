'use client';

import React, { useCallback, useRef, useState } from 'react';
import { Finding, ReportData, SectionHeights, severityConfig } from '@/lib/types';

interface Props {
  data: ReportData;
  onReorder: (findings: Finding[]) => void;
  onResize: (heights: SectionHeights) => void;
  onFindingResize: (id: string, height: number) => void;
}

// ─── Severity colors ────────────────────────────────────────────────────────
const SEVERITY_STYLES: Record<string, { border: string; bg: string; headerBg: string; badge: string }> = {
  critical:    { border: '#fca5a5', bg: '#fef2f2', headerBg: 'rgba(239,68,68,.08)', badge: 'rgba(239,68,68,.15)' },
  warning:     { border: '#fcd34d', bg: '#fffbeb', headerBg: 'rgba(245,158,11,.08)', badge: 'rgba(245,158,11,.15)' },
  info:        { border: '#93c5fd', bg: '#eff6ff', headerBg: 'rgba(59,130,246,.08)',  badge: 'rgba(59,130,246,.15)' },
  improvement: { border: '#c4b5fd', bg: '#f5f3ff', headerBg: 'rgba(139,92,246,.08)', badge: 'rgba(139,92,246,.15)' },
};

// ─── Resize handle ──────────────────────────────────────────────────────────
function ResizeHandle({ onResize }: { onResize: (delta: number) => void }) {
  const startY = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startY.current = e.clientY;

    const onMove = (ev: MouseEvent) => {
      onResize(ev.clientY - startY.current);
      startY.current = ev.clientY;
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center cursor-ns-resize group/rh"
      title="Arrastra para redimensionar"
    >
      <div className="w-12 h-1 rounded-full bg-slate-300 group-hover/rh:bg-indigo-400 transition-colors opacity-0 group-hover/rh:opacity-100" />
    </div>
  );
}

// ─── Individual finding card in preview ─────────────────────────────────────
function FindingCardPreview({
  finding,
  index,
  isDragging,
  isOver,
  onDragStart,
  onDragOver,
  onDrop,
  onResize,
}: {
  finding: Finding;
  index: number;
  isDragging: boolean;
  isOver: boolean;
  onDragStart: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onResize: (delta: number) => void;
}) {
  const style = SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.info;
  const cfg = severityConfig[finding.severity];
  const num = String(index + 1).padStart(2, '0');
  const height = finding.height;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative rounded-xl border overflow-visible transition-all duration-150 select-none group/card
        ${isDragging ? 'opacity-40 scale-[0.98]' : 'opacity-100'}
        ${isOver ? 'ring-2 ring-indigo-400 ring-offset-2' : ''}
      `}
      style={{
        borderColor: style.border,
        background: style.bg,
        height: height ? `${height}px` : undefined,
        overflow: height ? 'hidden' : undefined,
        cursor: 'grab',
      }}
    >
      {/* Drag indicator */}
      <div
        className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/card:opacity-60 transition-opacity pointer-events-none z-10 flex flex-col gap-0.5"
      >
        {[0,1,2].map(i => (
          <div key={i} className="flex gap-0.5">
            <div className="w-1 h-1 rounded-full bg-slate-400" />
            <div className="w-1 h-1 rounded-full bg-slate-400" />
          </div>
        ))}
      </div>

      {/* Card Header */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b"
        style={{ borderColor: style.border, background: style.headerBg }}
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm flex-shrink-0"
          style={{ background: style.badge }}
        >
          {cfg.emoji}
        </span>
        <span className="font-bold text-sm text-slate-800 flex-1 truncate">
          {finding.title || <span className="text-slate-400 font-normal italic">Sin título</span>}
        </span>
        <span
          className="text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
          style={{ background: style.badge, color: style.border.replace('0.4', '1') }}
        >
          {cfg.label} #{num}
        </span>
      </div>

      {/* Card Body */}
      <div className="px-5 py-4 space-y-3 text-sm text-slate-700">
        {finding.description && (
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-0.5">Descripción</span>
            <span
              className="leading-relaxed rte-content"
              dangerouslySetInnerHTML={{ __html: finding.description }}
            />
          </div>
        )}
        {finding.location && (
          <div className="grid grid-cols-[120px_1fr] gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 pt-0.5">Ubicación</span>
            <span className="leading-relaxed">{finding.location}</span>
          </div>
        )}
        {finding.codeBlock?.content && (
          <div className="rounded-lg bg-slate-900 overflow-hidden text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border-b border-slate-700">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="ml-auto text-slate-500 uppercase tracking-wider text-[10px]">
                {finding.codeBlock.language || 'JSON'}
              </span>
            </div>
            <pre className="p-3 text-slate-300 text-xs overflow-x-auto whitespace-pre-wrap max-h-40">
              {finding.codeBlock.content}
            </pre>
          </div>
        )}
        {finding.image && (
          <div>
            <img
              src={finding.image}
              alt={finding.imageCaption || 'Evidencia'}
              className="max-h-32 rounded-lg border border-slate-200 object-contain"
            />
            {finding.imageCaption && (
              <p className="text-xs text-slate-500 mt-1 italic">{finding.imageCaption}</p>
            )}
          </div>
        )}
        {finding.impact && (
          <div className="flex gap-2 p-3 rounded-lg bg-indigo-50 border border-indigo-100 text-xs">
            <span className="text-base leading-none mt-0.5">📉</span>
            <span className="rte-content">
              <strong className="text-indigo-700">Impacto: </strong>
              <span dangerouslySetInnerHTML={{ __html: finding.impact }} />
            </span>
          </div>
        )}
        {finding.solution && (
          <div className="flex gap-2 p-3 rounded-lg bg-green-50 border border-green-100 text-xs">
            <span className="text-base leading-none mt-0.5">✅</span>
            <span className="rte-content">
              <strong className="text-green-700">Solución IT: </strong>
              <span dangerouslySetInnerHTML={{ __html: finding.solution }} />
            </span>
          </div>
        )}
      </div>

      {/* Resize handle */}
      <ResizeHandle onResize={onResize} />
    </div>
  );
}

// ─── Section wrapper with resize ────────────────────────────────────────────
function ResizableSection({
  height,
  onResize,
  children,
  className = '',
}: {
  height?: number;
  onResize: (delta: number) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative group/sec ${className}`}
      style={height ? { height: `${height}px`, overflow: 'hidden' } : undefined}
    >
      {children}
      <ResizeHandle onResize={onResize} />
    </div>
  );
}

// ─── Main native preview ─────────────────────────────────────────────────────
export default function ReportPreviewNative({ data, onReorder, onResize, onFindingResize }: Props) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const heights = data.sectionHeights ?? {};

  // ── Drag & Drop handlers ──────────────────────────────────────────────
  const handleDragStart = useCallback((i: number) => {
    setDragIndex(i);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, i: number) => {
    e.preventDefault();
    setOverIndex(i);
  }, []);

  const handleDrop = useCallback(
    (dropIndex: number) => {
      if (dragIndex === null || dragIndex === dropIndex) {
        setDragIndex(null);
        setOverIndex(null);
        return;
      }
      const next = [...data.findings];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(dropIndex, 0, moved);
      onReorder(next);
      setDragIndex(null);
      setOverIndex(null);
    },
    [dragIndex, data.findings, onReorder]
  );

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setOverIndex(null);
  }, []);

  // ── Status badge ──────────────────────────────────────────────────────
  const statusBadge =
    data.status === 'critical' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-300">
        ● Crítico / Acción Requerida
      </span>
    ) : data.status === 'warning' ? (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700 border border-yellow-300">
        ● Advertencia
      </span>
    ) : (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-300">
        ● OK
      </span>
    );

  return (
    <div
      className="h-full overflow-y-auto bg-slate-100"
      onDragEnd={handleDragEnd}
    >
      {/* Tip banner */}
      <div className="sticky top-0 z-20 flex items-center gap-2 px-4 py-2 bg-indigo-900/90 backdrop-blur-sm text-indigo-200 text-xs border-b border-indigo-700/50">
        <span>✦</span>
        <span>Modo Edición — <strong>arrastra</strong> los hallazgos para reordenarlos · <strong>arrastra el borde inferior</strong> de cualquier sección para redimensionarla</span>
      </div>

      {/* Report page */}
      <div className="max-w-[860px] mx-auto my-8 bg-white rounded-2xl shadow-xl overflow-hidden">

        {/* ── Header ─────────────────────────────────────── */}
        <div
          className="px-14 py-12 relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a1f36 0%, #2d3561 60%, #4f46e5 100%)' }}
        >
          <div className="absolute top-[-60px] right-[-60px] w-64 h-64 rounded-full opacity-[0.04] bg-white" />
          <div className="absolute bottom-[-80px] right-[120px] w-48 h-48 rounded-full bg-indigo-500/30" />
          <span className="relative z-10 inline-block mb-4 px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-red-500/20 border border-red-500/40 text-red-300">
            ⚠ Auditoría Técnica
          </span>
          <h1 className="relative z-10 text-2xl font-extrabold text-white leading-snug max-w-xl">
            {data.reportTitle || 'Título del Reporte'}
          </h1>
          <div className="relative z-10 flex flex-wrap gap-6 mt-6">
            {[
              { label: 'Cliente', value: data.client },
              data.auditor ? { label: 'Auditor', value: data.auditor } : null,
              { label: 'Fecha', value: data.date },
              { label: 'Estado', value: statusBadge },
            ]
              .filter(Boolean)
              .map((item, i) =>
                item ? (
                  <div key={i} className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-semibold uppercase tracking-widest text-white/50">
                      {item.label}
                    </span>
                    {typeof item.value === 'string' ? (
                      <span className="text-sm font-semibold text-white">{item.value}</span>
                    ) : (
                      item.value
                    )}
                  </div>
                ) : null
              )}
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────── */}
        <div className="px-14 py-12 space-y-10">

          {/* Section 1 — Executive Summary */}
          <section>
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-5 pb-3 border-b-2 border-slate-200">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-bold">1</span>
              Resumen Ejecutivo
            </h2>
            <ResizableSection
              height={heights.summary}
              onResize={(d) => onResize({ ...heights, summary: (heights.summary ?? 120) + d })}
              className="pb-3"
            >
              <div
                className="text-sm text-slate-600 leading-relaxed bg-slate-50 border-l-4 border-indigo-500 rounded-r-xl px-6 py-5 rte-content"
                dangerouslySetInnerHTML={{ __html: data.executiveSummary || '<span style="color:#94a3b8;font-style:italic">Sin resumen ejecutivo aún.</span>' }}
              />
            </ResizableSection>
          </section>

          <hr className="border-slate-200" />

          {/* Section 2 — Findings */}
          <section>
            <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-5 pb-3 border-b-2 border-slate-200">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-bold">2</span>
              Hallazgos Detectados
              {data.findings.length > 0 && (
                <span className="ml-auto text-xs font-normal text-slate-400 normal-case tracking-normal">
                  Arrastra para reordenar
                </span>
              )}
            </h2>

            {data.findings.length === 0 ? (
              <p className="text-slate-400 italic text-sm">No se han registrado hallazgos.</p>
            ) : (
              <div className="space-y-5">
                {data.findings.map((f, i) => (
                  <FindingCardPreview
                    key={f.id}
                    finding={f}
                    index={i}
                    isDragging={dragIndex === i}
                    isOver={overIndex === i && dragIndex !== i}
                    onDragStart={() => handleDragStart(i)}
                    onDragOver={(e) => handleDragOver(e, i)}
                    onDrop={() => handleDrop(i)}
                    onResize={(delta) =>
                      onFindingResize(f.id, Math.max(80, (f.height ?? 200) + delta))
                    }
                  />
                ))}
              </div>
            )}
          </section>

          {/* Section 3 — Business Impact */}
          {data.businessPoints.length > 0 && (
            <>
              <hr className="border-slate-200" />
              <section>
                <h2 className="flex items-center gap-3 text-lg font-bold text-slate-800 mb-5 pb-3 border-b-2 border-slate-200">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white text-sm font-bold">3</span>
                  Implicación de Negocio
                </h2>
                <ResizableSection
                  height={heights.business}
                  onResize={(d) => onResize({ ...heights, business: (heights.business ?? 80) + d })}
                  className="pb-3"
                >
                  <ul className="space-y-3">
                    {data.businessPoints.map((bp, i) => (
                      <li key={bp.id} className="flex gap-3 items-baseline text-sm text-slate-700">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex-shrink-0">
                          {i + 1}
                        </span>
                        <span className="rte-content">
                          {bp.title && <strong>{bp.title}: </strong>}
                          <span dangerouslySetInnerHTML={{ __html: bp.description }} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </ResizableSection>
              </section>
            </>
          )}
        </div>

        {/* ── Footer ─────────────────────────────────────── */}
        <div className="flex items-center justify-between px-14 py-5 bg-slate-50 border-t border-slate-200">
          <span className="text-sm font-bold text-slate-400 tracking-wide">{data.footerBrand}</span>
          <span className="text-xs text-slate-400">{data.footerNote}</span>
        </div>
      </div>
    </div>
  );
}
