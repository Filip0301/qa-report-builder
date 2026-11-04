import {
  AnyDocData, DocumentType,
  createDefaultReport, createDefaultDLDoc, createDefaultTaggingPlan, createDefaultGTMAudit, createDefaultCM360Audit,
} from './types';
import { generateHTML } from './generateHTML';
import { generateDLHTML } from './generateDLHTML';
import { generateTaggingPlanHTML } from './generateTaggingPlanHTML';
import { generateGTMAuditHTML } from './generateGTMAuditHTML';
import { generateCM360AuditHTML } from './generateCM360AuditHTML';

export interface SectionInfo { id: string; label: string; icon: string; }

/** Clases de Tailwind completas (Tailwind no detecta clases interpoladas). */
export interface AccentClasses {
  tabActive: string;
  heading: string;
  badge: string;
  card: string;
}

export interface DocTypeInfo<T extends AnyDocData = AnyDocData> {
  type: T['docType'];
  label: string;
  shortLabel: string;
  icon: string;
  description: string;
  accent: AccentClasses;
  sections: SectionInfo[];
  create: () => T;
  generateHTML: (data: T) => string;
}

type Registry = { [K in DocumentType]: DocTypeInfo<Extract<AnyDocData, { docType: K }>> };

export const DOC_TYPES: Registry = {
  'qa-audit': {
    type: 'qa-audit',
    label: 'Auditoría QA',
    shortLabel: 'QA',
    icon: '🔍',
    description: 'Documenta hallazgos, errores y mejoras encontradas durante pruebas de calidad. Incluye evidencia, impacto y soluciones.',
    accent: {
      tabActive: 'border-indigo-500 text-indigo-300 bg-indigo-900/20',
      heading: 'text-indigo-400',
      badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
      card: 'from-indigo-900/60 to-indigo-800/30 ring-indigo-500/40 hover:ring-indigo-400',
    },
    sections: [
      { id: 'meta', label: 'Datos', icon: '📋' },
      { id: 'summary', label: 'Resumen', icon: '📝' },
      { id: 'findings', label: 'Hallazgos', icon: '🔍' },
      { id: 'business', label: 'Negocio', icon: '📊' },
    ],
    create: createDefaultReport,
    generateHTML,
  },
  'datalayer-doc': {
    type: 'datalayer-doc',
    label: 'Documentación DataLayer',
    shortLabel: 'DataLayer',
    icon: '📐',
    description: 'Referencia técnica de la estructura del DataLayer: eventos disponibles, variables, tipos y ejemplos de código JSON.',
    accent: {
      tabActive: 'border-teal-500 text-teal-300 bg-teal-900/20',
      heading: 'text-teal-400',
      badge: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
      card: 'from-teal-900/60 to-teal-800/30 ring-teal-500/40 hover:ring-teal-400',
    },
    sections: [
      { id: 'meta', label: 'Metadatos', icon: '📋' },
      { id: 'events', label: 'Eventos', icon: '⚡' },
      { id: 'variables', label: 'Variables', icon: '🔤' },
    ],
    create: createDefaultDLDoc,
    generateHTML: generateDLHTML,
  },
  'tagging-plan': {
    type: 'tagging-plan',
    label: 'Plan de Marcaje',
    shortLabel: 'Plan',
    icon: '📌',
    description: 'Define los eventos a implementar antes del desarrollo: trigger, página, variables, prioridad y estado de cada marcaje.',
    accent: {
      tabActive: 'border-violet-500 text-violet-300 bg-violet-900/20',
      heading: 'text-violet-400',
      badge: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      card: 'from-violet-900/60 to-violet-800/30 ring-violet-500/40 hover:ring-violet-400',
    },
    sections: [
      { id: 'meta', label: 'Metadatos', icon: '📋' },
      { id: 'items', label: 'Plan de Eventos', icon: '📌' },
    ],
    create: createDefaultTaggingPlan,
    generateHTML: generateTaggingPlanHTML,
  },
  'gtm-audit': {
    type: 'gtm-audit',
    label: 'Auditoría GTM',
    shortLabel: 'GTM',
    icon: '🏷️',
    description: 'Revisión del contenedor de Google Tag Manager: tags activos, pausados, triggers, variables y recomendaciones.',
    accent: {
      tabActive: 'border-emerald-500 text-emerald-300 bg-emerald-900/20',
      heading: 'text-emerald-400',
      badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
      card: 'from-emerald-900/60 to-emerald-800/30 ring-emerald-500/40 hover:ring-emerald-400',
    },
    sections: [
      { id: 'meta', label: 'Metadatos', icon: '📋' },
      { id: 'tags', label: 'Tags', icon: '🏷️' },
      { id: 'triggers', label: 'Triggers', icon: '⚡' },
      { id: 'variables', label: 'Variables', icon: '🔤' },
    ],
    create: createDefaultGTMAudit,
    generateHTML: generateGTMAuditHTML,
  },
  'cm360-audit': {
    type: 'cm360-audit',
    label: 'Auditoría CM360',
    shortLabel: 'CM360',
    icon: '🎯',
    description: 'Documenta el estado de los floodlights por anunciante, marcaje en GTM y propuestas de implementación en Campaign Manager 360.',
    accent: {
      tabActive: 'border-cyan-500 text-cyan-300 bg-cyan-900/20',
      heading: 'text-cyan-400',
      badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
      card: 'from-cyan-900/60 to-cyan-800/30 ring-cyan-500/40 hover:ring-cyan-400',
    },
    sections: [
      { id: 'meta', label: 'Metadatos', icon: '📋' },
      { id: 'floodlights', label: 'Floodlights', icon: '🎯' },
      { id: 'variables', label: 'Variables', icon: '🔤' },
      { id: 'triggers', label: 'Triggers', icon: '⚡' },
      { id: 'tags', label: 'Tags', icon: '🏷️' },
      { id: 'proposals', label: 'Propuestas', icon: '💡' },
    ],
    create: createDefaultCM360Audit,
    generateHTML: generateCM360AuditHTML,
  },
};

export const DOC_TYPE_LIST = Object.values(DOC_TYPES) as DocTypeInfo[];

export function isDocumentType(value: unknown): value is DocumentType {
  return typeof value === 'string' && value in DOC_TYPES;
}

export function getDocType(type: DocumentType | null | undefined): DocTypeInfo {
  return (DOC_TYPES[type ?? 'qa-audit'] ?? DOC_TYPES['qa-audit']) as unknown as DocTypeInfo;
}

/** Genera el HTML exportable de cualquier documento. */
export function generateDocHTML(data: AnyDocData): string {
  return getDocType(data.docType).generateHTML(data);
}

/**
 * Normaliza un documento cargado desde la base: documentos antiguos sin `docType`
 * se tratan como Auditoría QA, y los campos faltantes se completan con valores por defecto.
 */
export function normalizeDocument(raw: unknown): AnyDocData {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const type = isDocumentType(obj.docType) ? obj.docType : 'qa-audit';
  const defaults = DOC_TYPES[type].create() as unknown as Record<string, unknown>;
  return { ...defaults, ...obj, docType: type } as AnyDocData;
}
