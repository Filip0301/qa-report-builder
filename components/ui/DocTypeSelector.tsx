'use client';

import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { DocumentType } from '@/lib/types';
import { DOC_TYPE_LIST } from '@/lib/docTypes';
import Modal from './Modal';

interface Props {
  onSelect: (type: DocumentType) => void;
  onClose: () => void;
}

export default function DocTypeSelector({ onSelect, onClose }: Props) {
  return (
    <Modal size="xl" title="Nuevo documento" description="Elige el tipo de documento que quieres crear" onClose={onClose}>
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOC_TYPE_LIST.map(opt => (
          <button
            key={opt.type}
            type="button"
            onClick={() => onSelect(opt.type)}
            className={`group text-left p-5 rounded-xl bg-gradient-to-br ring-1 transition-all focus-visible:outline-none focus-visible:ring-2 ${opt.accent.card}`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0" aria-hidden="true">{opt.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="text-sm font-bold text-white">{opt.label}</h3>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${opt.accent.badge}`}>{opt.shortLabel}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{opt.description}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity flex-shrink-0 mt-1" aria-hidden="true" />
            </div>
          </button>
        ))}
      </div>
      <p className="px-6 pb-5 text-center text-xs text-slate-500">
        El documento se guarda automáticamente en la nube cuando empiezas a escribir.
      </p>
    </Modal>
  );
}
