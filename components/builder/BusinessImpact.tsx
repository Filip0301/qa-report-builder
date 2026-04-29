import React from 'react';
import { BusinessPoint, ReportData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

function newPoint(): BusinessPoint {
  return { id: uuidv4(), title: '', description: '' };
}

export default function BusinessImpact({ data, onChange }: Props) {
  const points = data.businessPoints;

  const updatePoint = (id: string, field: keyof BusinessPoint, value: string) => {
    onChange({
      ...data,
      businessPoints: points.map(p => (p.id === id ? { ...p, [field]: value } : p)),
    });
  };

  const addPoint = () => onChange({ ...data, businessPoints: [...points, newPoint()] });

  const removePoint = (id: string) =>
    onChange({ ...data, businessPoints: points.filter(p => p.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Implicación de Negocio</h2>
        <button onClick={addPoint} className="btn-secondary text-xs">
          + Agregar punto
        </button>
      </div>

      {points.length === 0 && (
        <p className="text-slate-500 text-sm italic">
          Agrega puntos de implicación de negocio (&quot;El So What?&quot;).
        </p>
      )}

      {points.map((point, i) => (
        <div key={point.id} className="rounded-xl border border-slate-700 p-4 space-y-3 bg-slate-800/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Punto #{i + 1}</span>
            <button
              onClick={() => removePoint(point.id)}
              className="text-slate-500 hover:text-red-400 transition-colors text-sm"
            >
              ✕ Eliminar
            </button>
          </div>
          <div className="space-y-3">
            <div>
              <label className="field-label">Título</label>
              <input
                type="text"
                placeholder="Ej: Inversión en Riesgo"
                value={point.title}
                onChange={e => updatePoint(point.id, 'title', e.target.value)}
                className="field-input"
              />
            </div>
            <div>
              <label className="field-label">Descripción</label>
              <RichTextEditor
                value={point.description}
                onChange={(html) => updatePoint(point.id, 'description', html)}
                placeholder="Explica el impacto..."
                rows={2}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
