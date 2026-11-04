'use client';

import React, { useEffect, useState } from 'react';
import { ArrowRight, FolderOpen, Sparkles, Clock, CloudOff, Trash2, RotateCcw } from 'lucide-react';
import type { DocumentType } from '@/lib/types';
import type { ReportSummary } from '@/lib/api/schema';
import { DOC_TYPE_LIST, getDocType } from '@/lib/docTypes';
import { reportsApi } from '@/lib/sync/api';
import { listDrafts, deleteDraft, type LocalDraft } from '@/lib/sync/drafts';
import { formatRelative } from '@/lib/format';
import Logo from '@/components/ui/Logo';
import UserMenu from '@/components/editor/UserMenu';
import { useConfirm } from '@/components/ui/ConfirmProvider';

interface Props {
  userEmail: string | null;
  onSignOut: () => void;
  onBrowse: () => void;
  onChooseType: () => void;
  onCreate: (type: DocumentType) => void;
  onOpen: (id: string) => void;
  onRecoverDraft: (draft: LocalDraft) => void;
}

export default function Landing({ userEmail, onSignOut, onBrowse, onChooseType, onCreate, onOpen, onRecoverDraft }: Props) {
  const confirm = useConfirm();
  const [recent, setRecent] = useState<ReportSummary[] | null>(null);
  const [recentError, setRecentError] = useState(false);
  const [drafts, setDrafts] = useState<LocalDraft[]>([]);

  useEffect(() => {
    reportsApi.list().then(
      list => setRecent(list.slice(0, 5)),
      () => setRecentError(true),
    );
    listDrafts().then(setDrafts);
  }, []);

  const discardDraft = async (draft: LocalDraft) => {
    const ok = await confirm({
      title: '¿Descartar estos cambios?',
      message: `Los cambios locales de "${draft.title}" que no llegaron a la nube se perderán.`,
      confirmLabel: 'Descartar',
      tone: 'danger',
    });
    if (!ok) return;
    await deleteDraft(draft.id);
    setDrafts(d => d.filter(x => x.id !== draft.id));
  };

  return (
    <div className="min-h-screen app-grid-bg flex flex-col">
      <header className="flex items-center justify-end px-6 py-4">
        <UserMenu email={userEmail} onSignOut={onSignOut} />
      </header>

      <main className="flex-1 flex flex-col items-center px-4 pb-16">
        <div className="flex flex-col items-center text-center mt-4 sm:mt-10 mb-10">
          <Logo size="lg" />
          <h1 className="mt-5 text-3xl font-bold text-white">Doc Builder</h1>
          <p className="mt-2 text-slate-400">Generador de documentación analítica</p>
        </div>

        {drafts.length > 0 && (
          <section className="w-full max-w-2xl mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4" aria-labelledby="drafts-title">
            <h2 id="drafts-title" className="flex items-center gap-2 text-sm font-bold text-amber-200">
              <CloudOff className="w-4 h-4" aria-hidden="true" /> Cambios sin sincronizar en este navegador
            </h2>
            <p className="text-xs text-amber-100/70 mt-1 mb-3">Estos cambios no llegaron a la nube. Recupéralos para subirlos.</p>
            <ul className="space-y-2">
              {drafts.map(d => (
                <li key={d.id} className="flex items-center gap-3 bg-slate-900/60 rounded-xl px-3 py-2 border border-slate-800">
                  <span aria-hidden="true">{getDocType(d.docType).icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white font-semibold truncate">{d.title}</p>
                    <p className="text-xs text-slate-400">Editado {formatRelative(new Date(d.updatedAt))}</p>
                  </div>
                  <button type="button" onClick={() => onRecoverDraft(d)} className="btn-secondary !py-1 text-xs">
                    <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" /> Recuperar
                  </button>
                  <button
                    type="button"
                    onClick={() => void discardDraft(d)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                    aria-label={`Descartar cambios de ${d.title}`}
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onBrowse}
            className="group text-left p-6 rounded-2xl border border-slate-700/70 bg-slate-900/60 hover:border-slate-500 hover:bg-slate-900 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <span className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-amber-300" aria-hidden="true" />
              </span>
              <ArrowRight className="w-5 h-5 text-slate-600 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-bold text-white">Abrir documento</h2>
            <p className="mt-1 text-sm text-slate-400">Retoma un documento guardado en la nube.</p>
          </button>

          <button
            type="button"
            onClick={onChooseType}
            className="group text-left p-6 rounded-2xl border border-indigo-500/40 bg-gradient-to-br from-indigo-950/80 to-slate-900/60 hover:border-indigo-400 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <div className="flex items-start justify-between">
              <span className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-indigo-300" aria-hidden="true" />
              </span>
              <ArrowRight className="w-5 h-5 text-indigo-400/70 group-hover:text-indigo-300 group-hover:translate-x-0.5 transition-all" aria-hidden="true" />
            </div>
            <h2 className="mt-5 font-bold text-white">Crear nuevo</h2>
            <p className="mt-1 text-sm text-slate-400">Elige una plantilla y comienza desde cero.</p>
          </button>
        </div>

        <div className="w-full max-w-2xl mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Plantillas:</span>
          {DOC_TYPE_LIST.map(t => (
            <button
              key={t.type}
              type="button"
              onClick={() => onCreate(t.type)}
              className="text-xs text-slate-300 px-3 py-1 rounded-full border border-slate-700 bg-slate-900/60 hover:border-slate-500 hover:text-white transition-colors"
              title={`Crear: ${t.label}`}
            >
              <span aria-hidden="true">{t.icon}</span> {t.label}
            </button>
          ))}
        </div>

        <section className="w-full max-w-2xl mt-12" aria-labelledby="recent-title">
          <div className="flex items-center justify-between mb-3">
            <h2 id="recent-title" className="text-xs font-bold uppercase tracking-widest text-slate-500">Recientes</h2>
            {recent && recent.length > 0 && (
              <button type="button" onClick={onBrowse} className="text-xs text-indigo-400 hover:text-indigo-300">Ver todos</button>
            )}
          </div>
          {recentError ? (
            <p className="text-sm text-slate-500 flex items-center gap-2">
              <CloudOff className="w-4 h-4" aria-hidden="true" /> No se pudo conectar con la nube. Puedes crear documentos igualmente: se guardan en este navegador hasta que vuelva la conexión.
            </p>
          ) : recent === null ? (
            <div className="space-y-2" aria-hidden="true">
              {[0, 1, 2].map(i => <div key={i} className="h-12 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />)}
            </div>
          ) : recent.length === 0 ? (
            <p className="text-sm text-slate-500">Todavía no hay documentos. Crea el primero.</p>
          ) : (
            <ul className="divide-y divide-slate-800/80 rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
              {recent.map(r => {
                const dt = getDocType(r.doc_type);
                return (
                  <li key={r.id}>
                    <button
                      type="button"
                      onClick={() => onOpen(r.id)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/60 focus-visible:bg-slate-800/60 focus-visible:outline-none"
                    >
                      <span aria-hidden="true">{dt.icon}</span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-semibold text-white truncate">{r.title}</span>
                        <span className="block text-xs text-slate-400 truncate">{r.client} · {dt.label}</span>
                      </span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                        <Clock className="w-3 h-3" aria-hidden="true" /> {formatRelative(r.updated_at ?? r.created_at)}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
