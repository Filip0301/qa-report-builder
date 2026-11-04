'use client';

import React, { useMemo } from 'react';
import { AlertTriangle, Info, Download, ChevronRight } from 'lucide-react';
import type { AnyDocData } from '@/lib/types';
import { validateDocument } from '@/lib/validation';
import Modal from './Modal';

interface Props {
  data: AnyDocData;
  exportType: 'pdf' | 'html';
  onConfirm: () => void;
  onCancel: () => void;
  /** Lleva al usuario a la sección del editor donde se corrige el aviso. */
  onGoToSection?: (section: string) => void;
}

export default function ExportValidationModal({ data, exportType, onConfirm, onCancel, onGoToSection }: Props) {
  const issues = useMemo(() => validateDocument(data), [data]);
  const warnings = issues.filter(i => i.type === 'warning');
  const infos = issues.filter(i => i.type === 'info');
  const hasWarnings = warnings.length > 0;
  const label = exportType === 'pdf' ? 'PDF' : 'HTML';

  const renderIssue = (issue: (typeof issues)[number], i: number) => {
    const warning = issue.type === 'warning';
    const Icon = warning ? AlertTriangle : Info;
    const content = (
      <>
        <Icon className={`w-4 h-4 flex-shrink-0 mt-0.5 ${warning ? 'text-amber-400' : 'text-slate-400'}`} aria-hidden="true" />
        <span className={`text-sm flex-1 text-left ${warning ? 'text-amber-100' : 'text-slate-300'}`}>{issue.message}</span>
        {onGoToSection && issue.section && <ChevronRight className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" aria-hidden="true" />}
      </>
    );
    const cls = `w-full flex items-start gap-3 p-3 rounded-xl border ${
      warning ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800/60 border-slate-700/50'
    }`;
    return (
      <li key={i}>
        {onGoToSection && issue.section ? (
          <button type="button" className={`${cls} hover:brightness-125 transition`} onClick={() => onGoToSection(issue.section!)} title="Ir a la sección">
            {content}
          </button>
        ) : (
          <div className={cls}>{content}</div>
        )}
      </li>
    );
  };

  return (
    <Modal
      size="md"
      onClose={onCancel}
      headerClassName={hasWarnings ? '!bg-amber-900/20' : ''}
      icon={
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${hasWarnings ? 'bg-amber-500/20' : 'bg-indigo-500/20'}`}>
          {hasWarnings ? <AlertTriangle className="w-5 h-5 text-amber-400" aria-hidden="true" /> : <Download className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
        </div>
      }
      title={hasWarnings ? 'Revisión antes de exportar' : 'Listo para exportar'}
      description={
        hasWarnings
          ? `${warnings.length} elemento${warnings.length !== 1 ? 's' : ''} incompleto${warnings.length !== 1 ? 's' : ''}`
          : 'El documento está completo'
      }
      footer={
        <>
          <button type="button" onClick={onCancel} className="btn-secondary">Cancelar</button>
          <button
            type="button"
            autoFocus
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={hasWarnings ? 'btn-primary !bg-amber-600 hover:!bg-amber-500 !shadow-amber-900/30' : 'btn-primary'}
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            {hasWarnings ? `Exportar ${label} igualmente` : `Exportar ${label}`}
          </button>
        </>
      }
    >
      {issues.length > 0 ? (
        <ul className="p-6 space-y-2">{[...warnings, ...infos].map(renderIssue)}</ul>
      ) : (
        <p className="p-6 text-sm text-slate-300">No se encontraron campos pendientes.</p>
      )}
    </Modal>
  );
}
