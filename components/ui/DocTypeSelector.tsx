'use client';
import React from 'react';
import { DocumentType } from '@/lib/types';
import { X } from 'lucide-react';

interface DocTypeOption {
  type: DocumentType;
  icon: string;
  label: string;
  description: string;
  gradient: string;
  ring: string;
  badge: string;
}

const options: DocTypeOption[] = [
  {
    type: 'qa-audit',
    icon: '🔍',
    label: 'Auditoría QA',
    description: 'Documenta hallazgos, errores y mejoras encontradas durante pruebas de calidad. Incluye evidencia, impacto y soluciones.',
    gradient: 'from-indigo-900/60 to-indigo-800/30',
    ring: 'ring-indigo-500/50 hover:ring-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300',
  },
  {
    type: 'datalayer-doc',
    icon: '📐',
    label: 'DataLayer Documentation',
    description: 'Referencia técnica de la estructura del DataLayer: eventos disponibles, variables, tipos y ejemplos de código JSON.',
    gradient: 'from-teal-900/60 to-teal-800/30',
    ring: 'ring-teal-500/50 hover:ring-teal-400',
    badge: 'bg-teal-500/20 text-teal-300',
  },
  {
    type: 'tagging-plan',
    icon: '📋',
    label: 'Plan de Marcaje',
    description: 'Define los eventos a implementar antes del desarrollo: trigger, página, variables, prioridad y estado de cada marcaje.',
    gradient: 'from-violet-900/60 to-violet-800/30',
    ring: 'ring-violet-500/50 hover:ring-violet-400',
    badge: 'bg-violet-500/20 text-violet-300',
  },
  {
    type: 'gtm-audit',
    icon: '🏷️',
    label: 'Auditoría GTM',
    description: 'Revisión del contenedor de Google Tag Manager: tags activos, pausados, triggers, variables y recomendaciones.',
    gradient: 'from-emerald-900/60 to-emerald-800/30',
    ring: 'ring-emerald-500/50 hover:ring-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300',
  },
  {
    type: 'cm360-audit',
    icon: '🎯',
    label: 'Auditoría CM360',
    description: 'Documenta el estado de los floodlights por anunciante, marcaje en GTM y propuestas de implementación en Campaign Manager 360.',
    gradient: 'from-cyan-900/60 to-cyan-800/30',
    ring: 'ring-cyan-500/50 hover:ring-cyan-400',
    badge: 'bg-cyan-500/20 text-cyan-300',
  },
];

interface Props {
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}

export default function DocTypeSelector({ onSelect, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/50">
          <div>
            <h2 className="text-lg font-bold text-white">Nuevo Documento</h2>
            <p className="text-sm text-slate-400 mt-0.5">Elige el tipo de documento que quieres crear</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors">
            <X className="w-5 h-5"/>
          </button>
        </div>

        {/* Cards grid */}
        <div className="p-6 grid grid-cols-2 gap-4">
          {options.map(opt => (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className={`relative text-left p-5 rounded-xl bg-gradient-to-br ${opt.gradient} border border-slate-700 ring-2 ring-transparent ${opt.ring} transition-all duration-200 group hover:border-transparent hover:scale-[1.02] hover:shadow-xl`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0 mt-0.5">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-base font-bold text-white">{opt.label}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${opt.badge}`}>
                      {opt.type === 'qa-audit' ? 'QA' : opt.type === 'datalayer-doc' ? 'DL' : opt.type === 'tagging-plan' ? 'TP' : opt.type === 'gtm-audit' ? 'GTM' : 'CM360'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{opt.description}</p>
                </div>
              </div>
              {/* Arrow indicator */}
              <div className="absolute bottom-4 right-4 w-6 h-6 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs">→</span>
              </div>
            </button>
          ))}
        </div>

        <div className="px-6 pb-5 text-center">
          <p className="text-xs text-slate-600">El documento se guardará automáticamente en la nube una vez comiences a escribir.</p>
        </div>
      </div>
    </div>
  );
}
