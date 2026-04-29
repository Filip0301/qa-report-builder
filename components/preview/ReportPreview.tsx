'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Finding, ReportData, SectionHeights } from '@/lib/types';
import { generateHTML } from '@/lib/generateHTML';
import ReportPreviewNative from './ReportPreviewNative';

interface Props {
  data: ReportData;
  onReorder: (findings: Finding[]) => void;
  onResize: (heights: SectionHeights) => void;
  onFindingResize: (id: string, height: number) => void;
}

export default function ReportPreview({ data, onReorder, onResize, onFindingResize }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [editMode, setEditMode] = useState(true);

  useEffect(() => {
    if (editMode) return;
    const html = generateHTML(data);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [data, editMode]);

  return (
    <div className="h-full flex flex-col">
      {/* Preview toolbar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/80 flex-shrink-0">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
        </div>
        <span className="text-xs text-slate-500 font-mono ml-1">preview · auditoría QA</span>

        {/* Mode toggle */}
        <div className="ml-auto flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50">
          <button
            onClick={() => setEditMode(true)}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
              editMode
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            ✦ Modo Edición
          </button>
          <button
            onClick={() => setEditMode(false)}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
              !editMode
                ? 'bg-slate-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            🖥 Vista Fiel
          </button>
        </div>

        {!editMode && (
          <span className="text-xs text-indigo-400 font-semibold animate-pulse">● Live</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {editMode ? (
          <ReportPreviewNative
            data={data}
            onReorder={onReorder}
            onResize={onResize}
            onFindingResize={onFindingResize}
          />
        ) : (
          <div className="w-full h-full bg-slate-200">
            <iframe
              ref={iframeRef}
              title="Report Preview"
              className="w-full h-full border-0"
              sandbox="allow-same-origin"
            />
          </div>
        )}
      </div>
    </div>
  );
}
