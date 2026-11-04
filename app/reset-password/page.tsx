import type { Metadata } from 'next';
import AuthShell from '@/components/auth/AuthShell';
import ResetPasswordForm from '@/components/auth/ResetPasswordForm';

export const metadata: Metadata = { title: 'Nueva contraseña — Doc Builder' };

export default function ResetPasswordPage() {
  return (
    <AuthShell>
      <ResetPasswordForm />
    </AuthShell>
  );
}
