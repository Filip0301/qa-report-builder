import { createBrowserClient } from '@supabase/ssr';
import { SUPABASE_KEY, SUPABASE_URL } from './env';

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente de Supabase para el navegador (solo se usa para Auth). */
export function createClient() {
  browserClient ??= createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
