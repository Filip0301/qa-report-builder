'use client';

import React, { useEffect, useRef } from 'react';
import { ReportData } from '@/lib/types';
import { generateHTML } from '@/lib/generateHTML';

interface Props {
  data: ReportData;
}

export default function ReportPreview({ data }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const html = generateHTML(data);
    const iframe = iframeRef.current;
    if (!iframe) return;
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
  }, [data]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-700/60 bg-slate-900/80">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
        </div>
        <span className="text-xs text-slate-500 font-mono ml-1">preview · auditoría QA</span>
        <span className="ml-auto text-xs text-indigo-400 font-semibold animate-pulse">● Live</span>
      </div>

      <div className="flex-1 bg-slate-200 overflow-hidden">
        <iframe
          ref={iframeRef}
          title="Report Preview"
          className="w-full h-full border-0"
          sandbox="allow-same-origin"
        />
      </div>
    </div>
  );
}
