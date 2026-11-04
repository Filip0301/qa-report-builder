import { NextResponse } from 'next/server';
import type { createClient } from '@/lib/supabase/server';
import { isSupabaseConfigured } from '@/lib/supabase/env';

type ServerClient = Awaited<ReturnType<typeof createClient>>;

export function jsonError(status: number, message: string, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status });
}

/** Errores de Supabase/PostgREST → respuesta HTTP sin filtrar detalles internos. */
export function fromSupabaseError(error: { message?: string; code?: string } | null | undefined) {
  const message = error?.message ?? '';
  console.error('[api] supabase error', error);

  if (/fetch failed|ENOTFOUND|ECONNREFUSED|ETIMEDOUT|timeout|network/i.test(message) || !error?.code) {
    return jsonError(503, 'El servicio de datos no está disponible. Tus cambios quedan guardados en este navegador.', 'unavailable');
  }
  if (error.code === '42501') return jsonError(403, 'No tienes permiso para realizar esta acción.', 'forbidden');
  if (error.code === '23514' || error.code === '22P02') return jsonError(400, 'Datos inválidos.', 'invalid');
  return jsonError(500, 'Error inesperado al acceder a los datos.', 'internal');
}

/**
 * Verifica la sesión del usuario. Devuelve una respuesta 401/503 si no puede continuar.
 */
export async function requireUser(supabase: ServerClient) {
  if (!isSupabaseConfigured) {
    return { error: jsonError(503, 'Supabase no está configurado en este entorno.', 'unconfigured') } as const;
  }
  try {
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims?.sub) {
      return { error: jsonError(401, 'Tu sesión expiró. Vuelve a iniciar sesión.', 'unauthorized') } as const;
    }
    return { userId: data.claims.sub as string } as const;
  } catch (err) {
    console.error('[api] auth check failed', err);
    return { error: jsonError(503, 'No se pudo verificar la sesión. Intenta de nuevo.', 'unavailable') } as const;
  }
}
