'use client';

import React from 'react';
import { isIsoDate, todayIso } from '@/lib/dates';

interface Props {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

/**
 * Selector de fecha (se guarda como YYYY-MM-DD y se formatea al exportar).
 * Los documentos antiguos tenían la fecha como texto libre: se muestra ese texto
 * con la opción de pasar al calendario.
 */
export default function DateField({ value, onChange, label = 'Fecha' }: Props) {
  if (value && !isIsoDate(value)) {
    return (
      <div className="flex gap-1.5">
        <input aria-label={label} className="field-input" value={value} onChange={e => onChange(e.target.value)} />
        <button
          type="button"
          onClick={() => onChange(todayIso())}
          className="btn-secondary px-2 text-xs"
          title="Usar el calendario (se fija la fecha de hoy)"
        >
          📅
          <span className="sr-only">Usar el calendario</span>
        </button>
      </div>
    );
  }
  return (
    <input
      type="date"
      aria-label={label}
      className="field-input [color-scheme:dark]"
      value={value}
      onChange={e => onChange(e.target.value)}
    />
  );
}
