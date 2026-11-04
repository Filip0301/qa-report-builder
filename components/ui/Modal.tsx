'use client';

import React, { useEffect, useId, useRef } from 'react';
import { X } from 'lucide-react';

const widths = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
} as const;

interface Props {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClose: () => void;
  size?: keyof typeof widths;
  children: React.ReactNode;
  footer?: React.ReactNode;
  headerClassName?: string;
}

/**
 * Diálogo modal accesible basado en <dialog>: Escape y clic fuera cierran,
 * el foco queda atrapado dentro y vuelve al elemento anterior al cerrar.
 */
export default function Modal({ title, description, icon, onClose, size = 'md', children, footer, headerClassName = '' }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const previous = document.activeElement as HTMLElement | null;
    if (!dialog.open) dialog.showModal();
    return () => {
      if (dialog.open) dialog.close();
      previous?.focus?.();
    };
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      onCancel={e => {
        e.preventDefault();
        onClose();
      }}
      onMouseDown={e => {
        if (e.target === ref.current) onClose();
      }}
      className={`${widths[size]} w-[calc(100%-2rem)] m-auto p-0 bg-transparent text-white backdrop:bg-slate-950/80 backdrop:backdrop-blur-sm open:animate-[fadeIn_.15s_ease-out]`}
    >
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className={`px-6 py-4 border-b border-slate-800 flex items-center gap-3 bg-slate-800/50 ${headerClassName}`}>
          {icon}
          <div className="flex-1 min-w-0">
            <h2 id={titleId} className="text-base font-bold text-white">{title}</h2>
            {description && <p id={descId} className="text-xs text-slate-400 mt-0.5">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
        {footer && <div className="px-6 py-4 border-t border-slate-800 flex gap-3 justify-end">{footer}</div>}
      </div>
    </dialog>
  );
}
