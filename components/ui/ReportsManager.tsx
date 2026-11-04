'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { FolderOpen, Trash2, Clock, FileText, Search, X, CheckCircle, FileEdit, RefreshCw, CloudOff } from 'lucide-react';
import type { DocumentType } from '@/lib/types';
import type { ReportSummary } from '@/lib/api/schema';
import { DOC_TYPE_LIST, getDocType } from '@/lib/docTypes';
import { ApiError, reportsApi } from '@/lib/sync/api';
import { formatRelative } from '@/lib/format';
import Modal from './Modal';
import { useConfirm } from './ConfirmProvider';

type StatusFilter = 'all' | 'draft' | 'final';

interface Props {
  currentId?: string | null;
  onOpen: (id: string) => void;
  onClose: () => void;
  /** Se llama cuando se elimina el documento que está abierto. */
  onDeletedCurrent?: () => void;
}

const isFinal = (r: ReportSummary) => r.report_status === 'final';

export default function ReportsManager({ currentId, onOpen, onClose, onDeletedCurrent }: Props) {
  const confirm = useConfirm();
  const [reports, setReports] = useState<ReportSummary[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<DocumentType | 'all'>('all');

  const load = useCallback(() => {
    reportsApi.list().then(
      data => {
        setReports(data);
        setLoadError(null);
      },
      (err: unknown) => {
        setReports(null);
        setLoadError(err instanceof ApiError ? err.message : 'No se pudieron cargar los documentos.');
      },
    );
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const retry = () => {
    setLoadError(null);
    load();
  };

  const handleDelete = async (report: ReportSummary) => {
    const ok = await confirm({
      title: '¿Eliminar este documento?',
      message: <>Se eliminará <strong className="text-white">{report.title}</strong>. Podrás deshacerlo justo después.</>,
      confirmLabel: 'Eliminar',
      tone: 'danger',
    });
    if (!ok) return;
    try {
      await reportsApi.remove(report.id);
      setReports(prev => prev?.filter(r => r.id !== report.id) ?? prev);
      if (report.id === currentId) onDeletedCurrent?.();
      toast.success('Documento eliminado', {
        action: {
          label: 'Deshacer',
          onClick: async () => {
            try {
              await reportsApi.restore(report.id);
              toast.success('Documento restaurado');
              load();
            } catch (err) {
              toast.error(err instanceof ApiError ? err.message : 'No se pudo restaurar.');
            }
          },
        },
        duration: 8000,
      });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'No se pudo eliminar el documento.');
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return (reports ?? []).filter(r => {
      const matchesSearch = !q || r.title.toLowerCase().includes(q) || r.client.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'final' ? isFinal(r) : !isFinal(r));
      const matchesType = typeFilter === 'all' || (r.doc_type ?? 'qa-audit') === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [reports, search, statusFilter, typeFilter]);

  const counts = useMemo(() => {
    const list = reports ?? [];
    return { all: list.length, final: list.filter(isFinal).length, draft: list.filter(r => !isFinal(r)).length };
  }, [reports]);

  const statusButtons: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'Todos' },
    { value: 'draft', label: 'Borrador' },
    { value: 'final', label: 'Finalizado' },
  ];

  const loading = reports === null && !loadError;
  const filtersActive = Boolean(search) || statusFilter !== 'all' || typeFilter !== 'all';

  return (
    <Modal
      size="lg"
      onClose={onClose}
      icon={<FolderOpen className="w-5 h-5 text-indigo-400" aria-hidden="true" />}
      title={
        <span className="flex items-center gap-2">
          Documentos del equipo
          {reports && <span className="text-xs font-medium bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">{reports.length}</span>}
        </span>
      }
    >
      <div className="px-6 pt-4 pb-3 space-y-3 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por título o cliente…"
            aria-label="Buscar documentos"
            className="field-input pl-9 pr-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1.5" role="group" aria-label="Filtrar por estado">
            {statusButtons.map(btn => (
              <button
                key={btn.value}
                type="button"
                aria-pressed={statusFilter === btn.value}
                onClick={() => setStatusFilter(btn.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all ${
                  statusFilter === btn.value ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {btn.label}
                <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full font-bold ${statusFilter === btn.value ? 'bg-white/20' : 'bg-slate-700 text-slate-300'}`}>
                  {counts[btn.value]}
                </span>
              </button>
            ))}
          </div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as DocumentType | 'all')}
            aria-label="Filtrar por tipo de documento"
            className="field-input !w-auto !py-1.5 text-xs ml-auto"
          >
            <option value="all">Todos los tipos</option>
            {DOC_TYPE_LIST.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
          </select>
        </div>
      </div>

      <div className="p-6" aria-live="polite" aria-busy={loading}>
        {loading ? (
          <ul className="grid gap-3" aria-label="Cargando documentos">
            {[0, 1, 2].map(i => (
              <li key={i} className="h-[74px] rounded-xl border border-slate-800 bg-slate-800/40 animate-pulse" />
            ))}
          </ul>
        ) : loadError ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudOff className="w-7 h-7 text-amber-400" aria-hidden="true" />
            </div>
            <p className="text-slate-200 font-medium">No se pudieron cargar los documentos</p>
            <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">{loadError}</p>
            <button type="button" onClick={retry} className="btn-secondary mt-4 mx-auto">
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" /> Reintentar
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-7 h-7 text-slate-500" aria-hidden="true" />
            </div>
            <p className="text-slate-200 font-medium">{filtersActive ? 'No hay documentos que coincidan.' : 'Aún no hay documentos guardados.'}</p>
            <p className="text-slate-400 text-sm mt-1">
              {filtersActive ? 'Prueba con otro término o filtro.' : 'Crea uno nuevo: se guarda automáticamente al escribir.'}
            </p>
          </div>
        ) : (
          <ul className="grid gap-3">
            {filtered.map(report => {
              const final = isFinal(report);
              const dt = getDocType(report.doc_type);
              const isCurrent = report.id === currentId;
              return (
                <li key={report.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => onOpen(report.id)}
                    className={`w-full text-left flex items-center p-4 pr-14 rounded-xl border bg-slate-800/40 hover:bg-slate-800 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isCurrent ? 'border-indigo-500/60' : 'border-slate-700 hover:border-indigo-500/50'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-white truncate max-w-full">{report.title}</h3>
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full border ${dt.accent.badge}`}>
                          <span aria-hidden="true">{dt.icon}</span> {dt.shortLabel}
                        </span>
                        <span className={`flex-shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          final ? 'bg-green-500/10 text-green-300 border-green-500/30' : 'bg-slate-700 text-slate-300 border-slate-600'
                        }`}>
                          {final ? <CheckCircle className="w-2.5 h-2.5" aria-hidden="true" /> : <FileEdit className="w-2.5 h-2.5" aria-hidden="true" />}
                          {final ? 'Finalizado' : 'Borrador'}
                        </span>
                        {isCurrent && <span className="text-[10px] font-bold text-indigo-300">· Abierto</span>}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400">
                        <span className="truncate max-w-[200px]">{report.client}</span>
                        <span className="flex items-center gap-1 flex-shrink-0" title={new Date(report.updated_at ?? report.created_at).toLocaleString('es-CL')}>
                          <Clock className="w-3 h-3" aria-hidden="true" />
                          Editado {formatRelative(report.updated_at ?? report.created_at)}
                        </span>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(report)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 focus-visible:text-red-400 rounded-lg transition-colors"
                    aria-label={`Eliminar ${report.title}`}
                    title="Eliminar documento"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
}
