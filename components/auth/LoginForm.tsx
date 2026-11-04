'use client';

import React, { useState } from 'react';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { translateAuthError } from '@/lib/auth/errors';

type Mode = 'signin' | 'signup' | 'forgot';

const titles: Record<Mode, string> = {
  signin: 'Iniciar sesión',
  signup: 'Crear cuenta',
  forgot: 'Recuperar contraseña',
};

export default function LoginForm({ next, linkError }: { next: string; linkError?: boolean }) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    linkError ? 'El enlace expiró o ya fue usado. Inicia sesión o solicita uno nuevo.' : null,
  );
  const [notice, setNotice] = useState<string | null>(null);

  const switchMode = (m: Mode) => {
    setMode(m);
    setError(null);
    setNotice(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);
    const supabase = createClient();
    const callback = `${window.location.origin}/auth/callback`;

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.assign(next);
        return;
      }
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${callback}?next=${encodeURIComponent(next)}` },
        });
        if (error) throw error;
        if (data.session) {
          window.location.assign(next);
          return;
        }
        setNotice('Te enviamos un correo para confirmar tu cuenta. Ábrelo desde este mismo navegador.');
        return;
      }
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${callback}?next=/reset-password`,
      });
      if (error) throw error;
      setNotice('Si el correo está registrado, recibirás un enlace para crear una nueva contraseña.');
    } catch (err) {
      setError(translateAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate={false}>
      <div className="flex items-center gap-2">
        {mode !== 'signin' && (
          <button
            type="button"
            onClick={() => switchMode('signin')}
            className="p-1 -ml-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Volver a iniciar sesión"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h2 className="text-base font-bold text-white">{titles[mode]}</h2>
      </div>

      <div>
        <label htmlFor="email" className="field-label">Correo electrónico</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="field-input pl-9"
            placeholder="tu@empresa.com"
          />
        </div>
      </div>

      {mode !== 'forgot' && (
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="field-label">Contraseña</label>
            {mode === 'signin' && (
              <button type="button" onClick={() => switchMode('forgot')} className="text-[11px] text-indigo-400 hover:text-indigo-300 mb-1.5">
                ¿La olvidaste?
              </button>
            )}
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" aria-hidden="true" />
            <input
              id="password"
              type="password"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              required
              minLength={mode === 'signup' ? 8 : undefined}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="field-input pl-9"
              placeholder={mode === 'signup' ? 'Mínimo 8 caracteres' : '••••••••'}
            />
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>
      )}
      {notice && (
        <p role="status" className="text-sm text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">{notice}</p>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 disabled:opacity-60 disabled:cursor-not-allowed">
        {loading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {mode === 'signin' ? 'Entrar' : mode === 'signup' ? 'Crear cuenta' : 'Enviar enlace'}
      </button>

      {mode === 'signin' && (
        <p className="text-center text-xs text-slate-400">
          ¿No tienes cuenta?{' '}
          <button type="button" onClick={() => switchMode('signup')} className="text-indigo-400 hover:text-indigo-300 font-semibold">
            Regístrate
          </button>
        </p>
      )}
    </form>
  );
}
