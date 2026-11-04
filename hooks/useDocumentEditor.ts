'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { AnyDocData } from '@/lib/types';
import { MAX_DOCUMENT_BYTES } from '@/lib/api/schema';
import { ApiError, buildSavePayload, reportsApi } from '@/lib/sync/api';
import { deleteDraft, saveDraft } from '@/lib/sync/drafts';

export type SyncStatus =
  | 'idle'     // documento nuevo, aún sin cambios
  | 'pending'  // hay cambios esperando a guardarse
  | 'saving'
  | 'saved'
  | 'offline'  // la nube no responde: se reintenta y queda copia local
  | 'error';   // error que requiere acción (sesión expirada, documento muy pesado…)

export interface OpenDocument { id: string; data: AnyDocData; }

type OpenMode =
  | 'new'       // recién creado: no se guarda hasta el primer cambio
  | 'synced'    // cargado desde la nube
  | 'unsynced'; // recuperado de un borrador local: se sube de inmediato

const SAVE_DELAY_MS = 1500;
const DRAFT_DELAY_MS = 400;
const RETRY_DELAYS_MS = [3_000, 10_000, 30_000, 60_000];
export const HEAVY_DOCUMENT_BYTES = 3_000_000;

/**
 * Estado del documento abierto + sincronización con la nube.
 *
 * - Los guardados se serializan (nunca hay dos PUT en paralelo) y son idempotentes:
 *   el id se genera en el cliente, así que reintentar nunca duplica documentos.
 * - Cada cambio se copia a IndexedDB para no perder trabajo si la nube falla.
 * - Si la nube no responde, se reintenta con espera creciente y al recuperar la conexión.
 */
export function useDocumentEditor() {
  const [doc, setDoc] = useState<OpenDocument | null>(null);
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [docBytes, setDocBytes] = useState(0);

  const docRef = useRef<OpenDocument | null>(null);
  const syncedBody = useRef<string | null>(null);
  const dirty = useRef(false);
  const inFlight = useRef<Promise<boolean> | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const retryCount = useRef(0);
  const runSaveRef = useRef<() => Promise<boolean>>(async () => true);

  const clearTimers = () => {
    clearTimeout(saveTimer.current);
    clearTimeout(draftTimer.current);
  };

  const scheduleSave = useCallback((delay = SAVE_DELAY_MS) => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void runSaveRef.current(), delay);
  }, []);

  const runSave = useCallback(async (): Promise<boolean> => {
    clearTimeout(saveTimer.current);
    if (inFlight.current) await inFlight.current;

    const current = docRef.current;
    if (!current) return true;

    const body = JSON.stringify(buildSavePayload(current.data));
    setDocBytes(body.length);
    if (body === syncedBody.current) {
      dirty.current = false;
      setStatus(s => (s === 'idle' ? 'idle' : 'saved'));
      return true;
    }
    if (body.length > MAX_DOCUMENT_BYTES) {
      setStatus('error');
      setError('El documento supera el tamaño máximo (4 MB). Reduce o elimina imágenes para poder guardarlo en la nube. Tus cambios quedan guardados en este navegador.');
      return false;
    }

    const id = current.id;
    const task = (async () => {
      setStatus('saving');
      try {
        const res = await reportsApi.save(id, body);
        retryCount.current = 0;
        if (docRef.current?.id !== id) {
          void deleteDraft(id);
          return true;
        }
        syncedBody.current = body;
        setLastSavedAt(new Date(res.updated_at ?? Date.now()));
        setError(null);
        const latest = JSON.stringify(buildSavePayload(docRef.current.data));
        if (latest === body) {
          dirty.current = false;
          setStatus('saved');
          void deleteDraft(id);
        } else {
          setStatus('pending');
          scheduleSave(300);
        }
        return true;
      } catch (err) {
        const apiErr = err instanceof ApiError ? err : new ApiError('Error inesperado al guardar.', 500);
        setError(apiErr.message);
        if (apiErr.status === 401) {
          setStatus('error');
        } else if (apiErr.retriable) {
          setStatus('offline');
          const delay = RETRY_DELAYS_MS[Math.min(retryCount.current, RETRY_DELAYS_MS.length - 1)];
          retryCount.current += 1;
          scheduleSave(delay);
        } else {
          setStatus('error');
        }
        return false;
      }
    })();

    inFlight.current = task;
    try {
      return await task;
    } finally {
      inFlight.current = null;
    }
  }, [scheduleSave]);

  useEffect(() => {
    runSaveRef.current = runSave;
  }, [runSave]);

  /** Aplica un cambio al documento abierto. */
  const update = useCallback(
    (next: AnyDocData | ((prev: AnyDocData) => AnyDocData)) => {
      const current = docRef.current;
      if (!current) return;
      const data = typeof next === 'function' ? next(current.data) : next;
      if (data === current.data) return;
      const updated = { id: current.id, data };
      docRef.current = updated;
      setDoc(updated);
      dirty.current = true;
      setStatus(s => (s === 'saving' || s === 'offline' || s === 'error' ? s : 'pending'));

      clearTimeout(draftTimer.current);
      draftTimer.current = setTimeout(() => {
        const latest = docRef.current;
        if (latest) void saveDraft(latest.id, latest.data);
      }, DRAFT_DELAY_MS);
      scheduleSave();
    },
    [scheduleSave],
  );

  /** Abre un documento. Llama antes a `flush()` si había otro abierto con cambios. */
  const open = useCallback(
    (id: string, data: AnyDocData, mode: OpenMode, savedAt?: Date) => {
      clearTimers();
      retryCount.current = 0;
      const body = JSON.stringify(buildSavePayload(data));
      syncedBody.current = mode === 'unsynced' ? null : body;
      dirty.current = mode === 'unsynced';
      const opened = { id, data };
      docRef.current = opened;
      setDoc(opened);
      setError(null);
      setDocBytes(body.length);
      setLastSavedAt(mode === 'synced' ? savedAt ?? new Date() : null);
      setStatus(mode === 'synced' ? 'saved' : mode === 'new' ? 'idle' : 'pending');
      if (mode === 'unsynced') scheduleSave(0);
    },
    [scheduleSave],
  );

  const close = useCallback(() => {
    clearTimers();
    docRef.current = null;
    syncedBody.current = null;
    dirty.current = false;
    setDoc(null);
    setStatus('idle');
    setError(null);
    setLastSavedAt(null);
  }, []);

  /** Intenta guardar ya los cambios pendientes. Devuelve false si no se pudo. */
  const flush = useCallback(async (): Promise<boolean> => {
    clearTimeout(saveTimer.current);
    if (!docRef.current) return true;
    if (!dirty.current && !inFlight.current) return true;
    const current = docRef.current;
    clearTimeout(draftTimer.current);
    await saveDraft(current.id, current.data);
    return runSave();
  }, [runSave]);

  // Reintenta al recuperar la conexión y avisa antes de cerrar con cambios sin sincronizar.
  useEffect(() => {
    const onOnline = () => {
      if (dirty.current) void runSaveRef.current();
    };
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty.current) return;
      const current = docRef.current;
      if (current) void saveDraft(current.id, current.data);
      e.preventDefault();
    };
    window.addEventListener('online', onOnline);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('beforeunload', onBeforeUnload);
      clearTimeout(saveTimer.current);
      clearTimeout(draftTimer.current);
    };
  }, []);

  return {
    doc,
    status,
    lastSavedAt,
    error,
    docBytes,
    isHeavy: docBytes > HEAVY_DOCUMENT_BYTES,
    update,
    open,
    close,
    flush,
    saveNow: runSave,
  };
}

export type DocumentEditor = ReturnType<typeof useDocumentEditor>;
