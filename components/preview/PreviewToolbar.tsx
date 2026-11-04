import React from 'react';

/** Barra superior del panel de vista previa (estilo ventana). */
export default function PreviewToolbar({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-700/60 bg-slate-900/80 flex-shrink-0">
      <div className="flex gap-1.5" aria-hidden="true">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
      </div>
      <span className="text-xs text-slate-400 font-mono ml-1 truncate">vista previa · {label}</span>
      {children}
    </div>
  );
}
