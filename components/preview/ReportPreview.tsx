'use client';

import React, { useState } from 'react';
import { Finding, ReportData, SectionHeights } from '@/lib/types';
import ReportPreviewNative from './ReportPreviewNative';
import HtmlPreview from './HtmlPreview';
import PreviewToolbar from './PreviewToolbar';

interface Props {
  data: ReportData;
  onReorder: (findings: Finding[]) => void;
  onResize: (heights: SectionHeights) => void;
  onFindingResize: (id: string, height: number) => void;
}

export default function ReportPreview({ data, onReorder, onResize, onFindingResize }: Props) {
  const [editMode, setEditMode] = useState(true);

  return (
    <div className="h-full flex flex-col">
      <PreviewToolbar label="Auditoría QA">
        <div className="ml-auto flex items-center gap-1 bg-slate-800 rounded-lg p-1 border border-slate-700/50" role="group" aria-label="Modo de vista previa">
          <button
            type="button"
            onClick={() => setEditMode(true)}
            aria-pressed={editMode}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
              editMode ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            ✦ Modo edición
          </button>
          <button
            type="button"
            onClick={() => setEditMode(false)}
            aria-pressed={!editMode}
            className={`text-xs font-semibold px-3 py-1 rounded-md transition-all ${
              !editMode ? 'bg-slate-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Vista fiel
          </button>
        </div>
      </PreviewToolbar>

      <div className="flex-1 overflow-hidden">
        {editMode ? (
          <ReportPreviewNative data={data} onReorder={onReorder} onResize={onResize} onFindingResize={onFindingResize} />
        ) : (
          <div className="w-full h-full bg-slate-200">
            <HtmlPreview data={data} />
          </div>
        )}
      </div>
    </div>
  );
}
