import React from 'react';
import { ReportData } from '@/lib/types';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

export default function ExecutiveSummary({ data, onChange }: Props) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Resumen Ejecutivo</h2>
      <label className="field-label">Texto del Resumen *</label>
      <RichTextEditor
        value={data.executiveSummary}
        onChange={(html) => onChange({ ...data, executiveSummary: html })}
        placeholder="Describe el contexto general de la auditoría, qué se encontró, y cuál es el impacto global..."
        rows={6}
      />
      <p className="text-xs text-slate-500">
        Usa la barra de herramientas para dar formato: <strong className="text-slate-400">negrita</strong>, <em className="text-slate-400">cursiva</em>, colores y destacadores.
      </p>
    </div>
  );
}
