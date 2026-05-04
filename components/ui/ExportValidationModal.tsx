'use client';
import React from 'react';
import { AnyDocData, DLDocData, TaggingPlanData, GTMAuditData, ReportData } from '@/lib/types';
import { AlertTriangle, Info, X, Download } from 'lucide-react';

interface ValidationItem { type: 'warning' | 'info'; message: string; }

interface Props {
  data: AnyDocData;
  exportType: 'pdf' | 'html';
  onConfirm: () => void;
  onCancel: () => void;
}

function validateReport(data: AnyDocData): ValidationItem[] {
  const issues: ValidationItem[] = [];

  if (data.docType === 'qa-audit') {
    const d = data as ReportData;
    if (!d.client.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del cliente.' });
    if (!d.reportTitle.trim()) issues.push({ type: 'warning', message: 'Falta el título del informe.' });
    if (!d.auditor.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del auditor.' });
    const summaryEmpty = !d.executiveSummary || d.executiveSummary.replace(/<[^>]*>/g,'').trim() === '';
    if (summaryEmpty) issues.push({ type: 'warning', message: 'El resumen ejecutivo está vacío.' });
    if (d.findings.length === 0) issues.push({ type: 'warning', message: 'No hay hallazgos registrados.' });
    if (d.businessPoints.length === 0) issues.push({ type: 'info', message: 'La sección de Negocio está vacía (opcional).' });
  } else if (data.docType === 'datalayer-doc') {
    const d = data as DLDocData;
    if (!d.client.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del cliente.' });
    if (!d.projectName.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del proyecto.' });
    if (d.events.length === 0) issues.push({ type: 'warning', message: 'No hay eventos documentados.' });
    if (d.variables.length === 0) issues.push({ type: 'info', message: 'El diccionario de variables está vacío (opcional).' });
  } else if (data.docType === 'tagging-plan') {
    const d = data as TaggingPlanData;
    if (!d.client.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del cliente.' });
    if (!d.projectName.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del proyecto.' });
    if (d.items.length === 0) issues.push({ type: 'warning', message: 'No hay eventos en el plan de marcaje.' });
    const objEmpty = !d.objective || d.objective.replace(/<[^>]*>/g,'').trim() === '';
    if (objEmpty) issues.push({ type: 'info', message: 'El objetivo del plan está vacío (opcional).' });
  } else if (data.docType === 'gtm-audit') {
    const d = data as GTMAuditData;
    if (!d.client.trim()) issues.push({ type: 'warning', message: 'Falta el nombre del cliente.' });
    if (!d.containerId.trim()) issues.push({ type: 'warning', message: 'Falta el Container ID (GTM-XXXXX).' });
    if (d.tags.length === 0) issues.push({ type: 'warning', message: 'No hay tags registrados en la auditoría.' });
    if (d.triggers.length === 0) issues.push({ type: 'info', message: 'No hay triggers registrados (opcional).' });
    if (d.variables.length === 0) issues.push({ type: 'info', message: 'No hay variables registradas (opcional).' });
  }

  if ((data as any).reportStatus === 'draft') {
    issues.push({ type: 'info', message: 'El documento está marcado como Borrador.' });
  }

  return issues;
}

export default function ExportValidationModal({ data, exportType, onConfirm, onCancel }: Props) {
  const issues = validateReport(data);
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');
  const hasWarnings = warnings.length > 0;

  const label = exportType === 'pdf' ? 'PDF' : 'HTML';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Header */}
        <div className={`px-6 py-4 border-b border-slate-800 flex items-center gap-3 ${
          hasWarnings ? 'bg-amber-900/20' : 'bg-slate-800/50'
        }`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            hasWarnings ? 'bg-amber-500/20' : 'bg-indigo-500/20'
          }`}>
            {hasWarnings
              ? <AlertTriangle className="w-5 h-5 text-amber-400" />
              : <Download className="w-5 h-5 text-indigo-400" />
            }
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">
              {hasWarnings ? 'Verificación antes de exportar' : 'Listo para exportar'}
            </h2>
            <p className="text-xs text-slate-400">
              {hasWarnings
                ? `Se encontraron ${warnings.length} elemento${warnings.length !== 1 ? 's' : ''} incompleto${warnings.length !== 1 ? 's' : ''}`
                : `El reporte está completo`}
            </p>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Issues list */}
        <div className="p-6 space-y-2">
          {warnings.map((issue, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-200">{issue.message}</p>
            </div>
          ))}
          {infos.map((issue, i) => (
            <div key={i} className="flex items-start gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-xl">
              <Info className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-400">{issue.message}</p>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => { onConfirm(); onCancel(); }}
            className={`flex-1 px-4 py-2.5 text-sm font-bold text-white rounded-xl transition-all flex items-center justify-center gap-2 ${
              hasWarnings
                ? 'bg-amber-600 hover:bg-amber-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            <Download className="w-4 h-4" />
            {hasWarnings ? `Exportar ${label} de todas formas` : `Exportar ${label}`}
          </button>
        </div>
      </div>
    </div>
  );
}
