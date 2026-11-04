import { describe, expect, it } from 'vitest';
import { saveReportSchema, reportIdSchema } from '@/lib/api/schema';
import { validateDocument } from '@/lib/validation';
import { createDefaultReport, createDefaultDLDoc } from '@/lib/types';
import { formatDocDate, isIsoDate, todayIso } from '@/lib/dates';
import { exportFilename, slugify } from '@/lib/export/download';
import { safeNextPath } from '@/lib/auth/redirect';
import { buildSavePayload } from '@/lib/sync/api';

describe('saveReportSchema', () => {
  const valid = () => buildSavePayload({ ...createDefaultReport(), client: 'ACME' });

  it('acepta un documento válido', () => {
    expect(saveReportSchema.safeParse(valid()).success).toBe(true);
  });
  it('rechaza tipos de documento desconocidos', () => {
    expect(saveReportSchema.safeParse({ ...valid(), docType: 'otro' }).success).toBe(false);
  });
  it('rechaza si docType no coincide con el contenido', () => {
    expect(saveReportSchema.safeParse({ ...valid(), docType: 'gtm-audit' }).success).toBe(false);
  });
  it('rechaza estados inválidos', () => {
    expect(saveReportSchema.safeParse({ ...valid(), reportStatus: 'publicado' }).success).toBe(false);
  });
  it('valida ids UUID', () => {
    expect(reportIdSchema.safeParse('8b1d7c1e-5f0a-4a9e-9c53-2a1f3d4b5c6d').success).toBe(true);
    expect(reportIdSchema.safeParse('1; drop table reports').success).toBe(false);
  });
});

describe('buildSavePayload', () => {
  it('usa "Sin título" si el título está vacío', () => {
    expect(buildSavePayload({ ...createDefaultDLDoc(), projectName: '  ' }).title).toBe('Sin título');
  });
});

describe('validateDocument', () => {
  it('advierte campos obligatorios vacíos y apunta a su sección', () => {
    const issues = validateDocument(createDefaultReport());
    expect(issues.some(i => i.message.includes('cliente') && i.section === 'meta')).toBe(true);
    expect(issues.some(i => i.section === 'findings' && i.type === 'warning')).toBe(true);
  });
  it('detecta hallazgos sin título', () => {
    const data = { ...createDefaultReport(), findings: [{ id: '1', severity: 'info' as const, title: '', description: '', impact: '', solution: '' }] };
    expect(validateDocument(data).some(i => i.message.includes('#1'))).toBe(true);
  });
});

describe('fechas', () => {
  it('todayIso produce YYYY-MM-DD', () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(isIsoDate(todayIso())).toBe(true);
  });
  it('formatDocDate formatea en español sin desfase de zona horaria', () => {
    expect(formatDocDate('2026-01-01')).toBe('1 de enero de 2026');
    expect(formatDocDate('texto libre')).toBe('texto libre');
    expect(formatDocDate('')).toBe('');
  });
});

describe('nombres de archivo', () => {
  it('slugify quita tildes y caracteres especiales', () => {
    expect(slugify("O'Higgins Ñuñoa S.A.")).toBe('O-Higgins-Nunoa-S-A');
  });
  it('exportFilename incluye tipo, cliente y fecha', () => {
    expect(exportFilename({ ...createDefaultReport(), client: 'Falabella' }, 'pdf')).toMatch(/^QA_Falabella_\d{4}-\d{2}-\d{2}\.pdf$/);
    expect(exportFilename(createDefaultReport(), 'html')).toMatch(/^QA_documento_/);
  });
});

describe('safeNextPath', () => {
  it('solo permite rutas internas', () => {
    expect(safeNextPath('/?doc=1')).toBe('/?doc=1');
    expect(safeNextPath('https://evil.test')).toBe('/');
    expect(safeNextPath('//evil.test')).toBe('/');
    expect(safeNextPath('/\\evil.test')).toBe('/');
    expect(safeNextPath(null)).toBe('/');
  });
});
