import { describe, expect, it } from 'vitest';
import { DOC_TYPE_LIST, generateDocHTML, normalizeDocument } from '@/lib/docTypes';
import { createDefaultGTMAudit, createDefaultReport, type Finding } from '@/lib/types';
import { syntaxHighlightJSON } from '@/lib/generateHTML';

const XSS = '<img src=x onerror=alert(1)><svg/onload=alert(2)>';

describe('generadores HTML', () => {
  it.each(DOC_TYPE_LIST.map(t => t.type))('%s genera un documento HTML completo', type => {
    const html = generateDocHTML(normalizeDocument({ docType: type, client: 'ACME' }));
    expect(html.startsWith('<!DOCTYPE html>')).toBe(true);
    expect(html).toContain('ACME');
    expect(html).toContain('</html>');
  });

  it.each(DOC_TYPE_LIST.map(t => t.type))('%s escapa los campos de texto plano', type => {
    const html = generateDocHTML(normalizeDocument({ docType: type, client: `"><script>alert(1)</script>` }));
    expect(html).not.toContain('<script>alert(1)</script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('sanitiza el texto enriquecido de los hallazgos QA', () => {
    const finding: Finding = {
      id: '1', severity: 'critical', title: 'Bug', description: `<p>ok</p>${XSS}`,
      impact: XSS, solution: '<a href="javascript:alert(1)">fix</a>',
    };
    const html = generateDocHTML({ ...createDefaultReport(), executiveSummary: XSS, findings: [finding] });
    expect(html).not.toMatch(/onerror|onload|javascript:/i);
    expect(html).toContain('<p>ok</p>');
  });

  it('descarta imágenes con src no seguro', () => {
    const finding: Finding = {
      id: '1', severity: 'info', title: 'x', description: '', impact: '', solution: '',
      image: 'x" onerror="alert(1)',
    };
    const html = generateDocHTML({ ...createDefaultReport(), findings: [finding] });
    expect(html).not.toContain('onerror');
  });

  it('sanitiza los "issues" de triggers y variables GTM', () => {
    const data = {
      ...createDefaultGTMAudit(),
      triggers: [{ id: 't', name: 'T', type: 'Click', conditions: '', issues: XSS }],
      variables: [{ id: 'v', name: 'V', type: 'DLV', value: '', issues: XSS }],
    };
    expect(generateDocHTML(data)).not.toMatch(/onerror|onload/i);
  });

  it('formatea fechas ISO y conserva fechas antiguas en texto', () => {
    expect(generateDocHTML({ ...createDefaultReport(), date: '2026-11-04' })).toContain('4 de noviembre de 2026');
    expect(generateDocHTML({ ...createDefaultReport(), date: '23 de abril de 2026' })).toContain('23 de abril de 2026');
  });
});

describe('syntaxHighlightJSON', () => {
  it('resalta claves, strings, números y booleanos', () => {
    const out = syntaxHighlightJSON('{"event": "purchase", "value": 10.5, "ok": true, "x": null}');
    expect(out).toContain('<span class="c-key">&quot;event&quot;</span>:');
    expect(out).toContain('<span class="c-str">&quot;purchase&quot;</span>');
    expect(out).toContain('<span class="c-num">10.5</span>');
    expect(out).toContain('<span class="c-bool">true</span>');
    expect(out).toContain('<span class="c-null">null</span>');
  });
  it('escapa HTML dentro del JSON', () => {
    const out = syntaxHighlightJSON('{"a": "<script>alert(1)</script>"}');
    expect(out).not.toContain('<script>');
  });
});

describe('normalizeDocument', () => {
  it('trata documentos antiguos sin docType como Auditoría QA', () => {
    const doc = normalizeDocument({ client: 'X', findings: [] });
    expect(doc.docType).toBe('qa-audit');
    expect(doc.client).toBe('X');
  });
  it('completa campos faltantes con valores por defecto', () => {
    const doc = normalizeDocument({ docType: 'gtm-audit' });
    expect(doc.docType).toBe('gtm-audit');
    if (doc.docType === 'gtm-audit') expect(doc.tags).toEqual([]);
  });
  it('crea objetos nuevos en cada llamada (sin referencias compartidas)', () => {
    const a = createDefaultReport();
    const b = createDefaultReport();
    expect(a).not.toBe(b);
    expect(a.findings).not.toBe(b.findings);
  });
});
