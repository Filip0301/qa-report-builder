import type { AnyDocData } from '@/lib/types';
import type { ReportSummary } from '@/lib/api/schema';
import { getDocClient, getDocTitle } from '@/lib/types';

export const UNAUTHORIZED_EVENT = 'docbuilder:unauthorized';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
    this.name = 'ApiError';
  }
  /** Error transitorio: conviene reintentar más tarde. */
  get retriable() {
    return this.status === 0 || this.status === 408 || this.status === 429 || this.status >= 500;
  }
}

async function request<T>(url: string, init: RequestInit = {}, timeoutMs = 15_000): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
      signal: AbortSignal.timeout(timeoutMs),
      cache: 'no-store',
    });
  } catch (err) {
    const timedOut = err instanceof DOMException && err.name === 'TimeoutError';
    throw new ApiError(
      timedOut ? 'El servidor tardó demasiado en responder.' : 'Sin conexión con el servidor.',
      0,
      timedOut ? 'timeout' : 'offline',
    );
  }

  if (!res.ok) {
    let message = `Error ${res.status}`;
    let code: string | undefined;
    try {
      const body = await res.json();
      message = body.error ?? message;
      code = body.code;
    } catch {
      /* respuesta sin JSON */
    }
    if (res.status === 401 && typeof window !== 'undefined') {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    throw new ApiError(message, res.status, code);
  }
  return res.json() as Promise<T>;
}

export function buildSavePayload(data: AnyDocData) {
  return {
    title: getDocTitle(data),
    client: getDocClient(data),
    reportStatus: data.reportStatus ?? 'draft',
    docType: data.docType,
    data,
  };
}

export const reportsApi = {
  list: () => request<ReportSummary[]>('/api/reports'),
  get: (id: string) => request<{ id: string; data: unknown; updated_at: string }>(`/api/reports/${id}`),
  save: (id: string, body: string) =>
    request<{ id: string; updated_at: string }>(`/api/reports/${id}`, { method: 'PUT', body }, 30_000),
  remove: (id: string) => request<{ success: true }>(`/api/reports/${id}`, { method: 'DELETE' }),
  restore: (id: string) => request<{ success: true }>(`/api/reports/${id}/restore`, { method: 'POST' }),
};
