import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  const { data, error } = await supabase
    .from('reports')
    .select('id, title, client, created_at, report_status')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, client, data, reportStatus } = body;

    const { data: newReport, error } = await supabase
      .from('reports')
      .insert([
        {
          title: title || 'Sin título',
          client: client || 'Sin cliente',
          report_status: reportStatus || 'draft',
          data,
        },
      ])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: newReport.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
