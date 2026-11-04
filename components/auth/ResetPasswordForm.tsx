'use client';

import React, { useState } from 'react';
import { Loader2, Lock } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth/errors';

export default function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) throw error;
      window.location.assign('/');
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-base font-bold text-white">Crea una nueva contraseña</h2>
      {(['password', 'confirm'] as const).map(field => (
        <div key={field}>
          <label htmlFor={field} className="field-label">
            {field === 'password' ? 'Nueva contraseña' : 'Repite la contraseña'}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              id={field}
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={field === 'password' ? password : confirm}
              onChange={e => (field === 'password' ? setPassword : setConfirm)(e.target.value)}
              className="field-input pl-9"
              placeholder="Mínimo 8 caracteres"
            />
          </div>
        </div>
      ))}
      {error && (
        <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
      )}
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60">
        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        Guardar contraseña
      </button>
    </form>
  );
}
