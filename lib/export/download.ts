import type { AnyDocData } from '@/lib/types';
import { getDocType } from '@/lib/docTypes';
import { todayIso } from '@/lib/dates';

/** "Falabella S.A." → "Falabella-SA" (sin tildes ni caracteres especiales). */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export function exportFilename(data: AnyDocData, ext: 'pdf' | 'html'): string {
  const type = slugify(getDocType(data.docType).shortLabel);
  const client = slugify(data.client || '') || 'documento';
  return `${type}_${client}_${todayIso()}.${ext}`;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
