'use client';

import React, { useRef, useState } from 'react';
import { Finding, Severity, severityConfig } from '@/lib/types';

interface Props {
  finding: Finding;
  index: number;
  onChange: (finding: Finding) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  isFirst: boolean;
  isLast: boolean;
}

const severityOptions: Severity[] = ['critical', 'warning', 'info', 'improvement'];

export default function FindingCard({ finding, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }: Props) {
  const [collapsed, setCollapsed] = useState(false);
  const imgRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Finding>(field: K, value: Finding[K]) =>
    onChange({ ...finding, [field]: value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => update('image', reader.result as string);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    update('image', undefined);
    if (imgRef.current) imgRef.current.value = '';
  };

  const cfg = severityConfig[finding.severity];
  const borderColors: Record<Severity, string> = {
    critical: 'border-red-500/40',
    warning: 'border-yellow-500/40',
    info: 'border-blue-500/40',
    improvement: 'border-purple-500/40',
  };
  const headerColors: Record<Severity, string> = {
    critical: 'from-red-950/60 to-red-900/20',
    warning: 'from-yellow-950/60 to-yellow-900/20',
    info: 'from-blue-950/60 to-blue-900/20',
    improvement: 'from-purple-950/60 to-purple-900/20',
  };

  return (
    <div className={`rounded-xl border ${borderColors[finding.severity]} bg-slate-900 overflow-hidden shadow-lg`}>
      {/* Card Header */}
      <div className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r ${headerColors[finding.severity]}`}>
        <span className="text-lg">{cfg.emoji}</span>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">
            #{String(index + 1).padStart(2, '0')}
          </span>
          <span className="text-sm font-semibold text-white truncate">
            {finding.title || <span className="text-slate-500 font-normal italic">Sin título...</span>}
          </span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            title="Mover arriba"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >↑</button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            title="Mover abajo"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >↓</button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs font-bold"
          >
            {collapsed ? '▼ Expandir' : '▲ Colapsar'}
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-all ml-1"
            title="Eliminar hallazgo"
          >✕</button>
        </div>
      </div>

      {/* Card Body */}
      {!collapsed && (
        <div className="p-5 space-y-4">
          {/* Row 1: Severity + Title */}
          <div className="grid grid-cols-4 gap-4">
            <div>
              <label className="field-label">Severidad</label>
              <select
                value={finding.severity}
                onChange={e => update('severity', e.target.value as Severity)}
                className="field-input"
              >
                {severityOptions.map(s => (
                  <option key={s} value={s}>
                    {severityConfig[s].emoji} {severityConfig[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-3">
              <label className="field-label">Título del Hallazgo *</label>
              <input
                type="text"
                placeholder="Ej: Identificador de Transacción Vacío"
                value={finding.title}
                onChange={e => update('title', e.target.value)}
                className="field-input"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="field-label">Descripción *</label>
            <textarea
              rows={3}
              placeholder="Describe el problema encontrado de forma clara y técnica..."
              value={finding.description}
              onChange={e => update('description', e.target.value)}
              className="field-input resize-none"
            />
          </div>

          {/* Location */}
          <div>
            <label className="field-label">Ubicación / Contexto</label>
            <input
              type="text"
              placeholder='Ej: Botones "Continuar por WhatsApp" en todas las secciones'
              value={finding.location || ''}
              onChange={e => update('location', e.target.value)}
              className="field-input"
            />
          </div>

          {/* JSON / Code Block */}
          <div className="rounded-xl border border-slate-700 p-4 space-y-3 bg-slate-800/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">📋 Fragmento de Código / JSON</label>
              <span className="text-xs text-slate-500">Compatible con DataLayer Checker</span>
            </div>
            <div>
              <label className="field-label">Etiqueta del bloque</label>
              <input
                type="text"
                placeholder="Ej: JSON · DataLayer"
                value={finding.codeBlock?.language || ''}
                onChange={e =>
                  update('codeBlock', { language: e.target.value, content: finding.codeBlock?.content || '' })
                }
                className="field-input font-mono text-xs"
              />
            </div>
            <div>
              <label className="field-label">Código / JSON</label>
              <textarea
                rows={8}
                placeholder={'Pega aquí el JSON del dataLayer, por ejemplo:\n{\n  "event": "purchase",\n  "ecommerce": {\n    "transaction_id": ""\n  }\n}'}
                value={finding.codeBlock?.content || ''}
                onChange={e =>
                  update('codeBlock', { language: finding.codeBlock?.language || 'JSON · DataLayer', content: e.target.value })
                }
                className="field-input font-mono text-xs resize-none"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Compare Block Toggle */}
          <div className="rounded-xl border border-slate-700 p-4 space-y-3 bg-slate-800/40">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">⚖️ Comparativa (Anómalo vs. Correcto)</label>
              <button
                type="button"
                onClick={() => update('showCompare', !finding.showCompare)}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                  finding.showCompare ? 'bg-indigo-600' : 'bg-slate-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    finding.showCompare ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
            {finding.showCompare && (
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="space-y-2">
                  <label className="field-label text-red-400">🔴 Etiqueta Anómala</label>
                  <input
                    type="text"
                    placeholder="Escenario Anómalo (WhatsApp)"
                    value={finding.compareBlock?.anomalyLabel || ''}
                    onChange={e =>
                      update('compareBlock', { ...(finding.compareBlock || { anomalyCode: '', correctLabel: '', correctCode: '' }), anomalyLabel: e.target.value })
                    }
                    className="field-input text-xs"
                  />
                  <label className="field-label text-red-400">Código anómalo</label>
                  <textarea
                    rows={6}
                    placeholder="JSON con el error..."
                    value={finding.compareBlock?.anomalyCode || ''}
                    onChange={e =>
                      update('compareBlock', { ...(finding.compareBlock || { anomalyLabel: '', correctLabel: '', correctCode: '' }), anomalyCode: e.target.value })
                    }
                    className="field-input font-mono text-xs resize-none"
                    spellCheck={false}
                  />
                </div>
                <div className="space-y-2">
                  <label className="field-label text-green-400">🟢 Etiqueta Correcta</label>
                  <input
                    type="text"
                    placeholder="Escenario Correcto (Home)"
                    value={finding.compareBlock?.correctLabel || ''}
                    onChange={e =>
                      update('compareBlock', { ...(finding.compareBlock || { anomalyLabel: '', anomalyCode: '', correctCode: '' }), correctLabel: e.target.value })
                    }
                    className="field-input text-xs"
                  />
                  <label className="field-label text-green-400">Código correcto</label>
                  <textarea
                    rows={6}
                    placeholder="JSON correcto..."
                    value={finding.compareBlock?.correctCode || ''}
                    onChange={e =>
                      update('compareBlock', { ...(finding.compareBlock || { anomalyLabel: '', anomalyCode: '', correctLabel: '' }), correctCode: e.target.value })
                    }
                    className="field-input font-mono text-xs resize-none"
                    spellCheck={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Image Upload */}
          <div className="rounded-xl border border-slate-700 p-4 space-y-3 bg-slate-800/40">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">🖼️ Imagen / Screenshot de Evidencia</label>
            {finding.image ? (
              <div className="space-y-2">
                <img
                  src={finding.image}
                  alt="Preview"
                  className="max-h-40 rounded-lg border border-slate-600 object-contain"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Pie de foto (opcional)"
                    value={finding.imageCaption || ''}
                    onChange={e => update('imageCaption', e.target.value)}
                    className="field-input flex-1 text-xs"
                  />
                  <button
                    onClick={removeImage}
                    className="text-red-400 hover:text-red-300 text-xs font-semibold whitespace-nowrap transition-colors"
                  >
                    ✕ Eliminar imagen
                  </button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-600 rounded-xl p-6 cursor-pointer hover:border-indigo-500 hover:bg-indigo-900/10 transition-all">
                <span className="text-3xl">📸</span>
                <span className="text-sm text-slate-400">Haz clic o arrastra una imagen aquí</span>
                <span className="text-xs text-slate-600">PNG, JPG, WebP — se embebe en el reporte como base64</span>
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Impact */}
          <div>
            <label className="field-label">📉 Impacto</label>
            <textarea
              rows={3}
              placeholder="¿Qué consecuencia tiene este error? Ej: Conversiones no registradas, CPA inflado..."
              value={finding.impact}
              onChange={e => update('impact', e.target.value)}
              className="field-input resize-none"
            />
          </div>

          {/* Solution */}
          <div>
            <label className="field-label">✅ Solución IT</label>
            <textarea
              rows={3}
              placeholder="¿Qué debe hacer el equipo técnico para corregirlo?"
              value={finding.solution}
              onChange={e => update('solution', e.target.value)}
              className="field-input resize-none"
            />
          </div>
        </div>
      )}
    </div>
  );
}
