'use client';

import React from 'react';
import { Cloud, CloudOff, Loader2, AlertTriangle, CircleDot, RefreshCw } from 'lucide-react';
import type { SyncStatus } from '@/hooks/useDocumentEditor';
import { formatTime } from '@/lib/format';

interface Props {
  status: SyncStatus;
  lastSavedAt: Date | null;
  error: string | null;
  onRetry: () => void;
}

/** Estado de guardado siempre visible y explícito (nunca un "En local" ambiguo). */
export default function SyncIndicator({ status, lastSavedAt, error, onRetry }: Props) {
  const base = 'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border whitespace-nowrap';

  const content = (() => {
    switch (status) {
      case 'saving':
        return { cls: 'bg-slate-800/60 border-slate-700/50 text-slate-300', icon: <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />, text: 'Guardando…' };
      case 'pending':
        return { cls: 'bg-slate-800/60 border-slate-700/50 text-slate-300', icon: <CircleDot className="w-3.5 h-3.5 text-slate-400" />, text: 'Cambios sin guardar' };
      case 'saved':
        return {
          cls: 'bg-slate-800/60 border-slate-700/50 text-slate-300',
          icon: <Cloud className="w-3.5 h-3.5 text-emerald-400" />,
          text: lastSavedAt ? `Guardado ${formatTime(lastSavedAt)}` : 'Guardado',
        };
      case 'offline':
        return { cls: 'bg-amber-500/10 border-amber-500/30 text-amber-200', icon: <CloudOff className="w-3.5 h-3.5 text-amber-400" />, text: 'Sin conexión · copia local' };
      case 'error':
        return { cls: 'bg-red-500/10 border-red-500/30 text-red-200', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-400" />, text: 'Error al guardar' };
      default:
        return { cls: 'bg-slate-800/60 border-slate-700/50 text-slate-400', icon: <Cloud className="w-3.5 h-3.5" />, text: 'Nuevo · se guarda al editar' };
    }
  })();

  const needsAction = status === 'offline' || status === 'error';

  return (
    <div className="flex items-center gap-1" role="status" aria-live="polite">
      <span className={`${base} ${content.cls}`} title={error ?? undefined}>
        <span aria-hidden="true">{content.icon}</span>
        <span className="hidden md:inline">{content.text}</span>
        <span className="sr-only md:hidden">{content.text}</span>
      </span>
      {needsAction && (
        <button
          type="button"
          onClick={onRetry}
          className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-700"
          title={error ? `${error} — Reintentar` : 'Reintentar'}
          aria-label="Reintentar guardado"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
