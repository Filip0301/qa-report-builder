'use client';
import React from 'react';
import { CM360AuditData, CM360Tag } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: CM360AuditData; onChange: (d: CM360AuditData) => void; }

const TAG_TYPES = ['Floodlight Counter', 'Floodlight Sales', 'Google Ads Conversion', 'GA4 Event', 'Custom HTML', 'Otro'];

export default function CM360TagsList({ data, onChange }: Props) {
  const empty = (): CM360Tag => ({ id: uuid(), name: '', type: 'Floodlight Counter', activityId: '', uVariables: '', triggerAssigned: '' });
  const add = () => onChange({ ...data, tags: [...data.tags, empty()] });
  const remove = (id: string) => onChange({ ...data, tags: data.tags.filter(t => t.id !== id) });
  const update = (id: string, field: keyof CM360Tag, value: string) =>
    onChange({ ...data, tags: data.tags.map(t => t.id === id ? { ...t, [field]: value } : t) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Etiquetas (GTM Tags)</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.tags.length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Tag
        </button>
      </div>

      {data.tags.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">🏷️</p><p className="font-medium text-sm">No hay etiquetas registradas.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Nombre Propuesto</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Activity ID</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">U-Variables a incluir</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Trigger Asignado</th>
                <th className="w-10"/>
              </tr>
            </thead>
            <tbody>
              {data.tags.map(t => (
                <tr key={t.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-white font-medium text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.name} onChange={e=>update(t.id,'name',e.target.value)} placeholder="Ej: FL - Sales - Purchase"/>
                  </td>
                  <td className="px-4 py-2">
                    <select className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none focus:border-cyan-500 w-full"
                      value={t.type} onChange={e=>update(t.id,'type',e.target.value)}>
                      {TAG_TYPES.map(tp=><option key={tp}>{tp}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-amber-300 font-mono text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.activityId} onChange={e=>update(t.id,'activityId',e.target.value)} placeholder="123456"/>
                  </td>
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-slate-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.uVariables} onChange={e=>update(t.id,'uVariables',e.target.value)} placeholder="u1, u2, u3..."/>
                  </td>
                  <td className="px-4 py-2">
                    <input className="bg-transparent text-slate-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-cyan-500 rounded px-1 py-1" 
                      value={t.triggerAssigned} onChange={e=>update(t.id,'triggerAssigned',e.target.value)} placeholder="CE - purchase"/>
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
