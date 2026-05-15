'use client';
import React from 'react';
import { CM360AuditData, CM360Trigger } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: CM360AuditData; onChange: (d: CM360AuditData) => void; }

const TRIGGER_TYPES = ['Custom Event', 'Page View', 'DOM Ready', 'Window Loaded', 'Click - All Elements', 'Click - Just Links', 'Scroll Depth', 'Element Visibility', 'Form Submission', 'Otro'];

export default function CM360TriggersList({ data, onChange }: Props) {
  const empty = (): CM360Trigger => ({ id: uuid(), name: '', type: 'Custom Event', eventName: '', firesOn: '' });
  const add = () => onChange({ ...data, triggers: [...data.triggers, empty()] });
  const remove = (id: string) => onChange({ ...data, triggers: data.triggers.filter(t => t.id !== id) });
  const update = (id: string, field: keyof CM360Trigger, value: string) =>
    onChange({ ...data, triggers: data.triggers.map(t => t.id === id ? { ...t, [field]: value } : t) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Triggers (Activadores GTM)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.triggers.length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Trigger
        </button>
      </div>

      {data.triggers.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">⚡</p><p className="font-medium text-sm">No hay triggers registrados.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Nombre Propuesto</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Event Name</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-1/3">Condiciones (Fires On)</th>
                <th className="w-10"/>
              </tr>
            </thead>
            <tbody>
              {data.triggers.map(t => (
                <tr key={t.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-white font-medium text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.name} onChange={e=>update(t.id,'name',e.target.value)} placeholder="Ej: CE - purchase"/>
                  </td>
                  <td className="px-4 py-2">
                    <select className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 w-full"
                      value={t.type} onChange={e=>update(t.id,'type',e.target.value)}>
                      {TRIGGER_TYPES.map(tp=><option key={tp}>{tp}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-amber-300 font-mono text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.eventName} onChange={e=>update(t.id,'eventName',e.target.value)} placeholder="purchase"/>
                  </td>
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-slate-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.firesOn} onChange={e=>update(t.id,'firesOn',e.target.value)} placeholder="All Custom Events / Some Custom Events..."/>
                  </td>
                  <td className="px-4 py-2">
                    <button onClick={()=>remove(t.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
