'use client';
import React from 'react';
import { GTMAuditData } from '@/lib/types';
import { CheckCircle, FileEdit } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface Props { data: GTMAuditData; onChange: (d: GTMAuditData) => void; }

export default function GTMMeta({ data, onChange }: Props) {
  const set = (field: keyof GTMAuditData, value: any) => onChange({ ...data, [field]: value });
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Metadatos de la Auditoría</h2>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="field-label">Cliente *</label><input className="field-input" value={data.client} onChange={e=>set('client',e.target.value)} placeholder="Ej: Falabella"/></div>
        <div><label className="field-label">Nombre del Proyecto</label><input className="field-input" value={data.projectName} onChange={e=>set('projectName',e.target.value)} placeholder="Ej: Auditoría GTM Q2 2026"/></div>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div>
          <label className="field-label">Container ID *</label>
          <input className="field-input font-mono text-emerald-300" value={data.containerId} onChange={e=>set('containerId',e.target.value)} placeholder="GTM-XXXXXXX"/>
        </div>
        <div><label className="field-label">Account ID</label><input className="field-input font-mono" value={data.accountId} onChange={e=>set('accountId',e.target.value)} placeholder="123456789"/></div>
        <div><label className="field-label">Auditor</label><input className="field-input" value={data.auditor} onChange={e=>set('auditor',e.target.value)} placeholder="Nombre del analista"/></div>
        <div><label className="field-label">Fecha</label><input className="field-input" value={data.date} onChange={e=>set('date',e.target.value)}/></div>
      </div>
      <div><label className="field-label">Resumen de Hallazgos</label><RichTextEditor value={data.summaryText} onChange={v=>set('summaryText',v)} placeholder="Descripción general del estado del contenedor GTM..."/></div>
      <div><label className="field-label">Recomendaciones Generales</label><RichTextEditor value={data.recommendations} onChange={v=>set('recommendations',v)} placeholder="Lista de acciones recomendadas para mejorar el contenedor..."/></div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="field-label">Marca / Agencia (Footer)</label><input className="field-input" value={data.footerBrand} onChange={e=>set('footerBrand',e.target.value)}/></div>
        <div><label className="field-label">Nota del Footer</label><input className="field-input" value={data.footerNote} onChange={e=>set('footerNote',e.target.value)}/></div>
      </div>
      <div className="pt-2 border-t border-slate-800">
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            {data.reportStatus==='final'?<CheckCircle className="w-4 h-4 text-green-400"/>:<FileEdit className="w-4 h-4 text-slate-400"/>}
            <div><p className="text-sm font-semibold text-white">{data.reportStatus==='final'?'Finalizado':'Borrador'}</p><p className="text-xs text-slate-500">{data.reportStatus==='final'?'Listo para entregar':'Trabajo en progreso'}</p></div>
          </div>
          <button onClick={()=>set('reportStatus',data.reportStatus==='final'?'draft':'final')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${data.reportStatus==='final'?'bg-green-500':'bg-slate-600'}`}
            role="switch" aria-checked={data.reportStatus==='final'}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.reportStatus==='final'?'translate-x-5':'translate-x-0'}`}/>
          </button>
        </div>
      </div>
    </div>
  );
}
