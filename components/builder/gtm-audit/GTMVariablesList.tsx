'use client';
import React from 'react';
import { GTMAuditData, GTMVariable } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: GTMAuditData; onChange: (d: GTMAuditData) => void; }
const VAR_TYPES = ['Data Layer Variable','JavaScript Variable','1st Party Cookie','Auto-Event Variable','Constant','Custom JavaScript','DOM Element','HTTP Referrer','URL','Lookup Table','Otro'];

export default function GTMVariablesList({ data, onChange }: Props) {
  const empty = (): GTMVariable => ({ id: uuid(), name: '', type: 'Data Layer Variable', value: '', issues: '' });
  const add = () => onChange({ ...data, variables: [...data.variables, empty()] });
  const remove = (id: string) => onChange({ ...data, variables: data.variables.filter(v => v.id !== id) });
  const update = (id: string, field: keyof GTMVariable, value: string) =>
    onChange({ ...data, variables: data.variables.map(v => v.id === id ? { ...v, [field]: value } : v) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400">Variables</h2>
          <p className="text-xs text-slate-500 mt-0.5">Total: {data.variables.length}</p>
        </div>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-3.5 h-3.5"/> Agregar Variable
        </button>
      </div>
      {data.variables.length === 0 ? (
        <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
          <p className="text-2xl mb-2">🔤</p><p className="font-medium">No hay variables registradas.</p>
        </div>
      ) : (
        <div className="border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-700">
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Nombre</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-52">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Valor / Config</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Problemas</th>
                <th className="w-10"/>
              </tr>
            </thead>
            <tbody>
              {data.variables.map(v => (
                <tr key={v.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/20">
                  <td className="px-4 py-2"><input className="bg-transparent text-white font-medium text-sm w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1" value={v.name} onChange={e=>update(v.id,'name',e.target.value)} placeholder="Variable name"/></td>
                  <td className="px-4 py-2">
                    <select className="bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 text-slate-300 focus:outline-none focus:border-emerald-500 w-full"
                      value={v.type} onChange={e=>update(v.id,'type',e.target.value)}>
                      {VAR_TYPES.map(t=><option key={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2"><input className="bg-transparent font-mono text-teal-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded px-1" value={v.value} onChange={e=>update(v.id,'value',e.target.value)} placeholder="ecommerce.purchase.value"/></td>
                  <td className="px-4 py-2"><input className="bg-transparent text-red-400 text-xs w-full focus:outline-none focus:ring-1 focus:ring-red-500 rounded px-1" value={v.issues} onChange={e=>update(v.id,'issues',e.target.value)} placeholder="—"/></td>
                  <td className="px-4 py-2"><button onClick={()=>remove(v.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5"/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
