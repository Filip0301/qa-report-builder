'use client';
import React from 'react';
import { TaggingPlanData, TaggingItem, TaggingItemStatus, TaggingItemPriority } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: TaggingPlanData; onChange: (d: TaggingPlanData) => void; }

const statusOptions: { value: TaggingItemStatus; label: string; color: string }[] = [
  { value: 'pending', label: 'Pendiente', color: 'text-yellow-400' },
  { value: 'in-progress', label: 'En Progreso', color: 'text-violet-400' },
  { value: 'done', label: 'Listo', color: 'text-green-400' },
  { value: 'blocked', label: 'Bloqueado', color: 'text-red-400' },
];
const priorityOptions: { value: TaggingItemPriority; label: string }[] = [
  { value: 'high', label: '🔴 Alta' },
  { value: 'medium', label: '🟡 Media' },
  { value: 'low', label: '🟢 Baja' },
];
const statusBadge: Record<TaggingItemStatus,string> = {
  pending:'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
  'in-progress':'bg-violet-500/15 text-violet-400 border-violet-500/30',
  done:'bg-green-500/15 text-green-400 border-green-500/30',
  blocked:'bg-red-500/15 text-red-400 border-red-500/30',
};

export default function TPItemsList({ data, onChange }: Props) {
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const empty = (): TaggingItem => ({ id: uuid(), event: '', description: '', trigger: '', page: '', variables: '', priority: 'medium', status: 'pending', notes: '' });
  const add = () => { const item = empty(); onChange({ ...data, items: [...data.items, item] }); setExpanded(item.id); };
  const remove = (id: string) => onChange({ ...data, items: data.items.filter(i => i.id !== id) });
  const update = (id: string, field: keyof TaggingItem, value: string) =>
    onChange({ ...data, items: data.items.map(i => i.id === id ? { ...i, [field]: value } : i) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-violet-400">Plan de Eventos</h2>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-violet-700 hover:bg-violet-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Evento
        </button>
      </div>
      {data.items.length === 0 && (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">📌</p><p className="font-medium">No hay eventos en el plan.</p>
        </div>
      )}
      <div className="space-y-2">
        {data.items.map((item, i) => (
          <div key={item.id} className="border border-slate-700 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 p-3 bg-slate-800/40 hover:bg-slate-800/60 cursor-pointer" onClick={()=>setExpanded(expanded===item.id?null:item.id)}>
              <span className="text-xs font-bold text-slate-500 w-5 text-center">{i+1}</span>
              <span className="flex-1 text-sm font-semibold text-white truncate">{item.event || <span className="text-slate-500 font-normal">Sin nombre</span>}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusBadge[item.status]}`}>
                {statusOptions.find(s=>s.value===item.status)?.label}
              </span>
              <span className="text-xs text-slate-500">{item.page || '—'}</span>
              <button onClick={e=>{e.stopPropagation();remove(item.id);}} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
            {expanded === item.id && (
              <div className="p-4 border-t border-slate-700/50 space-y-3">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-2"><label className="field-label">Nombre del Evento *</label><input className="field-input" value={item.event} onChange={e=>update(item.id,'event',e.target.value)} placeholder="Ej: purchase, add_to_cart"/></div>
                  <div><label className="field-label">Prioridad</label>
                    <select className="field-input" value={item.priority} onChange={e=>update(item.id,'priority',e.target.value)}>
                      {priorityOptions.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div><label className="field-label">Estado</label>
                    <select className="field-input" value={item.status} onChange={e=>update(item.id,'status',e.target.value)}>
                      {statusOptions.map(s=><option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="field-label">Trigger</label><input className="field-input" value={item.trigger} onChange={e=>update(item.id,'trigger',e.target.value)} placeholder="Clic en botón, form submit..."/></div>
                  <div><label className="field-label">Página / Sección</label><input className="field-input" value={item.page} onChange={e=>update(item.id,'page',e.target.value)} placeholder="Checkout, PDP..."/></div>
                </div>
                <div><label className="field-label">Variables (separadas por comas)</label><input className="field-input font-mono text-xs" value={item.variables} onChange={e=>update(item.id,'variables',e.target.value)} placeholder="transaction_id, value, currency..."/></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
