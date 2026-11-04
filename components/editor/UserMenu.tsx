'use client';

import React from 'react';
import { LogOut } from 'lucide-react';
import Menu from '@/components/ui/Menu';

interface Props {
  email: string | null;
  onSignOut: () => void;
}

export default function UserMenu({ email, onSignOut }: Props) {
  const initial = (email?.[0] ?? '?').toUpperCase();
  return (
    <Menu
      header={
        <>
          <p className="text-[11px] uppercase tracking-wide text-slate-500 font-bold">Sesión iniciada</p>
          <p className="text-sm text-slate-200 truncate max-w-52">{email ?? 'Usuario'}</p>
        </>
      }
      items={[{ label: 'Cerrar sesión', icon: <LogOut className="w-4 h-4" />, onSelect: onSignOut }]}
      button={({ open, toggle, id, menuId }) => (
        <button
          id={id}
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? menuId : undefined}
          aria-label={`Cuenta: ${email ?? 'usuario'}`}
          title={email ?? undefined}
          className="w-8 h-8 rounded-full bg-slate-700 hover:bg-slate-600 text-xs font-bold text-white flex items-center justify-center border border-slate-600"
        >
          {initial}
        </button>
      )}
    />
  );
}
