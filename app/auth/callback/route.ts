import { NextResponse, type NextRequest } from 'next/server';
import type { EmailOtpType } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { safeNextPath } from '@/lib/auth/redirect';

/**
 * Destino de los enlaces de Supabase Auth (confirmación de cuenta y recuperación
 * de contraseña). Soporta tanto el flujo PKCE (`code`) como `token_hash`.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNextPath(searchParams.get('next'));
  const code = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  const supabase = await createClient();
  let ok = false;

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(next, origin));

  const url = new URL('/login', origin);
  url.searchParams.set('error', 'link');
  return NextResponse.redirect(url);
}
