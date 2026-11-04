'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { v4 as uuid } from 'uuid';
import type { DocumentType } from '@/lib/types';
import { getDocType, normalizeDocument, generateDocHTML } from '@/lib/docTypes';
import { ApiError, reportsApi, UNAUTHORIZED_EVENT } from '@/lib/sync/api';
import { getDraft, deleteDraft, type LocalDraft } from '@/lib/sync/drafts';
import { downloadBlob, exportFilename } from '@/lib/export/download';
import { exportPdf } from '@/lib/export/pdf';
import { createClient } from '@/lib/supabase/client';
import { useDocumentEditor } from '@/hooks/useDocumentEditor';
import { ConfirmProvider, useConfirm } from '@/components/ui/ConfirmProvider';
import ReportsManager from '@/components/ui/ReportsManager';
import DocTypeSelector from '@/components/ui/DocTypeSelector';
import ExportValidationModal from '@/components/ui/ExportValidationModal';
import Landing from '@/components/home/Landing';
import EditorView from '@/components/editor/EditorView';

function setDocInUrl(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('doc', id);
  else url.searchParams.delete('doc');
  window.history.replaceState(null, '', url);
}

function App({ userEmail }: { userEmail: string | null }) {
  const editor = useDocumentEditor();
  const confirm = useConfirm();
  const [activeSection, setActiveSection] = useState('meta');
  const [showManager, setShowManager] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [pendingExport, setPendingExport] = useState<'pdf' | 'html' | null>(null);
  const [loadingDoc, setLoadingDoc] = useState(false);
  const { doc, flush, open, close } = editor;

  /** Guarda lo pendiente antes de cambiar de documento. Si falla, queda la copia local. */
  const leaveCurrent = useCallback(async () => {
    const ok = await flush();
    if (!ok) toast.warning('No se pudieron subir los últimos cambios. Quedaron guardados en este navegador y podrás recuperarlos desde el inicio.');
  }, [flush]);

  const openById = useCallback(
    async (id: string) => {
      if (doc?.id === id) return;
      await leaveCurrent();
      setLoadingDoc(true);
      const toastId = toast.loading('Abriendo documento…');
      try {
        const [res, draft] = await Promise.all([reportsApi.get(id), getDraft(id)]);
        const serverTime = new Date(res.updated_at).getTime();
        if (draft && draft.updatedAt > serverTime) {
          open(id, normalizeDocument(draft.data), 'unsynced');
          toast.info('Se recuperaron cambios locales que no se habían guardado en la nube.', { id: toastId });
        } else {
          if (draft) void deleteDraft(id);
          open(id, normalizeDocument(res.data), 'synced', new Date(res.updated_at));
          toast.dismiss(toastId);
        }
        setActiveSection('meta');
        setDocInUrl(id);
      } catch (err) {
        const draft = await getDraft(id);
        if (draft && err instanceof ApiError && err.retriable) {
          open(id, normalizeDocument(draft.data), 'unsynced');
          setActiveSection('meta');
          setDocInUrl(id);
          toast.warning('La nube no responde: se abrió la copia guardada en este navegador.', { id: toastId });
        } else {
          setDocInUrl(null);
          toast.error(err instanceof ApiError ? err.message : 'No se pudo abrir el documento.', { id: toastId });
        }
      } finally {
        setLoadingDoc(false);
      }
    },
    [doc?.id, leaveCurrent, open],
  );

  const createDocument = useCallback(
    async (type: DocumentType) => {
      setShowSelector(false);
      await leaveCurrent();
      const id = uuid();
      open(id, getDocType(type).create(), 'new');
      setActiveSection('meta');
      setDocInUrl(id);
      toast.success(`Nuevo documento: ${getDocType(type).label}`);
    },
    [leaveCurrent, open],
  );

  const recoverDraft = useCallback(
    async (draft: LocalDraft) => {
      await leaveCurrent();
      open(draft.id, normalizeDocument(draft.data), 'unsynced');
      setActiveSection('meta');
      setDocInUrl(draft.id);
      toast.info('Cambios recuperados. Se están subiendo a la nube.');
    },
    [leaveCurrent, open],
  );

  const goHome = useCallback(async () => {
    await leaveCurrent();
    close();
    setDocInUrl(null);
  }, [leaveCurrent, close]);

  const signOut = useCallback(async () => {
    const ok = await flush();
    if (!ok) {
      const proceed = await confirm({
        title: 'Hay cambios sin sincronizar',
        message: 'Los últimos cambios no llegaron a la nube. Quedarán guardados en este navegador y podrás recuperarlos al volver a entrar. ¿Cerrar sesión igualmente?',
        confirmLabel: 'Cerrar sesión',
      });
      if (!proceed) return;
    }
    await createClient().auth.signOut();
    window.location.assign('/login');
  }, [flush, confirm]);

  // Abre el documento indicado en la URL (?doc=…) al cargar la página.
  const openByIdRef = useRef(openById);
  useEffect(() => {
    openByIdRef.current = openById;
  }, [openById]);
  useEffect(() => {
    const id = new URL(window.location.href).searchParams.get('doc');
    if (!id) return;
    const timer = setTimeout(() => void openByIdRef.current(id), 0);
    return () => clearTimeout(timer);
  }, []);

  // Sesión expirada: se avisa sin perder el trabajo (queda en el borrador local).
  useEffect(() => {
    const onUnauthorized = () => {
      toast.error('Tu sesión expiró. Tus cambios están guardados en este navegador.', {
        id: 'unauthorized',
        duration: Infinity,
        action: {
          label: 'Iniciar sesión',
          onClick: () => window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`),
        },
      });
    };
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  }, []);

  const runExport = useCallback(
    async (type: 'pdf' | 'html') => {
      if (!doc) return;
      const html = generateDocHTML(doc.data);
      const filename = exportFilename(doc.data, type);
      if (type === 'html') {
        downloadBlob(new Blob([html], { type: 'text/html;charset=utf-8' }), filename);
        toast.success('HTML descargado');
        return;
      }
      await toast
        .promise(exportPdf(html, filename), {
          loading: 'Generando PDF…',
          success: 'PDF descargado',
          error: (err: unknown) => (err instanceof Error ? err.message : 'No se pudo generar el PDF.'),
        })
        .unwrap()
        .catch(err => console.error('[pdf]', err));
    },
    [doc],
  );

  return (
    <>
      {doc ? (
        <EditorView
          editor={editor}
          data={doc.data}
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          userEmail={userEmail}
          onHome={() => void goHome()}
          onNew={() => setShowSelector(true)}
          onBrowse={() => setShowManager(true)}
          onExport={setPendingExport}
          onSignOut={() => void signOut()}
        />
      ) : (
        <Landing
          userEmail={userEmail}
          onSignOut={() => void signOut()}
          onBrowse={() => setShowManager(true)}
          onChooseType={() => setShowSelector(true)}
          onCreate={type => void createDocument(type)}
          onOpen={id => void openById(id)}
          onRecoverDraft={d => void recoverDraft(d)}
        />
      )}

      {loadingDoc && !doc && (
        <div className="fixed inset-0 z-30 bg-slate-950/60 flex items-center justify-center" aria-hidden="true">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {showSelector && <DocTypeSelector onSelect={type => void createDocument(type)} onClose={() => setShowSelector(false)} />}
      {showManager && (
        <ReportsManager
          currentId={doc?.id}
          onOpen={id => {
            setShowManager(false);
            void openById(id);
          }}
          onClose={() => setShowManager(false)}
          onDeletedCurrent={() => {
            close();
            setDocInUrl(null);
            setShowManager(false);
          }}
        />
      )}
      {pendingExport && doc && (
        <ExportValidationModal
          data={doc.data}
          exportType={pendingExport}
          onConfirm={() => void runExport(pendingExport)}
          onCancel={() => setPendingExport(null)}
          onGoToSection={section => {
            setActiveSection(section);
            setPendingExport(null);
          }}
        />
      )}
    </>
  );
}

export default function DocBuilderApp({ userEmail }: { userEmail: string | null }) {
  return (
    <ConfirmProvider>
      <App userEmail={userEmail} />
    </ConfirmProvider>
  );
}
