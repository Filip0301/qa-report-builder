'use client';

import React, { useDeferredValue, useMemo } from 'react';
import type { AnyDocData } from '@/lib/types';
import { generateDocHTML } from '@/lib/docTypes';

/**
 * Vista fiel del documento exportado.
 * - `sandbox` vacío: el HTML no puede ejecutar scripts ni acceder a la app.
 * - `useDeferredValue`: escribir no se bloquea mientras se regenera la vista previa.
 */
export default function HtmlPreview({ data, title = 'Vista previa del documento' }: { data: AnyDocData; title?: string }) {
  const deferred = useDeferredValue(data);
  const html = useMemo(() => generateDocHTML(deferred), [deferred]);
  return (
    <iframe
      srcDoc={html}
      title={title}
      className="w-full h-full bg-white border-0"
      sandbox=""
    />
  );
}
