'use client';

import React, { useEffect, useId, useRef, useState } from 'react';

interface MenuItem {
  label: React.ReactNode;
  description?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
  disabled?: boolean;
}

interface Props {
  button: (props: { open: boolean; toggle: () => void; id: string; menuId: string }) => React.ReactNode;
  items: MenuItem[];
  header?: React.ReactNode;
  align?: 'left' | 'right';
}

/** Menú desplegable accesible (Escape cierra, flechas navegan, clic fuera cierra). */
export default function Menu({ button, items, header, align = 'right' }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const menuId = `${id}-menu`;

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>('[aria-haspopup]')?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    rootRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus();
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    e.preventDefault();
    const els = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []);
    const idx = els.indexOf(document.activeElement as HTMLElement);
    const next = e.key === 'ArrowDown' ? (idx + 1) % els.length : (idx - 1 + els.length) % els.length;
    els[next]?.focus();
  };

  return (
    <div ref={rootRef} className="relative">
      {button({ open, toggle: () => setOpen(o => !o), id, menuId })}
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={id}
          onKeyDown={onMenuKeyDown}
          className={`absolute ${align === 'right' ? 'right-0' : 'left-0'} top-full mt-1.5 z-40 min-w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5`}
        >
          {header && <div className="px-3 py-2 border-b border-slate-800 mb-1">{header}</div>}
          {items.map((item, i) => (
            <button
              key={i}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                setOpen(false);
                item.onSelect();
              }}
              className="w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left text-sm text-slate-200 hover:bg-slate-800 focus-visible:bg-slate-800 focus-visible:outline-none disabled:opacity-50"
            >
              {item.icon && <span className="mt-0.5 text-slate-400" aria-hidden="true">{item.icon}</span>}
              <span className="flex-1">
                <span className="block font-semibold">{item.label}</span>
                {item.description && <span className="block text-xs text-slate-400">{item.description}</span>}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
