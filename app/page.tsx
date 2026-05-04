'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import { toast } from 'sonner';
import { Cloud, FolderOpen, Plus, Loader2 } from 'lucide-react';
import {
  AnyDocData, DocumentType, Finding, ReportData, SectionHeights,
  DLDocData, TaggingPlanData, GTMAuditData,
  defaultReport, defaultDLDoc, defaultTaggingPlan, defaultGTMAudit,
  getDocTitle,
} from '@/lib/types';
import { generateHTML } from '@/lib/generateHTML';
import { generateDLHTML } from '@/lib/generateDLHTML';
import { generateTaggingPlanHTML } from '@/lib/generateTaggingPlanHTML';
import { generateGTMAuditHTML } from '@/lib/generateGTMAuditHTML';

// QA builder components
import ReportMeta from '@/components/builder/ReportMeta';
import ExecutiveSummary from '@/components/builder/ExecutiveSummary';
import FindingsList from '@/components/builder/FindingsList';
import BusinessImpact from '@/components/builder/BusinessImpact';
import ReportPreview from '@/components/preview/ReportPreview';

// DL builder components
import DLMeta from '@/components/builder/datalayer/DLMeta';
import DLEventsList from '@/components/builder/datalayer/DLEventsList';
import DLVariablesList from '@/components/builder/datalayer/DLVariablesList';

// Tagging Plan builder components
import TPMeta from '@/components/builder/tagging-plan/TPMeta';
import TPItemsList from '@/components/builder/tagging-plan/TPItemsList';

// GTM Audit builder components
import GTMMeta from '@/components/builder/gtm-audit/GTMMeta';
import GTMTagsList from '@/components/builder/gtm-audit/GTMTagsList';
import GTMTriggersList from '@/components/builder/gtm-audit/GTMTriggersList';
import GTMVariablesList from '@/components/builder/gtm-audit/GTMVariablesList';

// UI components
import ReportsManager from '@/components/ui/ReportsManager';
import ExportValidationModal from '@/components/ui/ExportValidationModal';
import DocTypeSelector from '@/components/ui/DocTypeSelector';

// ── Section definitions per doc type ──────────────────────────────────────────
const sectionMap: Record<DocumentType, { id: string; label: string; icon: string }[]> = {
  'qa-audit':      [{ id:'meta', label:'Datos', icon:'📋' }, { id:'summary', label:'Resumen', icon:'📝' }, { id:'findings', label:'Hallazgos', icon:'🔍' }, { id:'business', label:'Negocio', icon:'📊' }],
  'datalayer-doc': [{ id:'meta', label:'Metadatos', icon:'📋' }, { id:'events', label:'Eventos', icon:'⚡' }, { id:'variables', label:'Variables', icon:'🔤' }],
  'tagging-plan':  [{ id:'meta', label:'Metadatos', icon:'📋' }, { id:'items', label:'Plan de Eventos', icon:'📌' }],
  'gtm-audit':     [{ id:'meta', label:'Metadatos', icon:'📋' }, { id:'tags', label:'Tags', icon:'🏷️' }, { id:'triggers', label:'Triggers', icon:'⚡' }, { id:'variables', label:'Variables', icon:'🔤' }],
};

const accentMap: Record<DocumentType, string> = {
  'qa-audit': 'indigo', 'datalayer-doc': 'teal', 'tagging-plan': 'violet', 'gtm-audit': 'emerald',
};

function generateDocHTML(data: AnyDocData): string {
  switch (data.docType) {
    case 'qa-audit':      return generateHTML(data as ReportData);
    case 'datalayer-doc': return generateDLHTML(data as DLDocData);
    case 'tagging-plan':  return generateTaggingPlanHTML(data as TaggingPlanData);
    case 'gtm-audit':     return generateGTMAuditHTML(data as GTMAuditData);
  }
}

export default function HomePage() {
  const [data, setData] = useState<AnyDocData>(defaultReport);
  const [docType, setDocType] = useState<DocumentType>('qa-audit');
  const [activeSection, setActiveSection] = useState<string>('meta');
  const [showPreview, setShowPreview] = useState(true);
  const [exported, setExported] = useState(false);

  // ── Supabase & Autosave State ──────────────────────────────────────────────
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showReportsManager, setShowReportsManager] = useState(false);
  const [showDocTypeSelector, setShowDocTypeSelector] = useState(false);
  const [pendingExport, setPendingExport] = useState<'pdf' | 'html' | null>(null);
  const [debouncedData] = useDebounce(data, 2000);
  const isFirstRender = useRef(true);

  // Autosave
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return; }
    const saveToCloud = async () => {
      setIsSaving(true);
      try {
        const method = currentReportId ? 'PUT' : 'POST';
        const url = currentReportId ? `/api/reports/${currentReportId}` : '/api/reports';
        const title = getDocTitle(debouncedData);
        const client = (debouncedData as any).client || '';
        const res = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title, client,
            reportStatus: (debouncedData as any).reportStatus || 'draft',
            docType: debouncedData.docType,
            data: debouncedData,
          }),
        });
        if (!res.ok) throw new Error('Error al autoguardar');
        const result = await res.json();
        if (!currentReportId && result.id) setCurrentReportId(result.id);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Autosave failed', error);
      } finally { setIsSaving(false); }
    };
    saveToCloud();
  }, [debouncedData]);

  const handleNewReport = () => {
    if (confirm('¿Empezar un documento nuevo? Los cambios no guardados se perderán.')) {
      setShowDocTypeSelector(true);
    }
  };

  const handleSelectDocType = (type: DocumentType) => {
    setShowDocTypeSelector(false);
    setCurrentReportId(null);
    setLastSaved(null);
    setDocType(type);
    setActiveSection('meta');
    isFirstRender.current = true;
    const defaults: Record<DocumentType, AnyDocData> = {
      'qa-audit': defaultReport, 'datalayer-doc': defaultDLDoc,
      'tagging-plan': defaultTaggingPlan, 'gtm-audit': defaultGTMAudit,
    };
    setData(defaults[type]);
    toast.info(`Nuevo documento: ${type}`);
  };

  const handleLoadReport = (id: string, loadedData: AnyDocData) => {
    // Handle old reports without docType
    const resolvedData = { ...loadedData, docType: loadedData.docType ?? 'qa-audit' } as AnyDocData;
    const resolvedType: DocumentType = resolvedData.docType ?? 'qa-audit';
    setData(resolvedData);
    setDocType(resolvedType);
    setCurrentReportId(id);
    setLastSaved(new Date());
    setShowReportsManager(false);
    setActiveSection('meta');
    isFirstRender.current = true;
  };

  // ── Export handlers ────────────────────────────────────────────────────────
  const doExportHTML = useCallback(() => {
    const html = generateDocHTML(data);
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const slug = ((data as any).client || 'doc').replace(/\s+/g, '_');
    a.href = url; a.download = `Doc_${slug}_${Date.now()}.html`;
    a.click(); URL.revokeObjectURL(url);
    setExported(true); setTimeout(() => setExported(false), 3000);
  }, [data]);

  const handleExportHTML = useCallback(() => setPendingExport('html'), []);
  const handleExportPDF  = useCallback(() => setPendingExport('pdf'),  []);

  const doExportPDF = useCallback(async () => {
    toast.info('Generando PDF, por favor espera...');
    const html = generateDocHTML(data);
    const slug = ((data as any).client || 'doc').replace(/\s+/g, '_');
    const filename = `Doc_${slug}_${Date.now()}.pdf`;
    try {
      const iframe = document.createElement('iframe');
      iframe.style.cssText = 'position:absolute;width:1000px;height:1000px;left:-9999px;';
      document.body.appendChild(iframe);
      const doc = iframe.contentWindow?.document;
      if (!doc) throw new Error('No iframe document');
      const iframeHtml = `<!DOCTYPE html><html><head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
        <style>body{background:white!important;margin:0!important;padding:0!important;}.page{margin:0!important;max-width:100%!important;border-radius:0!important;box-shadow:none!important;}</style>
        </head><body><div id="c">${html}</div>
        <script>window.onload=()=>{const opt={margin:0,filename:'${filename}',image:{type:'jpeg',quality:.98},html2canvas:{scale:2,useCORS:true,windowWidth:1000},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','avoid-all']}};html2pdf().set(opt).from(document.getElementById('c')).outputPdf('blob').then(b=>{window.parent.postMessage({type:'pdf-done',blob:b},'*');}).catch(()=>{window.parent.postMessage({type:'pdf-error'},'*');});}</script>
        </body></html>`;
      doc.open(); doc.write(iframeHtml); doc.close();
      await new Promise((resolve, reject) => {
        const handler = (e: MessageEvent) => {
          if (e.data?.type === 'pdf-done') {
            window.removeEventListener('message', handler);
            const url = URL.createObjectURL(e.data.blob);
            const a = document.createElement('a');
            a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); document.body.removeChild(a);
            URL.revokeObjectURL(url); resolve(true);
          } else if (e.data?.type === 'pdf-error') {
            window.removeEventListener('message', handler);
            reject(new Error('html2pdf internal error'));
          }
        };
        window.addEventListener('message', handler);
        setTimeout(() => { window.removeEventListener('message', handler); reject(new Error('Timeout')); }, 30000);
      });
      document.body.removeChild(iframe);
      toast.success('PDF descargado exitosamente');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF. Verifica la consola.');
    }
  }, [data]);

  // ── QA-specific callbacks (only used when docType === 'qa-audit') ──────────
  const handleReorder = useCallback((findings: Finding[]) => {
    setData(prev => ({ ...prev, findings } as AnyDocData));
  }, []);
  const handleSectionResize = useCallback((heights: SectionHeights) => {
    setData(prev => ({ ...prev, sectionHeights: heights } as AnyDocData));
  }, []);
  const handleFindingResize = useCallback((id: string, height: number) => {
    if (docType !== 'qa-audit') return;
    setData(prev => ({
      ...prev,
      findings: (prev as ReportData).findings.map(f => f.id === id ? { ...f, height } : f),
    } as AnyDocData));
  }, [docType]);

  // ── Derived values ─────────────────────────────────────────────────────────
  const sections = sectionMap[docType];
  const accent = accentMap[docType];
  const isQA = docType === 'qa-audit';
  const qaData = data as ReportData;
  const criticalCount = isQA ? qaData.findings.filter(f => f.severity === 'critical').length : 0;
  const warningCount  = isQA ? qaData.findings.filter(f => f.severity === 'warning').length  : 0;
  const totalFindings = isQA ? qaData.findings.length : 0;

  // Static accent classes per doc type (Tailwind needs full class strings, no interpolation)
  const accentTabActive: Record<DocumentType, string> = {
    'qa-audit':      'border-indigo-500 text-indigo-400 bg-indigo-900/20',
    'datalayer-doc': 'border-teal-500 text-teal-400 bg-teal-900/20',
    'tagging-plan':  'border-violet-500 text-violet-400 bg-violet-900/20',
    'gtm-audit':     'border-emerald-500 text-emerald-400 bg-emerald-900/20',
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-white overflow-hidden">
      {/* Top Nav */}
      <header className="flex items-center gap-4 px-6 py-3.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-sm font-bold shadow-lg shadow-indigo-900/50">📊</div>
          <div>
            <h1 className="text-sm font-bold text-white leading-none">Doc Builder</h1>
            <p className="text-xs text-slate-500 leading-none mt-0.5">Generador de documentación analítica</p>
          </div>
        </div>

        {/* Stats (QA only) */}
        {isQA && totalFindings > 0 && (
          <div className="flex items-center gap-2 ml-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400">{totalFindings} hallazgo{totalFindings !== 1 ? 's' : ''}</span>
            {criticalCount > 0 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-800/50">🔴 {criticalCount} crítico{criticalCount !== 1 ? 's' : ''}</span>}
            {warningCount  > 0 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-900/40 text-yellow-300 border border-yellow-800/50">🟡 {warningCount} advertencia{warningCount !== 1 ? 's' : ''}</span>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Cloud status */}
          <div className="flex items-center gap-1.5 mr-2 px-2 py-1 bg-slate-800/50 rounded text-xs text-slate-400 border border-slate-700/50">
            {isSaving ? (<><Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400"/> Guardando...</>) : lastSaved ? (<><Cloud className="w-3.5 h-3.5 text-green-400"/> Guardado {lastSaved.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'})}</>) : (<><Cloud className="w-3.5 h-3.5"/> En local</>)}
          </div>

          <button onClick={handleNewReport} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 transition-colors flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5"/> Nuevo
          </button>
          <button onClick={() => setShowReportsManager(true)} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-300 transition-colors flex items-center gap-1.5 mr-2">
            <FolderOpen className="w-3.5 h-3.5"/> Abrir
          </button>

          {/* Preview toggle (QA only) */}
          {isQA && (
            <button onClick={() => setShowPreview(!showPreview)} className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${showPreview ? 'bg-indigo-900/40 text-indigo-300 border-indigo-700/50' : 'bg-slate-800 text-slate-400 border-slate-700/50 hover:text-white'}`}>
              {showPreview ? '⬅ Ocultar Preview' : '➡ Mostrar Preview'}
            </button>
          )}

          <button onClick={handleExportHTML} className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/50 hover:bg-slate-700 hover:text-white transition-all">
            {exported ? '✅ Descargado!' : '⬇ Descargar HTML'}
          </button>
          <button onClick={handleExportPDF} className="text-xs font-bold px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/40">
            🖨 Exportar PDF
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Builder Panel */}
        <div className={`flex flex-col ${isQA && showPreview ? 'w-1/2' : 'w-full'} border-r border-slate-800 transition-all`}>
          {/* Section Nav */}
          <div className="flex border-b border-slate-800 bg-slate-900/60 flex-shrink-0">
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-all border-b-2 ${
                  activeSection === s.id ? accentTabActive[docType] : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/40'
                }`}>
                <span>{s.icon}</span>
                <span className="hidden sm:inline">{s.label}</span>
                {s.id === 'findings' && isQA && qaData.findings.length > 0 && (
                  <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{qaData.findings.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* QA Audit sections */}
            {isQA && activeSection === 'meta'     && <ReportMeta     data={qaData} onChange={d => setData(d)} />}
            {isQA && activeSection === 'summary'  && <ExecutiveSummary data={qaData} onChange={d => setData(d)} />}
            {isQA && activeSection === 'findings' && <FindingsList     data={qaData} onChange={d => setData(d)} />}
            {isQA && activeSection === 'business' && <BusinessImpact   data={qaData} onChange={d => setData(d)} />}

            {/* DataLayer Doc sections */}
            {docType === 'datalayer-doc' && activeSection === 'meta'      && <DLMeta          data={data as DLDocData} onChange={d => setData(d)} />}
            {docType === 'datalayer-doc' && activeSection === 'events'    && <DLEventsList    data={data as DLDocData} onChange={d => setData(d)} />}
            {docType === 'datalayer-doc' && activeSection === 'variables' && <DLVariablesList data={data as DLDocData} onChange={d => setData(d)} />}

            {/* Tagging Plan sections */}
            {docType === 'tagging-plan' && activeSection === 'meta'  && <TPMeta      data={data as TaggingPlanData} onChange={d => setData(d)} />}
            {docType === 'tagging-plan' && activeSection === 'items' && <TPItemsList  data={data as TaggingPlanData} onChange={d => setData(d)} />}

            {/* GTM Audit sections */}
            {docType === 'gtm-audit' && activeSection === 'meta'      && <GTMMeta          data={data as GTMAuditData} onChange={d => setData(d)} />}
            {docType === 'gtm-audit' && activeSection === 'tags'      && <GTMTagsList      data={data as GTMAuditData} onChange={d => setData(d)} />}
            {docType === 'gtm-audit' && activeSection === 'triggers'  && <GTMTriggersList  data={data as GTMAuditData} onChange={d => setData(d)} />}
            {docType === 'gtm-audit' && activeSection === 'variables' && <GTMVariablesList data={data as GTMAuditData} onChange={d => setData(d)} />}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 px-6 py-3 flex items-center justify-between bg-slate-900/60 flex-shrink-0">
            <span className="text-xs text-slate-600">
              {isQA ? 'Los cambios se reflejan en tiempo real en el preview →' : 'Auto-guardado activado ☁'}
            </span>
            <div className="flex gap-2">
              <button onClick={handleExportHTML} className="btn-secondary text-xs py-1.5">⬇ HTML</button>
              <button onClick={handleExportPDF}  className="btn-primary text-xs py-1.5">🖨 PDF</button>
            </div>
          </div>
        </div>

        {/* Preview (QA only) */}
        {isQA && showPreview && (
          <div className="w-1/2 flex flex-col overflow-hidden">
            <ReportPreview data={qaData} onReorder={handleReorder} onResize={handleSectionResize} onFindingResize={handleFindingResize}/>
          </div>
        )}
      </div>

      {/* Modals */}
      {showDocTypeSelector && (
        <DocTypeSelector onSelect={handleSelectDocType} onClose={() => setShowDocTypeSelector(false)}/>
      )}
      {showReportsManager && (
        <ReportsManager onLoad={handleLoadReport} onClose={() => setShowReportsManager(false)}/>
      )}
      {pendingExport && (
        <ExportValidationModal
          data={data}
          exportType={pendingExport}
          onConfirm={() => { if (pendingExport === 'html') doExportHTML(); else doExportPDF(); }}
          onCancel={() => setPendingExport(null)}
        />
      )}
    </div>
  );
}
