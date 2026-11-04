'use client';

import React, { useCallback, useState } from 'react';
import { Plus, FolderOpen, Download, ChevronDown, PanelRightClose, PanelRightOpen, FileCode2, FileText, AlertTriangle } from 'lucide-react';
import type { AnyDocData, Finding, ReportData, SectionHeights } from '@/lib/types';
import { getDocTitle } from '@/lib/types';
import { getDocType } from '@/lib/docTypes';
import { formatBytes } from '@/lib/format';
import type { DocumentEditor } from '@/hooks/useDocumentEditor';
import Logo from '@/components/ui/Logo';
import Menu from '@/components/ui/Menu';
import ReportPreview from '@/components/preview/ReportPreview';
import HtmlPreview from '@/components/preview/HtmlPreview';
import PreviewToolbar from '@/components/preview/PreviewToolbar';
import SectionContent from './SectionContent';
import SyncIndicator from './SyncIndicator';
import UserMenu from './UserMenu';

interface Props {
  editor: DocumentEditor;
  data: AnyDocData;
  activeSection: string;
  onSectionChange: (section: string) => void;
  userEmail: string | null;
  onHome: () => void;
  onNew: () => void;
  onBrowse: () => void;
  onExport: (type: 'pdf' | 'html') => void;
  onSignOut: () => void;
}

export default function EditorView({
  editor, data, activeSection, onSectionChange, userEmail, onHome, onNew, onBrowse, onExport, onSignOut,
}: Props) {
  const [showPreview, setShowPreview] = useState(true);
  const [mobileView, setMobileView] = useState<'edit' | 'preview'>('edit');

  const info = getDocType(data.docType);
  const isQA = data.docType === 'qa-audit';
  const findings = isQA ? (data as ReportData).findings : [];
  const criticalCount = findings.filter(f => f.severity === 'critical').length;
  const warningCount = findings.filter(f => f.severity === 'warning').length;

  const { update } = editor;
  const handleReorder = useCallback((items: Finding[]) => update(prev => ({ ...prev, findings: items }) as AnyDocData), [update]);
  const handleSectionResize = useCallback((heights: SectionHeights) => update(prev => ({ ...prev, sectionHeights: heights }) as AnyDocData), [update]);
  const handleFindingResize = useCallback(
    (id: string, height: number) =>
      update(prev =>
        prev.docType === 'qa-audit' ? { ...prev, findings: prev.findings.map(f => (f.id === id ? { ...f, height } : f)) } : prev,
      ),
    [update],
  );

  const iconBtn = 'text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700/50 text-slate-200 transition-colors flex items-center gap-1.5';

  return (
    <div className="flex flex-col h-dvh bg-slate-950 text-white overflow-hidden">
      {/* Cabecera */}
      <header className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm z-20 flex-shrink-0">
        <button type="button" onClick={onHome} className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500" aria-label="Ir al inicio" title="Inicio">
          <Logo />
        </button>
        <div className="min-w-0 flex-1 lg:flex-none lg:max-w-xs">
          <p className="text-sm font-bold text-white leading-tight truncate" title={getDocTitle(data)}>{getDocTitle(data)}</p>
          <p className="text-[11px] text-slate-400 leading-tight truncate">
            <span aria-hidden="true">{info.icon}</span> {info.label}{data.client ? ` · ${data.client}` : ''}
          </p>
        </div>

        {isQA && findings.length > 0 && (
          <div className="hidden xl:flex items-center gap-2 ml-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300">{findings.length} hallazgo{findings.length !== 1 ? 's' : ''}</span>
            {criticalCount > 0 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-900/40 text-red-300 border border-red-800/50">{criticalCount} crítico{criticalCount !== 1 ? 's' : ''}</span>}
            {warningCount > 0 && <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-yellow-900/40 text-yellow-300 border border-yellow-800/50">{warningCount} advertencia{warningCount !== 1 ? 's' : ''}</span>}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
          {editor.isHeavy && (
            <span className="hidden md:flex items-center gap-1 text-[11px] text-amber-300" title="Los documentos muy pesados tardan más en guardarse. Considera reducir imágenes.">
              <AlertTriangle className="w-3.5 h-3.5" aria-hidden="true" /> {formatBytes(editor.docBytes)}
            </span>
          )}
          <SyncIndicator status={editor.status} lastSavedAt={editor.lastSavedAt} error={editor.error} onRetry={() => void editor.saveNow()} />

          <button type="button" onClick={onNew} className={iconBtn} aria-label="Nuevo documento" title="Nuevo documento">
            <Plus className="w-3.5 h-3.5" aria-hidden="true" /><span className="hidden md:inline">Nuevo</span>
          </button>
          <button type="button" onClick={onBrowse} className={iconBtn} aria-label="Abrir documento" title="Abrir documento">
            <FolderOpen className="w-3.5 h-3.5" aria-hidden="true" /><span className="hidden md:inline">Abrir</span>
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(v => !v)}
            className={`${iconBtn} hidden lg:flex`}
            aria-pressed={showPreview}
            title={showPreview ? 'Ocultar vista previa' : 'Mostrar vista previa'}
          >
            {showPreview ? <PanelRightClose className="w-3.5 h-3.5" aria-hidden="true" /> : <PanelRightOpen className="w-3.5 h-3.5" aria-hidden="true" />}
            <span>Vista previa</span>
          </button>

          <Menu
            items={[
              { label: 'PDF', description: 'Documento listo para enviar (A4)', icon: <FileText className="w-4 h-4" />, onSelect: () => onExport('pdf') },
              { label: 'HTML', description: 'Archivo autocontenido para navegador', icon: <FileCode2 className="w-4 h-4" />, onSelect: () => onExport('html') },
            ]}
            button={({ open, toggle, id, menuId }) => (
              <button
                id={id}
                type="button"
                onClick={toggle}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-controls={open ? menuId : undefined}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-lg shadow-indigo-900/40 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Exportar</span>
                <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            )}
          />
          <UserMenu email={userEmail} onSignOut={onSignOut} />
        </div>
      </header>

      {/* Selector Editor / Vista previa (pantallas pequeñas) */}
      <div className="lg:hidden flex p-1.5 gap-1 bg-slate-900 border-b border-slate-800" role="group" aria-label="Panel visible">
        {(['edit', 'preview'] as const).map(v => (
          <button
            key={v}
            type="button"
            aria-pressed={mobileView === v}
            onClick={() => setMobileView(v)}
            className={`flex-1 text-xs font-semibold py-1.5 rounded-md ${mobileView === v ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
          >
            {v === 'edit' ? 'Editar' : 'Vista previa'}
          </button>
        ))}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel de edición */}
        <section
          aria-label="Editor"
          className={`flex-col w-full ${showPreview ? 'lg:w-1/2' : 'lg:w-full'} border-r border-slate-800 ${mobileView === 'edit' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div role="tablist" aria-label="Secciones del documento" className="flex border-b border-slate-800 bg-slate-900/60 flex-shrink-0 overflow-x-auto">
            {info.sections.map(s => {
              const active = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  id={`tab-${s.id}`}
                  aria-selected={active}
                  aria-controls="section-panel"
                  onClick={() => onSectionChange(s.id)}
                  className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold transition-all border-b-2 whitespace-nowrap ${
                    active ? info.accent.tabActive : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <span aria-hidden="true">{s.icon}</span>
                  <span>{s.label}</span>
                  {s.id === 'findings' && findings.length > 0 && (
                    <span className="ml-1 bg-indigo-600 text-white text-[10px] font-bold min-w-4 h-4 px-1 rounded-full flex items-center justify-center">{findings.length}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div id="section-panel" role="tabpanel" aria-labelledby={`tab-${activeSection}`} className="flex-1 overflow-y-auto p-4 sm:p-6">
            <SectionContent data={data} section={activeSection} onChange={editor.update} />
          </div>
        </section>

        {/* Vista previa */}
        <section
          aria-label="Vista previa"
          className={`flex-col overflow-hidden bg-slate-900 relative w-full lg:w-1/2 ${mobileView === 'preview' ? 'flex' : 'hidden'} ${showPreview ? 'lg:flex' : 'lg:hidden'}`}
        >
          {isQA ? (
            <ReportPreview data={data as ReportData} onReorder={handleReorder} onResize={handleSectionResize} onFindingResize={handleFindingResize} />
          ) : (
            <>
              <PreviewToolbar label={info.label} />
              <div className="flex-1 bg-slate-200">
                <HtmlPreview data={data} />
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
