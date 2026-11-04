import { describe, expect, it } from 'vitest';
import { escapeHtml, isRichTextEmpty, isSafeImageSrc, safeImageSrc, sanitizeRichHtml, stripHtml } from '@/lib/html';

describe('escapeHtml', () => {
  it('escapa caracteres especiales', () => {
    expect(escapeHtml(`<b>"O'Higgins" & co</b>`)).toBe('&lt;b&gt;&quot;O&#39;Higgins&quot; &amp; co&lt;/b&gt;');
  });
  it('tolera null/undefined', () => {
    expect(escapeHtml(null)).toBe('');
    expect(escapeHtml(undefined)).toBe('');
  });
});

describe('sanitizeRichHtml', () => {
  const vectors = [
    '<svg/onload=alert(1)>',
    '<img src=x onerror=alert(1)>',
    '<a href="javascript:alert(1)">x</a>',
    '<script>alert(1)</script>',
    '<iframe src="https://evil.test"></iframe>',
    '<div onclick="alert(1)">x</div>',
    '<style>body{display:none}</style>',
    '<math><mi xlink:href="javascript:alert(1)">x</mi></math>',
  ];

  it.each(vectors)('neutraliza %s', input => {
    const out = sanitizeRichHtml(input).toLowerCase();
    expect(out).not.toMatch(/<script|<svg|<iframe|<style|<img|<math|onerror|onload|onclick|javascript:/);
  });

  it('conserva el formato del editor', () => {
    const html = '<p><strong>Hola</strong> <em>mundo</em></p><ul><li>uno</li></ul><span style="color: rgb(239, 68, 68); background-color: #fef08a">rojo</span>';
    const out = sanitizeRichHtml(html);
    expect(out).toContain('<strong>Hola</strong>');
    expect(out).toContain('<li>uno</li>');
    expect(out).toContain('color: rgb(239, 68, 68)');
    expect(out).toContain('background-color: #fef08a');
  });

  it('elimina estilos peligrosos o no permitidos', () => {
    const out = sanitizeRichHtml('<span style="position:fixed; background-image:url(https://x.test/a.png); color:red">x</span>');
    expect(out).not.toContain('position');
    expect(out).not.toContain('url(');
    expect(out).toContain('color:red');
  });

  it('fuerza target _blank seguro en enlaces', () => {
    const out = sanitizeRichHtml('<a href="https://example.com">x</a>');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain('target="_blank"');
  });

  it('devuelve cadena vacía para entradas vacías', () => {
    expect(sanitizeRichHtml('')).toBe('');
    expect(sanitizeRichHtml(null)).toBe('');
  });
});

describe('stripHtml / isRichTextEmpty', () => {
  it('detecta contenido vacío del editor', () => {
    expect(isRichTextEmpty('<p><br></p>')).toBe(true);
    expect(isRichTextEmpty('<p>&nbsp;</p>')).toBe(true);
    expect(isRichTextEmpty('<p>Texto</p>')).toBe(false);
    expect(stripHtml('<p>a</p><p>b</p>')).toBe('a b');
  });
});

describe('isSafeImageSrc', () => {
  it('acepta data-URLs de imagen y https', () => {
    expect(isSafeImageSrc('data:image/png;base64,iVBORw0KGgo=')).toBe(true);
    expect(isSafeImageSrc('data:image/jpeg;base64,/9j/4AAQ')).toBe(true);
    expect(isSafeImageSrc('https://example.com/a.png')).toBe(true);
  });
  it('rechaza otros esquemas o inyecciones', () => {
    expect(isSafeImageSrc('javascript:alert(1)')).toBe(false);
    expect(isSafeImageSrc('data:text/html;base64,PHNjcmlwdD4=')).toBe(false);
    expect(isSafeImageSrc('data:image/png;base64,AAA" onerror="alert(1)')).toBe(false);
    expect(safeImageSrc('x" onerror="y')).toBe('');
  });
});
