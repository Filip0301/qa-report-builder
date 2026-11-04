import DOMPurify, { type Config } from 'dompurify';

/** Escapa texto plano para insertarlo en HTML (contenido o atributos). */
export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Quita etiquetas HTML (para validaciones como "¿está vacío?"). */
export function stripHtml(html: string | null | undefined): string {
  return String(html ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Solo se aceptan imágenes embebidas (data:image/…) o URLs https. */
export function isSafeImageSrc(src: string | null | undefined): src is string {
  if (!src) return false;
  return /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[a-z0-9+/=\s]+$/i.test(src) || /^https:\/\//i.test(src);
}

/** Versión escapada para insertar en un atributo HTML. */
export function safeImageSrc(src: string | null | undefined): string {
  return isSafeImageSrc(src) ? escapeHtml(src) : '';
}

export function isRichTextEmpty(html: string | null | undefined): boolean {
  return stripHtml(html) === '';
}

const ALLOWED_STYLE_PROPS = new Set(['color', 'background-color', 'text-decoration', 'font-weight', 'font-style', 'text-align']);

const PURIFY_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p', 'div', 'br', 'span', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'del', 'mark',
    'sub', 'sup', 'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'a', 'font', 'h1', 'h2', 'h3', 'h4', 'hr',
  ],
  ALLOWED_ATTR: ['style', 'href', 'target', 'rel', 'color'],
  ALLOW_DATA_ATTR: false,
};

let hooksInstalled = false;

function installHooks() {
  if (hooksInstalled) return;
  hooksInstalled = true;

  // Solo se conservan propiedades CSS de formato de texto (colores, negrita, etc.).
  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName !== 'style') return;
    const kept = data.attrValue
      .split(';')
      .map(rule => rule.trim())
      .filter(rule => {
        const [prop, ...rest] = rule.split(':');
        const value = rest.join(':').toLowerCase();
        return ALLOWED_STYLE_PROPS.has(prop?.trim().toLowerCase() ?? '') && !/url\(|expression\(|javascript:/.test(value);
      });
    data.attrValue = kept.join('; ');
    if (!data.attrValue) data.keepAttr = false;
  });

  // Los enlaces se abren en otra pestaña y sin acceso a window.opener.
  DOMPurify.addHook('afterSanitizeAttributes', node => {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

/**
 * Sanitiza HTML producido por el editor de texto enriquecido (o pegado desde otras
 * fuentes). Usa una lista blanca de etiquetas, atributos y estilos.
 * Fuera del navegador (SSR) devuelve solo el texto, escapado.
 */
export function sanitizeRichHtml(html: string | null | undefined): string {
  if (!html) return '';
  if (typeof window === 'undefined' || !DOMPurify.isSupported) {
    return escapeHtml(stripHtml(html));
  }
  installHooks();
  return DOMPurify.sanitize(html, PURIFY_CONFIG) as string;
}
