import React from 'react';
import { ReportData } from '@/lib/types';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

export default function ExecutiveSummary({ data, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Resumen Ejecutivo</h2>
      <label className="field-label">Texto del Resumen *</label>
      <textarea
        rows={6}
        placeholder="Describe el contexto general de la auditoría, qué se encontró, y cuál es el impacto global..."
        value={data.executiveSummary}
        onChange={e => onChange({ ...data, executiveSummary: e.target.value })}
        className="field-input resize-none"
      />
      <p className="text-xs text-slate-500">
        Puedes usar texto en negrita encerrando palabras entre doble asterisco (se mantendrá en el reporte).
      </p>
    </div>
  );
}
