import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import LoginForm from '@/components/auth/LoginForm';
import { safeNextPath } from '@/lib/auth/redirect';

export const metadata: Metadata = { title: 'Iniciar sesión — Doc Builder' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  return (
    <AuthShell>
      <LoginForm next={safeNextPath(params.next)} linkError={params.error === 'link'} />
    </AuthShell>
  );
}
