'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Cloud, FolderOpen, Plus, Loader2 } from 'lucide-react';
import { Finding, ReportData, SectionHeights, defaultReport } from '@/lib/types';
import { generateHTML } from '@/lib/generateHTML';
import ReportMeta from '@/components/builder/ReportMeta';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import FindingsList from '@/components/builder/FindingsList';
import BusinessImpact from '@/components/builder/BusinessImpact';
import ReportPreview from '@/components/preview/ReportPreview';
import ReportsManager from '@/components/ui/ReportsManager';
import ExportValidationModal from '@/components/ui/ExportValidationModal';

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

  // ── Supabase & Autosave State ──────────────────────────────────────────
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReportsManager, setShowReportsManager] = useState(false);
  const [pendingExport, setPendingExport] = useState<'pdf' | 'html' | null>(null);
  const [debouncedData] = useDebounce(data, 2000); // 2 seconds delay
  const isFirstRender = useRef(true);

  // Autosave Effect
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const saveToCloud = async () => {
      setIsSaving(true);
      try {
        const method = currentReportId ? 'PUT' : 'POST';
        const url = currentReportId ? `/api/reports/${currentReportId}` : '/api/reports';
        
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: debouncedData.reportTitle,
            client: debouncedData.client,
            reportStatus: debouncedData.reportStatus,
            data: debouncedData,
          }),
        });

        if (!res.ok) throw new Error('Error al autoguardar');
        const result = await res.json();
        
        if (!currentReportId && result.id) {
          setCurrentReportId(result.id);
        }
        setLastSaved(new Date());
      } catch (error) {
        console.error('Autosave failed', error);
        // Silently fail or use toast, since it's autosave we might not want to spam the user.
      } finally {
        setIsSaving(false);
      }
    };

    saveToCloud();
  }, [debouncedData]); // Triggered every time debouncedData changes

  const handleNewReport = () => {
    if (confirm('¿Empezar un reporte nuevo? Perderás los cambios no guardados en el reporte actual si no le diste tiempo al autoguardado.')) {
      setData(defaultReport);
      setCurrentReportId(null);
      setLastSaved(null);
      isFirstRender.current = true; // reset to avoid immediate save
      toast.info('Nuevo reporte iniciado');
    }
  };

  const handleLoadReport = (id: string, loadedData: ReportData) => {
    setData(loadedData);
    setCurrentReportId(id);
    setLastSaved(new Date());
    setShowReportsManager(false);
    isFirstRender.current = true; // prevent immediate re-save
  };

  // ── Export handlers ────────────────────────────────────────────────────
  // Raw export functions (called after validation confirmation)
  const doExportHTML = useCallback(() => {
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

  // Interceptors that show validation modal first
  const handleExportHTML = useCallback(() => {
    setPendingExport('html');
  }, []);

  const handleExportPDF = useCallback(async () => {
    setPendingExport('pdf');
  }, []);

  const doExportPDF = useCallback(async () => {
    toast.info('Generando PDF, por favor espera...');
    const html = generateHTML(data);
    const clientSlug = data.client.replace(/\s+/g, '_') || 'cliente';
    const filename = `Auditoria_QA_${clientSlug}_${Date.now()}.pdf`;
    
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.width = '1000px';
      iframe.style.height = '1000px';
      iframe.style.left = '-9999px';
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('No iframe document');

      // Inject the HTML and html2pdf library into the iframe
      const iframeHtml = `
        <!DOCTYPE html>
        <html>
          <head>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
            <style>
              /* Overrides for PDF generation to remove white margins */
              body { background: white !important; margin: 0 !important; padding: 0 !important; }
              .page { margin: 0 !important; max-width: 100% !important; border-radius: 0 !important; box-shadow: none !important; }
            </style>
          </head>
          <body>
            <div id="pdf-content">${html}</div>
            <script>
              window.onload = () => {
                const element = document.getElementById('pdf-content');
                const opt = {
                  margin:       0,
                  filename:     '${filename}',
                  image:        { type: 'jpeg', quality: 0.98 },
                  html2canvas:  { scale: 2, useCORS: true, windowWidth: 1000 },
                  jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
                  pagebreak:    { mode: ['css', 'avoid-all'] }
                };
                
                html2pdf().set(opt).from(element).outputPdf('blob').then(function(pdfBlob) {
                  window.parent.postMessage({ type: 'pdf-done', blob: pdfBlob }, '*');
                }).catch(function(err) {
                  window.parent.postMessage({ type: 'pdf-error' }, '*');
                });
              };
            </script>
          </body>
        </html>
      `;

      doc.open();
      doc.write(iframeHtml);
      doc.close();

      // Listen for message from iframe
      await new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          if (e.data && e.data.type === 'pdf-done') {
            window.removeEventListener('message', handler);
            
            // Create a download link for the blob in the main window
            const url = URL.createObjectURL(e.data.blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            resolve(true);
          } else if (e.data && e.data.type === 'pdf-error') {
            window.removeEventListener('message', handler);
            reject(new Error('html2pdf internal error'));
          }
        };
        window.addEventListener('message', handler);
        // Timeout after 30 seconds just in case
        setTimeout(() => {
          window.removeEventListener('message', handler);
          reject(new Error('Timeout'));
        }, 30000);
      });

      document.body.removeChild(iframe);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF. Verifica la consola.');
    }
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
          {/* Cloud Status */}
          <div className="flex items-center gap-1.5 mr-2 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400 border border-slate-700/50">
            {isSaving ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" /> Guardando...</>
            ) : lastSaved ? (
              <><Cloud className="w-3.5 h-3.5 text-green-400" /> Guardado {lastSaved.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}</>
            ) : (
              <><Cloud className="w-3.5 h-3.5" /> En local</>
            )}
          </div>

          <button
            onClick={handleNewReport}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 transition-colors flex items-center gap-1.5"
            title="Nuevo Reporte"
          >
            <Plus className="w-3.5 h-3.5" /> Nuevo
          </button>

          <button
            onClick={() => setShowReportsManager(true)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 transition-colors flex items-center gap-1.5 mr-2"
            title="Abrir Reporte Guardado"
          >
            <FolderOpen className="w-3.5 h-3.5" /> Abrir
          </button>

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

      {/* Reports Manager Modal */}
      {showReportsManager && (
        <ReportsManager
          onLoad={handleLoadReport}
          onClose={() => setShowReportsManager(false)}
        />
      )}

      {/* Export Validation Modal */}
      {pendingExport && (
        <ExportValidationModal
          data={data}
          exportType={pendingExport}
          onConfirm={() => {
            if (pendingExport === 'html') doExportHTML();
            else doExportPDF();
          }}
          onCancel={() => setPendingExport(null)}
        />
      )}
    </div>
  );
}
