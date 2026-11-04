import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/proxy';

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Todo excepto estáticos de Next, iconos e imágenes públicas.
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|vendor/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|map)$).*)',
  ],
};
