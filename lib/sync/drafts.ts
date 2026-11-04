import { createStore, del, entries, get, set, type UseStore } from 'idb-keyval';
import type { AnyDocData } from '@/lib/types';
import { getDocTitle } from '@/lib/types';

/**
 * Copia local (IndexedDB) de los documentos con cambios aún no sincronizados.
 * Permite recuperar el trabajo si la nube falla o se cierra la pestaña.
 */
export interface LocalDraft {
  id: string;
  title: string;
  docType: AnyDocData['docType'];
  data: AnyDocData;
  updatedAt: number;
}

let store: UseStore | null = null;
const getStore = () => {
  if (typeof indexedDB === 'undefined') return null;
  store ??= createStore('doc-builder', 'drafts');
  return store;
};

export async function saveDraft(id: string, data: AnyDocData): Promise<void> {
  const s = getStore();
  if (!s) return;
  const draft: LocalDraft = { id, title: getDocTitle(data), docType: data.docType, data, updatedAt: Date.now() };
  try {
    await set(id, draft, s);
  } catch (err) {
    console.warn('[drafts] no se pudo guardar el borrador local', err);
  }
}

export async function getDraft(id: string): Promise<LocalDraft | undefined> {
  const s = getStore();
  if (!s) return undefined;
  try {
    return await get<LocalDraft>(id, s);
  } catch {
    return undefined;
  }
}

export async function deleteDraft(id: string): Promise<void> {
  const s = getStore();
  if (!s) return;
  try {
    await del(id, s);
  } catch {
    /* ignorar */
  }
}

export async function listDrafts(): Promise<LocalDraft[]> {
  const s = getStore();
  if (!s) return [];
  try {
    const all = await entries<string, LocalDraft>(s);
    return all.map(([, v]) => v).filter(Boolean).sort((a, b) => b.updatedAt - a.updatedAt);
  } catch {
    return [];
  }
}
