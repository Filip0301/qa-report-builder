'use client';

import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import Modal from './Modal';

interface ConfirmOptions {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'default';
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/** Reemplaza a window.confirm() con un diálogo con el estilo de la app. */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>(opts => {
    resolver.current?.(false);
    setOptions(opts);
    return new Promise<boolean>(resolve => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const danger = options?.tone === 'danger';

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {options && (
        <Modal
          size="sm"
          title={options.title}
          onClose={() => settle(false)}
          icon={danger ? (
            <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" aria-hidden="true" />
            </div>
          ) : undefined}
          footer={
            <>
              <button type="button" className="btn-secondary" onClick={() => settle(false)}>
                {options.cancelLabel ?? 'Cancelar'}
              </button>
              <button
                type="button"
                autoFocus
                onClick={() => settle(true)}
                className={danger ? 'btn-primary !bg-red-600 hover:!bg-red-500 !shadow-red-900/40' : 'btn-primary'}
              >
                {options.confirmLabel ?? 'Confirmar'}
              </button>
            </>
          }
        >
          {options.message && <div className="px-6 py-5 text-sm text-slate-300">{options.message}</div>}
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm debe usarse dentro de <ConfirmProvider>.');
  return ctx;
}
