import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fromSupabaseError, requireUser } from '@/lib/api/http';

export const dynamic = 'force-dynamic';

/** Lista los documentos activos (no borrados), del más reciente al más antiguo. */
export async function GET() {
  const supabase = await createClient();
  const auth = await requireUser(supabase);
  if ('error' in auth) return auth.error;

  const { data, error } = await supabase
    .from('reports')
    .select('id, title, client, created_at, updated_at, report_status, doc_type')
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(500);

  if (error) return fromSupabaseError(error);
  return NextResponse.json(data ?? []);
}
