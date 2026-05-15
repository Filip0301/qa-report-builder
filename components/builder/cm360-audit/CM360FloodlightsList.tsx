'use client';
import React from 'react';
import { CM360AuditData, CM360Floodlight, CM360Action } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: CM360AuditData; onChange: (d: CM360AuditData) => void; }

const ACTION_OPTIONS: { value: CM360Action; label: string; cls: string }[] = [
  { value: 'Mantener',  label: '✅ Mantener',   cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { value: 'Modificar', label: '✏️ Modificar',  cls: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { value: 'Eliminar',  label: '🗑️ Eliminar',    cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
  { value: 'Crear',     label: '✨ Crear',      cls: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' },
];

export default function CM360FloodlightsList({ data, onChange }: Props) {
  const empty = (): CM360Floodlight => ({
    id: uuid(),
    name: '',
    cm360Id: '',
    impressionsYesterday: '0',
    impressionsLast7Days: '0',
    category: '',
    activityTagString: '',
    groupTagString: '',
    type: 'Sales',
    expectedUrl: '',
    action: 'Mantener',
    actionJustification: '',
    newSourceOfTruth: ''
  });

  const add = () => onChange({ ...data, floodlights: [...data.floodlights, empty()] });
  const remove = (id: string) => onChange({ ...data, floodlights: data.floodlights.filter(f => f.id !== id) });
  const update = (id: string, field: keyof CM360Floodlight, value: string) =>
    onChange({ ...data, floodlights: data.floodlights.map(f => f.id === id ? { ...f, [field]: value } : f) });

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Floodlights</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.floodlights.length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Floodlight
        </button>
      </div>

      {data.floodlights.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">🎯</p><p className="font-medium text-sm">No hay floodlights documentados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.floodlights.map((f, i) => {
            const sc = ACTION_OPTIONS.find(a => a.value === f.action)!;
            return (
              <div key={f.id} className="border border-slate-700 bg-slate-800/20 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 grid grid-cols-12 gap-3">
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-400 mb-1">Activity Name</label>
                      <input className="field-input text-xs" value={f.name} onChange={e=>update(f.id,'name',e.target.value)} placeholder="Ej: Venta completada"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">ID CM360</label>
                      <input className="field-input text-xs font-mono" value={f.cm360Id} onChange={e=>update(f.id,'cm360Id',e.target.value)} placeholder="123456"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">Imp Yesterday</label>
                      <input className="field-input text-xs" value={f.impressionsYesterday} onChange={e=>update(f.id,'impressionsYesterday',e.target.value)} placeholder="0"/>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] text-slate-400 mb-1">Imp 7 Days</label>
                      <input className="field-input text-xs" value={f.impressionsLast7Days} onChange={e=>update(f.id,'impressionsLast7Days',e.target.value)} placeholder="0"/>
                    </div>
                    <div className="col-span-3">
                      <label className="block text-[10px] text-slate-400 mb-1">Acción</label>
                      <select className={`w-full text-xs font-bold px-2 py-1.5 rounded border focus:outline-none cursor-pointer ${sc.cls}`}
                        value={f.action} onChange={e=>update(f.id,'action',e.target.value)}>
                        {ACTION_OPTIONS.map(a=><option key={a.value} value={a.value}>{a.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={()=>remove(f.id)} className="p-1.5 mt-4 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                </div>
                <div className="grid grid-cols-12 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Activity Tag String</label>
                    <input className="field-input text-xs font-mono" value={f.activityTagString} onChange={e=>update(f.id,'activityTagString',e.target.value)} placeholder="tag_string"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Group Tag String</label>
                    <input className="field-input text-xs font-mono" value={f.groupTagString} onChange={e=>update(f.id,'groupTagString',e.target.value)} placeholder="group_string"/>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Type (Counting)</label>
                    <select className="field-input text-xs" value={f.type} onChange={e=>update(f.id,'type',e.target.value)}>
                      <option>Sales</option>
                      <option>Counter</option>
                      <option>Custom</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-[10px] text-slate-400 mb-1">Category</label>
                    <input className="field-input text-xs" value={f.category} onChange={e=>update(f.id,'category',e.target.value)} placeholder="Categoría"/>
                  </div>
                  <div className="col-span-4">
                    <label className="block text-[10px] text-slate-400 mb-1">Expected URL</label>
                    <input className="field-input text-xs text-blue-300" value={f.expectedUrl} onChange={e=>update(f.id,'expectedUrl',e.target.value)} placeholder="https://..."/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Justificación Técnica (Racional)</label>
                    <input className="field-input text-xs" value={f.actionJustification} onChange={e=>update(f.id,'actionJustification',e.target.value)} placeholder="Por qué se propone esta acción..."/>
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-400 mb-1">Nueva Fuente de Verdad</label>
                    <input className="field-input text-xs text-amber-300" value={f.newSourceOfTruth} onChange={e=>update(f.id,'newSourceOfTruth',e.target.value)} placeholder="Ej: DataLayer, Evento GA4, Custom JS..."/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
