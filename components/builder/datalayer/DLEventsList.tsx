'use client';
import React from 'react';
import { DLDocData, DLEvent } from '@/lib/types';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: DLDocData; onChange: (d: DLDocData) => void; }

const varTypes = ['string','number','boolean','array','object'];
const emptyEvent = (): DLEvent => ({ id: uuid(), name: '', trigger: '', page: '', description: '', variables: '', codeExample: '' });

export default function DLEventsList({ data, onChange }: Props) {
  const [expanded, setExpanded] = React.useState<string | null>(data.events[0]?.id ?? null);

  const update = (id: string, field: keyof DLEvent, value: string) =>
    onChange({ ...data, events: data.events.map(e => e.id === id ? { ...e, [field]: value } : e) });

  const add = () => { const e = emptyEvent(); onChange({ ...data, events: [...data.events, e] }); setExpanded(e.id); };
  const remove = (id: string) => onChange({ ...data, events: data.events.filter(e => e.id !== id) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-400">Eventos del DataLayer</h2>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Evento
        </button>
      </div>
      {data.events.length === 0 && (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">⚡</p><p className="font-medium">No hay eventos registrados.</p>
          <p className="text-xs mt-1">Haz clic en "Agregar Evento" para comenzar.</p>
        </div>
      )}
      <div className="space-y-3">
        {data.events.map((e, i) => (
          <div key={e.id} className="border border-slate-700 rounded-xl overflow-hidden bg-slate-800/30">
            <button
              onClick={() => setExpanded(expanded === e.id ? null : e.id)}
              className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-800/50 transition-colors"
            >
              <span className="text-xs font-bold bg-teal-900/50 text-teal-400 px-2 py-0.5 rounded-md font-mono">{String(i+1).padStart(2,'0')}</span>
              <code className="text-teal-300 text-sm font-mono flex-1">{e.name || <span className="text-slate-500 not-italic font-sans font-normal">Sin nombre</span>}</code>
              {e.trigger && <span className="text-xs text-slate-500 hidden sm:block truncate max-w-[120px]">→ {e.trigger}</span>}
              {expanded === e.id ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0"/> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0"/>}
              <button onClick={ev=>{ev.stopPropagation();remove(e.id);}} className="p-1 text-slate-500 hover:text-red-400 transition-colors flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5"/>
              </button>
            </button>
            {expanded === e.id && (
              <div className="px-4 pb-4 space-y-3 border-t border-slate-700/50 pt-4">
                <div className="grid grid-cols-3 gap-3">
                  <div><label className="field-label">Nombre del Evento *</label><input className="field-input font-mono text-teal-300" value={e.name} onChange={ev=>update(e.id,'name',ev.target.value)} placeholder="add_to_cart"/></div>
                  <div><label className="field-label">Trigger</label><input className="field-input" value={e.trigger} onChange={ev=>update(e.id,'trigger',ev.target.value)} placeholder="Clic en botón 'Agregar'"/></div>
                  <div><label className="field-label">Página / Sección</label><input className="field-input" value={e.page} onChange={ev=>update(e.id,'page',ev.target.value)} placeholder="PDP, Carrito..."/></div>
                </div>
                <div><label className="field-label">Variables enviadas (separadas por comas)</label><input className="field-input font-mono text-xs" value={e.variables} onChange={ev=>update(e.id,'variables',ev.target.value)} placeholder="item_id, item_name, price, quantity"/></div>
                <div>
                  <label className="field-label">Código JSON de Ejemplo</label>
                  <textarea rows={8} className="field-input font-mono text-xs text-green-300 bg-slate-900" value={e.codeExample} onChange={ev=>update(e.id,'codeExample',ev.target.value)}
                    placeholder={`window.dataLayer.push({\n  event: '${e.name || 'event_name'}',\n  // variables aquí\n});`}/>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
