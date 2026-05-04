import React from 'react';
import { ReportData } from '@/lib/types';
import { FileEdit, CheckCircle } from 'lucide-react';

interface Props {
  data: ReportData;
  onChange: (data: ReportData) => void;
}

const statusOptions = [
  { value: 'critical', label: '🔴 Crítico / Acción Requerida' },
  { value: 'warning', label: '🟡 Advertencia' },
  { value: 'ok', label: '🟢 OK' },
];

export default function ReportMeta({ data, onChange }: Props) {
  const update = (field: keyof ReportData, value: string | boolean) =>
    onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-400 mb-4">Datos del Informe</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Cliente *</label>
          <input
            type="text"
            placeholder="Ej: VTR, Falabella..."
            value={data.client}
            onChange={e => update('client', e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Auditor</label>
          <input
            type="text"
            placeholder="Nombre del analista"
            value={data.auditor}
            onChange={e => update('auditor', e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      <div>
        <label className="field-label">Título del Informe *</label>
        <input
          type="text"
          placeholder="Ej: Auditoría Técnica – Integridad del DataLayer"
          value={data.reportTitle}
          onChange={e => update('reportTitle', e.target.value)}
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Fecha</label>
          <input
            type="text"
            placeholder="Ej: 23 de abril de 2026"
            value={data.date}
            onChange={e => update('date', e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Estado General</label>
          <select
            value={data.status}
            onChange={e => update('status', e.target.value)}
            className="field-input"
          >
            {statusOptions.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="field-label">Marca / Agencia (Footer)</label>
          <input
            type="text"
            placeholder="Ej: Havas · SCA"
            value={data.footerBrand}
            onChange={e => update('footerBrand', e.target.value)}
            className="field-input"
          />
        </div>
        <div>
          <label className="field-label">Nota del Footer</label>
          <input
            type="text"
            placeholder="Ej: Uso Confidencial"
            value={data.footerNote}
            onChange={e => update('footerNote', e.target.value)}
            className="field-input"
          />
        </div>
      </div>

      {/* ── Status & Options ─────────────────────────────────────── */}
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Opciones de exportación</p>

        {/* Report Status Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            {data.reportStatus === 'final' ? (
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
            ) : (
              <FileEdit className="w-4 h-4 text-slate-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-sm font-semibold text-white">
                {data.reportStatus === 'final' ? 'Finalizado' : 'Borrador'}
              </p>
              <p className="text-xs text-slate-500">
                {data.reportStatus === 'final'
                  ? 'Listo para entregar al cliente'
                  : 'Trabajo en progreso'}
              </p>
            </div>
          </div>
          <button
            onClick={() => update('reportStatus', data.reportStatus === 'final' ? 'draft' : 'final')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              data.reportStatus === 'final' ? 'bg-green-500' : 'bg-slate-600'
            }`}
            role="switch"
            aria-checked={data.reportStatus === 'final'}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.reportStatus === 'final' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Table of Contents Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <span className="text-base flex-shrink-0">📑</span>
            <div>
              <p className="text-sm font-semibold text-white">Tabla de Contenidos</p>
              <p className="text-xs text-slate-500">Índice de hallazgos al inicio del PDF</p>
            </div>
          </div>
          <button
            onClick={() => update('includeToc', !data.includeToc)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
              data.includeToc ? 'bg-indigo-500' : 'bg-slate-600'
            }`}
            role="switch"
            aria-checked={data.includeToc}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                data.includeToc ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
