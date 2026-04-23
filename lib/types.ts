export type Severity = 'critical' | 'warning' | 'info' | 'improvement';

export interface CodeBlock {
  language: string;
  content: string;
}

export interface CompareBlock {
  anomalyLabel: string;
  anomalyCode: string;
  correctLabel: string;
  correctCode: string;
}

export interface Finding {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  location?: string;
  codeBlock?: CodeBlock;
  showCompare?: boolean;
  compareBlock?: CompareBlock;
  image?: string; // base64 data URL
  imageCaption?: string;
  impact: string;
  solution: string;
}

export interface BusinessPoint {
  id: string;
  title: string;
  description: string;
}

export interface ReportData {
  client: string;
  reportTitle: string;
  auditor: string;
  date: string;
  status: 'critical' | 'warning' | 'ok';
  executiveSummary: string;
  findings: Finding[];
  businessPoints: BusinessPoint[];
  footerBrand: string;
  footerNote: string;
}

export const defaultReport: ReportData = {
  client: '',
  reportTitle: 'Auditoría Técnica – Integridad del DataLayer',
  auditor: '',
  date: new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' }),
  status: 'critical',
  executiveSummary: '',
  findings: [],
  businessPoints: [],
  footerBrand: 'Havas · SCA',
  footerNote: 'Auditoría Técnica Interna — Uso Confidencial',
};

export const severityConfig: Record<Severity, { label: string; emoji: string; color: string; bgColor: string; borderColor: string }> = {
  critical: {
    label: 'Crítico',
    emoji: '🔴',
    color: '#ef4444',
    bgColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  warning: {
    label: 'Advertencia',
    emoji: '🟡',
    color: '#f59e0b',
    bgColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  info: {
    label: 'Informativo',
    emoji: '🔵',
    color: '#3b82f6',
    bgColor: '#eff6ff',
    borderColor: '#93c5fd',
  },
  improvement: {
    label: 'Mejora',
    emoji: '🟣',
    color: '#8b5cf6',
    bgColor: '#f5f3ff',
    borderColor: '#c4b5fd',
  },
};
