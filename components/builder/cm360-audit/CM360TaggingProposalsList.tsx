'use client';
import React from 'react';
import { CM360AuditData, CM360TaggingProposal } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: CM360AuditData; onChange: (d: CM360AuditData) => void; }

const PRIORITY_OPTIONS = ['Alta', 'Media', 'Baja'];

export default function CM360TaggingProposalsList({ data, onChange }: Props) {
  const empty = (): CM360TaggingProposal => ({
    id: uuid(),
    priority: 'Alta',
    cm360Id: '',
    activityName: '',
    countingType: 'Sales',
    gtmTrigger: '',
    u1: '',
    u2: '',
    u3: '',
    u4: '',
    u5: '',
    u6: '',
    u7: '',
    uN: ''
  });

  const add = () => onChange({ ...data, taggingProposals: [...data.taggingProposals, empty()] });
  const remove = (id: string) => onChange({ ...data, taggingProposals: data.taggingProposals.filter(p => p.id !== id) });
  const update = (id: string, field: keyof CM360TaggingProposal, value: string) =>
    onChange({ ...data, taggingProposals: data.taggingProposals.map(p => p.id === id ? { ...p, [field]: value } : p) });

  return (
    <div className="space-y-4 text-xs">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400">Propuesta de Marcaje</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.taggingProposals.length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-cyan-700 hover:bg-cyan-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Propuesta
        </button>
      </div>

      {data.taggingProposals.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">💡</p><p className="font-medium text-sm">No hay propuestas de marcaje.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.taggingProposals.map((p) => (
            <div key={p.id} className="border border-slate-700 bg-slate-800/20 rounded-xl p-4 space-y-3 relative group">
              <button onClick={()=>remove(p.id)} className="absolute top-2 right-2 p-1.5 text-slate-500 hover:text-red-400 bg-slate-800 hover:bg-slate-700 rounded transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4"/></button>
              
              <div className="grid grid-cols-12 gap-3 pr-8">
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Prioridad</label>
                  <select className="field-input text-xs" value={p.priority} onChange={e=>update(p.id,'priority',e.target.value)}>
                    {PRIORITY_OPTIONS.map(opt=><option key={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">ID CM360</label>
                  <input className="field-input text-xs font-mono" value={p.cm360Id} onChange={e=>update(p.id,'cm360Id',e.target.value)} placeholder="123456"/>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Activity Name</label>
                  <input className="field-input text-xs" value={p.activityName} onChange={e=>update(p.id,'activityName',e.target.value)} placeholder="Nombre en CM360"/>
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] text-slate-400 mb-1">Tipo</label>
                  <select className="field-input text-xs" value={p.countingType} onChange={e=>update(p.id,'countingType',e.target.value)}>
                    <option>Sales</option>
                    <option>Counter</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div className="col-span-3">
                  <label className="block text-[10px] text-slate-400 mb-1">Activador GTM</label>
                  <input className="field-input text-xs" value={p.gtmTrigger} onChange={e=>update(p.id,'gtmTrigger',e.target.value)} placeholder="CE - purchase"/>
                </div>
              </div>
              <div className="grid grid-cols-8 gap-2">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u1</label>
                  <input className="field-input text-xs" value={p.u1} onChange={e=>update(p.id,'u1',e.target.value)} placeholder="Product Name"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u2</label>
                  <input className="field-input text-xs" value={p.u2} onChange={e=>update(p.id,'u2',e.target.value)} placeholder="Product ID"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u3</label>
                  <input className="field-input text-xs" value={p.u3} onChange={e=>update(p.id,'u3',e.target.value)} placeholder="Business Line"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u4</label>
                  <input className="field-input text-xs" value={p.u4} onChange={e=>update(p.id,'u4',e.target.value)} placeholder="Lead Channel"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u5</label>
                  <input className="field-input text-xs" value={p.u5} onChange={e=>update(p.id,'u5',e.target.value)} placeholder="Order ID"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u6</label>
                  <input className="field-input text-xs" value={p.u6} onChange={e=>update(p.id,'u6',e.target.value)} placeholder="Revenue"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">u7</label>
                  <input className="field-input text-xs" value={p.u7} onChange={e=>update(p.id,'u7',e.target.value)} placeholder="Page Path"/>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[10px] text-slate-400 mb-1">uN</label>
                  <input className="field-input text-xs" value={p.uN} onChange={e=>update(p.id,'uN',e.target.value)} placeholder="Otros"/>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
