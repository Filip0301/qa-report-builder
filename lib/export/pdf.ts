import { downloadBlob } from './download';

interface Html2PdfWorker {
  set: (opts: Record<string, unknown>) => Html2PdfWorker;
  from: (el: HTMLElement) => Html2PdfWorker;
  outputPdf: (type: 'blob') => Promise<Blob>;
}
type Html2PdfWindow = Window & { html2pdf?: () => Html2PdfWorker };

const PDF_CSS = `<style>
  body{background:#fff!important;margin:0!important;padding:0!important;}
  .page{margin:0!important;max-width:100%!important;border-radius:0!important;box-shadow:none!important;}
</style>`;

const LOAD_TIMEOUT_MS = 20_000;

/**
 * Genera un PDF a partir del HTML exportable y lo descarga.
 * El documento se renderiza en un iframe oculto para que sus estilos no afecten a la app;
 * html2pdf se sirve desde /vendor (copiado del paquete npm), sin depender de un CDN.
 */
export async function exportPdf(html: string, filename: string): Promise<void> {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('aria-hidden', 'true');
  iframe.tabIndex = -1;
  iframe.style.cssText = 'position:fixed;left:-10000px;top:0;width:1000px;height:1000px;border:0;visibility:hidden;';

  const withLoader = html.includes('</head>')
    ? html.replace('</head>', `${PDF_CSS}<script src="/vendor/html2pdf.bundle.min.js"></script></head>`)
    : `${PDF_CSS}<script src="/vendor/html2pdf.bundle.min.js"></script>${html}`;

  try {
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('El generador de PDF tardó demasiado en cargar.')), LOAD_TIMEOUT_MS);
      iframe.onload = () => {
        clearTimeout(timer);
        resolve();
      };
      iframe.onerror = () => {
        clearTimeout(timer);
        reject(new Error('No se pudo preparar el documento.'));
      };
      iframe.srcdoc = withLoader;
      document.body.appendChild(iframe);
    });

    const win = iframe.contentWindow as Html2PdfWindow | null;
    if (!win?.html2pdf) throw new Error('No se pudo cargar el generador de PDF.');
    await win.document.fonts?.ready;

    const blob = await win
      .html2pdf()
      .set({
        margin: 0,
        filename,
        image: { type: 'jpeg', quality: 0.95 },
        html2canvas: { scale: 2, useCORS: true, windowWidth: 1000 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'avoid-all'] },
      })
      .from(win.document.body)
      .outputPdf('blob');

    // El blob se creó en el contexto del iframe: se copia al contexto principal.
    const copy = new Blob([await blob.arrayBuffer()], { type: 'application/pdf' });
    downloadBlob(copy, filename);
  } finally {
    iframe.remove();
  }
}
