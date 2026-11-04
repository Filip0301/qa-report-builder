import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { SUPABASE_KEY, SUPABASE_URL } from './env';

/** Rutas accesibles sin sesión. */
const PUBLIC_PATHS = ['/login', '/auth', '/reset-password'];

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers ?? {}).forEach(([key, value]) => response.headers.set(key, value));
      },
    },
  });

  // No ejecutar código entre createServerClient y getClaims (recomendación de Supabase).
  const { data } = await supabase.auth.getClaims();
  const isAuthenticated = Boolean(data?.claims?.sub);

  const { pathname, search } = request.nextUrl;
  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
  const isApi = pathname.startsWith('/api/');

  // Las páginas privadas redirigen al login; las rutas /api responden 401 por sí mismas.
  if (!isAuthenticated && !isPublic && !isApi) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.search = '';
    if (pathname !== '/') url.searchParams.set('next', pathname + search);
    else if (search) url.searchParams.set('next', '/' + search);
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach(c => redirect.cookies.set(c));
    return redirect;
  }

  if (isAuthenticated && pathname === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
