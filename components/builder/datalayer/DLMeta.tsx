'use client';
import React from 'react';
import { DLDocData } from '@/lib/types';
import { CheckCircle, FileEdit } from 'lucide-react';
import RichTextEditor from '@/components/ui/RichTextEditor';

interface Props { data: DLDocData; onChange: (d: DLDocData) => void; }

export default function DLMeta({ data, onChange }: Props) {
  const set = (field: keyof DLDocData, value: any) => onChange({ ...data, [field]: value });
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold uppercase tracking-widest text-teal-400 mb-4">Metadatos del Documento</h2>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="field-label">Cliente *</label><input className="field-input" value={data.client} onChange={e=>set('client',e.target.value)} placeholder="Ej: Falabella"/></div>
        <div><label className="field-label">Nombre del Proyecto *</label><input className="field-input" value={data.projectName} onChange={e=>set('projectName',e.target.value)} placeholder="Ej: DataLayer E-commerce"/></div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div><label className="field-label">Versión</label><input className="field-input" value={data.version} onChange={e=>set('version',e.target.value)} placeholder="v1.0"/></div>
        <div><label className="field-label">Fecha</label><input className="field-input" value={data.date} onChange={e=>set('date',e.target.value)}/></div>
        <div><label className="field-label">Autor</label><input className="field-input" value={data.author} onChange={e=>set('author',e.target.value)} placeholder="Nombre del analista"/></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className="field-label">Marca / Agencia (Footer)</label><input className="field-input" value={data.footerBrand} onChange={e=>set('footerBrand',e.target.value)}/></div>
        <div><label className="field-label">Nota del Footer</label><input className="field-input" value={data.footerNote} onChange={e=>set('footerNote',e.target.value)}/></div>
      </div>
      <div>
        <label className="field-label">Descripción General</label>
        <RichTextEditor value={data.overview} onChange={v=>set('overview',v)} placeholder="Descripción general del DataLayer implementado, framework utilizado, etc."/>
      </div>
      <div className="pt-2 border-t border-slate-800 space-y-3">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Opciones de exportación</p>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            {data.reportStatus==='final' ? <CheckCircle className="w-4 h-4 text-green-400"/> : <FileEdit className="w-4 h-4 text-slate-400"/>}
            <div><p className="text-sm font-semibold text-white">{data.reportStatus==='final'?'Finalizado':'Borrador'}</p><p className="text-xs text-slate-500">{data.reportStatus==='final'?'Listo para entregar':'Trabajo en progreso'}</p></div>
          </div>
          <button onClick={()=>set('reportStatus',data.reportStatus==='final'?'draft':'final')}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${data.reportStatus==='final'?'bg-green-500':'bg-slate-600'}`}
            role="switch" aria-checked={data.reportStatus==='final'}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.reportStatus==='final'?'translate-x-5':'translate-x-0'}`}/>
          </button>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50">
          <div className="flex items-center gap-2.5">
            <span className="text-base flex-shrink-0">📑</span>
            <div><p className="text-sm font-semibold text-white">Tabla de Contenidos</p><p className="text-xs text-slate-500">Índice de eventos en el PDF</p></div>
          </div>
          <button onClick={()=>set('includeToc',!data.includeToc)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${data.includeToc?'bg-teal-500':'bg-slate-600'}`}
            role="switch" aria-checked={data.includeToc}>
            <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${data.includeToc?'translate-x-5':'translate-x-0'}`}/>
          </button>
        </div>
      </div>
    </div>
  );
}
