import type { AnyDocData } from './types';
import { isRichTextEmpty } from './html';

export interface ValidationItem {
  type: 'warning' | 'info';
  message: string;
  /** Sección del editor donde se corrige (para navegar desde el aviso). */
  section?: string;
}

const blank = (v: string | null | undefined) => !v || !v.trim();

/** Revisa que el documento esté completo antes de exportarlo. */
export function validateDocument(data: AnyDocData): ValidationItem[] {
  const issues: ValidationItem[] = [];
  const warn = (message: string, section = 'meta') => issues.push({ type: 'warning', message, section });
  const info = (message: string, section = 'meta') => issues.push({ type: 'info', message, section });

  if (blank(data.client)) warn('Falta el nombre del cliente.');

  switch (data.docType) {
    case 'qa-audit':
      if (blank(data.reportTitle)) warn('Falta el título del informe.');
      if (blank(data.auditor)) warn('Falta el nombre del auditor.');
      if (isRichTextEmpty(data.executiveSummary)) warn('El resumen ejecutivo está vacío.', 'summary');
      if (data.findings.length === 0) warn('No hay hallazgos registrados.', 'findings');
      data.findings.forEach((f, i) => {
        if (blank(f.title)) warn(`El hallazgo #${i + 1} no tiene título.`, 'findings');
      });
      if (data.businessPoints.length === 0) info('La sección de Negocio está vacía (opcional).', 'business');
      break;
    case 'datalayer-doc':
      if (blank(data.projectName)) warn('Falta el nombre del proyecto.');
      if (data.events.length === 0) warn('No hay eventos documentados.', 'events');
      if (data.variables.length === 0) info('El diccionario de variables está vacío (opcional).', 'variables');
      break;
    case 'tagging-plan':
      if (blank(data.projectName)) warn('Falta el nombre del proyecto.');
      if (data.items.length === 0) warn('No hay eventos en el plan de marcaje.', 'items');
      if (isRichTextEmpty(data.objective)) info('El objetivo del plan está vacío (opcional).');
      break;
    case 'gtm-audit':
      if (blank(data.containerId)) warn('Falta el Container ID (GTM-XXXXX).');
      if (data.tags.length === 0) warn('No hay tags registrados en la auditoría.', 'tags');
      if (data.triggers.length === 0) info('No hay triggers registrados (opcional).', 'triggers');
      if (data.variables.length === 0) info('No hay variables registradas (opcional).', 'variables');
      break;
    case 'cm360-audit':
      if (blank(data.advertiserId)) warn('Falta el ID del Advertiser.');
      if (data.floodlights.length === 0) info('No hay floodlights documentados (opcional).', 'floodlights');
      break;
  }

  if (data.reportStatus === 'draft') info('El documento está marcado como Borrador.');
  return issues;
}
