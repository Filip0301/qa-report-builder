'use client';

import React, { useState, useCallback } from 'react';
import { Finding, ReportData, SectionHeights, defaultReport } from '@/lib/types';
import { generateHTML } from '@/lib/generateHTML';
import ReportMeta from '@/components/builder/ReportMeta';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import FindingsList from '@/components/builder/FindingsList';
import BusinessImpact from '@/components/builder/BusinessImpact';
import ReportPreview from '@/components/preview/ReportPreview';

type Section = 'meta' | 'summary' | 'findings' | 'business';

const sections: { id: Section; label: string; icon: string }[] = [
  { id: 'meta', label: 'Datos del Informe', icon: '📋' },
  { id: 'summary', label: 'Resumen Ejecutivo', icon: '📝' },
  { id: 'findings', label: 'Hallazgos', icon: '🔍' },
  { id: 'business', label: 'Implicación de Negocio', icon: '📊' },
];

export default function HomePage() {
  const [data, setData] = useState<ReportData>(defaultReport);
  const [activeSection, setActiveSection] = useState<Section>('meta');
  const [showPreview, setShowPreview] = useState(true);
  const [exported, setExported] = useState(false);

  // ── Export handlers ────────────────────────────────────────────────────
  const handleExportHTML = useCallback(() => {
    const html = generateHTML(data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const clientSlug = data.client.replace(/\s+/g, '_') || 'cliente';
    a.href = url;
    a.download = `Auditoria_QA_${clientSlug}_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }, [data]);

  const handleExportPDF = useCallback(() => {
    const html = generateHTML(data);
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.open();
    win.document.write(html);
    win.document.close();
    win.onload = () => {
      setTimeout(() => {
        win.print();
      }, 500);
    };
  }, [data]);

  // ── Preview interaction callbacks ──────────────────────────────────────
  const handleReorder = useCallback((findings: Finding[]) => {
    setData(prev => ({ ...prev, findings }));
  }, []);

  const handleSectionResize = useCallback((heights: SectionHeights) => {
    setData(prev => ({ ...prev, sectionHeights: heights }));
  }, []);

  const handleFindingResize = useCallback((id: string, height: number) => {
    setData(prev => ({
      ...prev,
      findings: prev.findings.map(f => f.id === id ? { ...f, height } : f),
    }));
  }, []);

  // ── Stats ──────────────────────────────────────────────────────────────
  const criticalCount = data.findings.filter(f => f.severity === 'critical').length;
  const warningCount = data.findings.filter(f => f.severity === 'warning').length;
  const totalFindings = data.findings.length;

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/50">
            QA
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">QA Report Builder</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Generador de auditorías técnicas</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-2 ml-6">
          {totalFindings > 0 && (
            <>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">
                {totalFindings} hallazgo{totalFindings !== 1 ? 's' : ''}
              </span>
              {criticalCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-800/50">
                  🔴 {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}
                </span>
              )}
              {warningCount > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-900/40 text-yellow-300 border border-yellow-800/50">
                  🟡 {warningCount} advertencia{warningCount !== 1 ? 's' : ''}
                </span>
              )}
            </>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Preview Toggle */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              showPreview
                ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50'
                : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:text-white'
            }`}
          >
            {showPreview ? '⬅ Ocultar Preview' : '➡ Mostrar Preview'}
          </button>

          <button
            onClick={handleExportHTML}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all"
          >
            {exported ? '✅ Descargado!' : '⬇ Descargar HTML'}
          </button>

          <button
            onClick={handleExportPDF}
            className="text-xs font-bold px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/40"
          >
            🖨 Exportar PDF
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel: Builder */}
        <div className={`flex flex-col ${showPreview ? 'w-1/2' : 'w-full'} border-r border-slate-800 transition-all`}>
          {/* Section Nav */}
          <div className="flex border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                  activeSection === s.id
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-900/20'
                    : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
                {s.id === 'findings' && data.findings.length > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {data.findings.length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'meta' && (
              <ReportMeta data={data} onChange={setData} />
            )}
            {activeSection === 'summary' && (
              <ExecutiveSummary data={data} onChange={setData} />
            )}
            {activeSection === 'findings' && (
              <FindingsList data={data} onChange={setData} />
            )}
            {activeSection === 'business' && (
              <BusinessImpact data={data} onChange={setData} />
            )}
          </div>

          {/* Bottom CTA */}
          <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
            <span className="text-xs text-slate-600">
              Los cambios se reflejan en tiempo real en el preview →
            </span>
            <div className="flex gap-2">
              <button onClick={handleExportHTML} className="btn-secondary text-xs py-1.5">
                ⬇ HTML
              </button>
              <button onClick={handleExportPDF} className="btn-primary text-xs py-1.5">
                🖨 PDF
              </button>
            </div>
          </div>
        </div>

        {/* Right Panel: Preview */}
        {showPreview && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <ReportPreview
              data={data}
              onReorder={handleReorder}
              onResize={handleSectionResize}
              onFindingResize={handleFindingResize}
            />
          </div>
        )}
      </div>
    </div>
  );
}
