import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromSupabaseError, jsonError, requireUser } from '@/lib/api/http';
import { MAX_DOCUMENT_BYTES, reportIdSchema, saveReportSchema } from '@/lib/api/schema';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

async function parseId(context: Context) {
  const { id } = await context.params;
  const parsed = reportIdSchema.safeParse(id);
  return parsed.success ? parsed.data : null;
}

/** Devuelve el contenido de un documento. */
export async function GET(_request: Request, context: Context) {
  const id = await parseId(context);
  if (!id) return jsonError(400, 'Identificador de documento inválido.', 'invalid');

  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabase
    .from('reports')
    .select('id, data, updated_at')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) return fromSupabaseError(error);
  if (!data) return jsonError(404, 'El documento no existe o fue eliminado.', 'not_found');
  return NextResponse.json(data);
}

/** Crea o actualiza (upsert idempotente) un documento con un id generado en el cliente. */
export async function PUT(request: Request, context: Context) {
  const id = await parseId(context);
  if (!id) return jsonError(400, 'Identificador de documento inválido.', 'invalid');

  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if ('error' in auth) return auth.error;

  const length = Number(request.headers.get('content-length') ?? 0);
  if (length > MAX_DOCUMENT_BYTES) {
    return jsonError(413, 'El documento es demasiado pesado. Reduce o elimina algunas imágenes.', 'too_large');
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError(400, 'El cuerpo de la petición no es JSON válido.', 'invalid');
  }

  const parsed = saveReportSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(400, parsed.error.issues[0]?.message ?? 'Datos inválidos.', 'invalid');
  }

  const { title, client, reportStatus, docType, data } = parsed.data;
  const { data: saved, error } = await supabase
    .from('reports')
    .upsert(
      {
        id,
        title: title || 'Sin título',
        client: client || 'Sin cliente',
        report_status: reportStatus,
        doc_type: docType,
        data,
        updated_by: auth.userId,
      },
      { onConflict: 'id' },
    )
    .select('id, updated_at')
    .single();

  if (error) return fromSupabaseError(error);
  return NextResponse.json(saved);
}

/** Borrado lógico: el documento se puede restaurar con POST /api/reports/:id/restore. */
export async function DELETE(_request: Request, context: Context) {
  const id = await parseId(context);
  if (!id) return jsonError(400, 'Identificador de documento inválido.', 'invalid');

  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabase
    .from('reports')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
    .is('deleted_at', null)
    .select('id')
    .maybeSingle();

  if (error) return fromSupabaseError(error);
  if (!data) return jsonError(404, 'El documento no existe o ya fue eliminado.', 'not_found');
  return NextResponse.json({ success: true });
}
