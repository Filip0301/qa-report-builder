// ── Document type discriminator ───────────────────────────────────────────────
export type DocumentType = 'qa-audit' | 'datalayer-doc' | 'tagging-plan' | 'gtm-audit';

// ── QA Audit ──────────────────────────────────────────────────────────────────
export type Severity = 'critical' | 'warning' | 'info' | 'improvement';

export interface CodeBlock { language: string; content: string; }
export interface CompareBlock { anomalyLabel: string; anomalyCode: string; correctLabel: string; correctCode: string; }

export interface Finding {
  id: string; severity: Severity; title: string; description: string;
  location?: string; codeBlock?: CodeBlock; showCompare?: boolean;
  compareBlock?: CompareBlock; image?: string; imageCaption?: string;
  impact: string; solution: string; height?: number;
}
export interface BusinessPoint { id: string; title: string; description: string; }
export interface SectionHeights { summary?: number; business?: number; }

export interface ReportData {
  docType: 'qa-audit';
  client: string; reportTitle: string; auditor: string; date: string;
  status: 'critical' | 'warning' | 'ok';
  reportStatus: 'draft' | 'final'; includeToc: boolean;
  executiveSummary: string; findings: Finding[]; businessPoints: BusinessPoint[];
  footerBrand: string; footerNote: string; sectionHeights?: SectionHeights;
}

export const defaultReport: ReportData = {
  docType: 'qa-audit', client: '',
  reportTitle: 'Auditoría Técnica – Integridad del DataLayer', auditor: '',
  date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
  status: 'critical', reportStatus: 'draft', includeToc: false,
  executiveSummary: '', findings: [], businessPoints: [],
  footerBrand: 'Havas · SCA', footerNote: 'Auditoría Técnica Interna — Uso Confidencial',
};

export const severityConfig: Record<Severity, { label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
  critical: { label: 'Crítico', emoji: '🔴', color: '#ef4444', bgColor: '#fef2f2', borderColor: '#fca5a5' },
  warning:  { label: 'Advertencia', emoji: '🟡', color: '#f59e0b', bgColor: '#fffbeb', borderColor: '#fcd34d' },
  info:     { label: 'Informativo', emoji: '🔵', color: '#3b82f6', bgColor: '#eff6ff', borderColor: '#93c5fd' },
  improvement: { label: 'Mejora', emoji: '🟣', color: '#8b5cf6', bgColor: '#f5f3ff', borderColor: '#c4b5fd' },
};

// ── DataLayer Documentation ───────────────────────────────────────────────────
export interface DLEvent {
  id: string; name: string; trigger: string; page: string;
  description: string; variables: string; codeExample: string;
}
export interface DLVariable {
  id: string; name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string; example: string;
}
export interface DLDocData {
  docType: 'datalayer-doc'; client: string; projectName: string;
  version: string; date: string; author: string;
  reportStatus: 'draft' | 'final'; includeToc: boolean;
  footerBrand: string; footerNote: string;
  overview: string; events: DLEvent[]; variables: DLVariable[];
}
export const defaultDLDoc: DLDocData = {
  docType: 'datalayer-doc', client: '', projectName: 'Documentación DataLayer',
  version: 'v1.0', date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
  author: '', reportStatus: 'draft', includeToc: false,
  footerBrand: 'Havas · SCA', footerNote: 'Documento Técnico Interno — Uso Confidencial',
  overview: '', events: [], variables: [],
};

// ── Tagging Plan ──────────────────────────────────────────────────────────────
export type TaggingItemStatus = 'pending' | 'in-progress' | 'done' | 'blocked';
export type TaggingItemPriority = 'high' | 'medium' | 'low';

export interface TaggingItem {
  id: string; event: string; description: string; trigger: string;
  page: string; variables: string; priority: TaggingItemPriority;
  status: TaggingItemStatus; notes: string;
}
export interface TaggingPlanData {
  docType: 'tagging-plan'; client: string; projectName: string;
  version: string; date: string; author: string; platform: string;
  reportStatus: 'draft' | 'final'; includeToc: boolean;
  footerBrand: string; footerNote: string;
  objective: string; scope: string; items: TaggingItem[]; acceptanceCriteria: string;
}
export const defaultTaggingPlan: TaggingPlanData = {
  docType: 'tagging-plan', client: '', projectName: 'Plan de Marcaje',
  version: 'v1.0', date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
  author: '', platform: 'GA4 + GTM', reportStatus: 'draft', includeToc: false,
  footerBrand: 'Havas · SCA', footerNote: 'Plan de Marcaje Interno — Uso Confidencial',
  objective: '', scope: '', items: [], acceptanceCriteria: '',
};

// ── GTM Audit ─────────────────────────────────────────────────────────────────
export type GTMTagStatus = 'active' | 'paused' | 'issues';

export interface GTMTag { id: string; name: string; type: string; status: GTMTagStatus; trigger: string; issues: string; }
export interface GTMTrigger { id: string; name: string; type: string; conditions: string; issues: string; }
export interface GTMVariable { id: string; name: string; type: string; value: string; issues: string; }

export interface GTMAuditData {
  docType: 'gtm-audit'; client: string; projectName: string;
  containerId: string; accountId: string; date: string; auditor: string;
  reportStatus: 'draft' | 'final';
  footerBrand: string; footerNote: string;
  summaryText: string; tags: GTMTag[]; triggers: GTMTrigger[];
  variables: GTMVariable[]; recommendations: string;
}
export const defaultGTMAudit: GTMAuditData = {
  docType: 'gtm-audit', client: '', projectName: 'Auditoría GTM',
  containerId: '', accountId: '',
  date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
  auditor: '', reportStatus: 'draft',
  footerBrand: 'Havas · SCA', footerNote: 'Auditoría GTM Interna — Uso Confidencial',
  summaryText: '', tags: [], triggers: [], variables: [], recommendations: '',
};

// ── Union ─────────────────────────────────────────────────────────────────────
export type AnyDocData = ReportData | DLDocData | TaggingPlanData | GTMAuditData;

export function getDocTitle(data: AnyDocData): string {
  if (data.docType === 'qa-audit') return data.reportTitle || 'Sin título';
  return data.projectName || 'Sin título';
}
