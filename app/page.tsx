import { createClient } from '@/lib/supabase/server';
import DocBuilderApp from '@/components/DocBuilderApp';

export default async function HomePage() {
  // El proxy ya redirige al login si no hay sesión; aquí solo se lee el correo para mostrarlo.
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = (data?.claims?.email as string | undefined) ?? null;

  return <DocBuilderApp userEmail={email} />;
}
