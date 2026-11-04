import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromSupabaseError, jsonError, requireUser } from '@/lib/api/http';
import { reportIdSchema } from '@/lib/api/schema';

export const dynamic = 'force-dynamic';

/** Deshace un borrado lógico. */
export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id: rawId } = await context.params;
  const parsed = reportIdSchema.safeParse(rawId);
  if (!parsed.success) return jsonError(400, 'Identificador de documento inválido.', 'invalid');

  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabase
    .from('reports')
    .update({ deleted_at: null })
    .eq('id', parsed.data)
    .select('id')
    .maybeSingle();

  if (error) return fromSupabaseError(error);
  if (!data) return jsonError(404, 'El documento no existe.', 'not_found');
  return NextResponse.json({ success: true });
}
