'use client';
import React from 'react';
import { DLDocData, DLVariable } from '@/lib/types';
import { Plus, Trash2 } from 'lucide-react';
import { v4 as uuid } from 'uuid';

interface Props { data: DLDocData; onChange: (d: DLDocData) => void; }
const varTypes: DLVariable['type'][] = ['string','number','boolean','array','object'];
const typeColors: Record<DLVariable['type'],string> = {
  string:'text-green-400', number:'text-yellow-400', boolean:'text-purple-400', array:'text-blue-400', object:'text-pink-400'
};

export default function DLVariablesList({ data, onChange }: Props) {
  const empty = (): DLVariable => ({ id: uuid(), name: '', type: 'string', description: '', example: '' });
  const add = () => onChange({ ...data, variables: [...data.variables, empty()] });
  const remove = (id: string) => onChange({ ...data, variables: data.variables.filter(v => v.id !== id) });
  const update = (id: string, field: keyof DLVariable, value: string) =>
    onChange({ ...data, variables: data.variables.map(v => v.id === id ? { ...v, [field]: value } : v) });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-teal-400">Diccionario de Variables</h2>
        <button onClick={add} className="flex items-center gap-1.5 text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white px-3 py-1.5 rounded-lg transition-colors">
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
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-40">Variable</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-28">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-400 w-40">Ejemplo</th>
                <th className="w-10"/>
              </tr>
            </thead>
            <tbody>
              {data.variables.map(v => (
                <tr key={v.id} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30">
                  <td className="px-4 py-2">
                    <input className="bg-transparent font-mono text-teal-300 text-xs w-full focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1" value={v.name} onChange={e=>update(v.id,'name',e.target.value)} placeholder="variable_name"/>
                  </td>
                  <td className="px-4 py-2">
                    <select className={`bg-slate-800 border border-slate-700 rounded-md text-xs px-2 py-1 focus:outline-none focus:border-teal-500 ${typeColors[v.type]}`}
                      value={v.type} onChange={e=>update(v.id,'type',e.target.value as DLVariable['type'])}>
                      {varTypes.map(t=><option key={t} value={t}>{t}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-2"><input className="bg-transparent text-slate-300 text-sm w-full focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1" value={v.description} onChange={e=>update(v.id,'description',e.target.value)} placeholder="Descripción de la variable"/></td>
                  <td className="px-4 py-2"><input className="bg-transparent font-mono text-slate-400 text-xs w-full focus:outline-none focus:ring-1 focus:ring-teal-500 rounded px-1" value={v.example} onChange={e=>update(v.id,'example',e.target.value)} placeholder='"valor"'/></td>
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
