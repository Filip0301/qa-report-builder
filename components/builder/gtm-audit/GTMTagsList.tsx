'use client';
import React from 'react';
import { GTMAuditData, GTMTag, GTMTagStatus } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: GTMAuditData; onChange: (d: GTMAuditData) => void; }

const statusOptions: { value: GTMTagStatus; label: string; cls: string }[] = [
  { value: 'active',  label: '✅ Activo',         cls: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { value: 'paused',  label: '⏸ Pausado',         cls: 'bg-slate-500/15 text-slate-400 border-slate-500/30' },
  { value: 'issues',  label: '⚠️ Con Problemas',   cls: 'bg-red-500/15 text-red-400 border-red-500/30' },
];

const TAG_TYPES = ['GA4 Config','GA4 Event','Google Ads Conversion','Google Ads Remarketing','Floodlight','Custom HTML','Custom Image','Hotjar','Meta Pixel','TikTok Pixel','Otro'];

export default function GTMTagsList({ data, onChange }: Props) {
  const empty = (): GTMTag => ({ id: uuid(), name: '', type: 'GA4 Event', status: 'active', trigger: '', issues: '' });
  const add = () => onChange({ ...data, tags: [...data.tags, empty()] });
  const remove = (id: string) => onChange({ ...data, tags: data.tags.filter(t => t.id !== id) });
  const update = (id: string, field: keyof GTMTag, value: string) =>
    onChange({ ...data, tags: data.tags.map(t => t.id === id ? { ...t, [field]: value } : t) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Tags</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.tags.length} | Activos: {data.tags.filter(t=>t.status==='active').length} | Con problemas: {data.tags.filter(t=>t.status==='issues').length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Tag
        </button>
      </div>
      {data.tags.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">🏷️</p><p className="font-medium">No hay tags registrados.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-44">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-36">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Trigger</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Problemas</th>
                <th className="w-10"/>
              </tr>
            </thead>
            <tbody>
              {data.tags.map(t => {
                const sc = statusOptions.find(s=>s.value===t.status)!;
                return (
                  <tr key={t.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                    <td className="px-4 py-2"><input className="bg-transparent text-white font-medium text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1" value={t.name} onChange={e=>update(t.id,'name',e.target.value)} placeholder="Tag name"/></td>
                    <td className="px-4 py-2">
                      <select className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500 w-full"
                        value={t.type} onChange={e=>update(t.id,'type',e.target.value)}>
                        {TAG_TYPES.map(tp=><option key={tp}>{tp}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <select className={`text-xs font-bold px-2 py-1 rounded-full border focus:outline-none cursor-pointer ${sc.cls}`}
                        value={t.status} onChange={e=>update(t.id,'status',e.target.value as GTMTagStatus)}>
                        {statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2"><input className="bg-transparent text-slate-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1" value={t.trigger} onChange={e=>update(t.id,'trigger',e.target.value)} placeholder="All Pages, Click..."/></td>
                    <td className="px-4 py-2"><input className="bg-transparent text-red-400 text-xs w-full focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1" value={t.issues} onChange={e=>update(t.id,'issues',e.target.value)} placeholder="—"/></td>
                    <td className="px-4 py-2"><button onClick={()=>remove(t.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
