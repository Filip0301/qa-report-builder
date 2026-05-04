import { DLDocData, DLEvent } from './types';

function esc(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function richHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/\son\w+\s*=/gi,' data-removed=');
}

function renderEvent(e: DLEvent, i: number): string {
  const vars = e.variables ? e.variables.split(',').map(v => `<span class="var-badge">${esc(v.trim())}</span>`).join(' ') : '';
  const codeBlock = e.codeExample ? `
    <div class="code-wrap">
      <div class="code-label"><span class="code-dot r"></span><span class="code-dot y"></span><span class="code-dot g"></span><span class="code-lang">JSON · DataLayer Event</span></div>
      <pre>${esc(e.codeExample)}</pre>
    </div>` : '';
  return `
  <div class="event-card" id="event-${i}">
    <div class="event-header">
      <span class="event-num">${String(i+1).padStart(2,'0')}</span>
      <code class="event-name">${esc(e.name)}</code>
      <span class="event-trigger">Trigger: ${esc(e.trigger)}</span>
      <span class="event-page">📍 ${esc(e.page)}</span>
    </div>
    <div class="event-body">
      ${e.description ? `<div class="event-desc rte-content">${richHtml(e.description)}</div>` : ''}
      ${vars ? `<div class="vars-row"><span class="vars-label">Variables:</span>${vars}</div>` : ''}
      ${codeBlock}
    </div>
  </div>`;
}

export function generateDLHTML(report: DLDocData): string {
  const eventsHtml = report.events.map(renderEvent).join('\n');
  const tocHtml = report.includeToc && report.events.length > 0 ? `
    <nav class="toc">
      <div class="toc-title">📑 Tabla de Contenidos</div>
      <ol class="toc-list">
        <li class="toc-section"><a href="#section-overview">Descripción General</a></li>
        <li class="toc-section"><a href="#section-events">Eventos del DataLayer</a>
          <ol class="toc-findings">${report.events.map((e,i)=>`<li><a href="#event-${i}"><code>${esc(e.name)}</code></a></li>`).join('')}</ol>
        </li>
        ${report.variables.length > 0 ? `<li class="toc-section"><a href="#section-vars">Diccionario de Variables</a></li>` : ''}
      </ol>
    </nav><hr class="divider" style="margin:0 0 36px 0;"/>` : '';

  const varsHtml = report.variables.length > 0 ? `
    <hr class="divider"/>
    <h2 id="section-vars" class="section-title"><span class="section-num">3</span> Diccionario de Variables</h2>
    <table class="data-table">
      <thead><tr><th>Variable</th><th>Tipo</th><th>Descripción</th><th>Ejemplo</th></tr></thead>
      <tbody>
        ${report.variables.map(v=>`<tr>
          <td><code class="var-code">${esc(v.name)}</code></td>
          <td><span class="type-badge type-${v.type}">${v.type}</span></td>
          <td>${esc(v.description)}</td>
          <td><code>${esc(v.example)}</code></td>
        </tr>`).join('')}
      </tbody>
    </table>` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(report.projectName)} | ${esc(report.client)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root { --accent:#0891b2; --accent-lt:#22d3ee; --surface:#fff; --surface-alt:#f8fafc; --border:#e2e8f0; --text:#0f172a; --text-2:#475569; --text-m:#94a3b8; }
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#f0f9ff;color:var(--text);line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:900px;margin:40px auto;background:var(--surface);border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.07),0 20px 60px -10px rgba(0,0,0,.15);}
    .report-header{background:linear-gradient(135deg,#0c4a6e 0%,#0369a1 60%,#0891b2 100%);padding:48px 56px 40px;position:relative;overflow:hidden;}
    .report-header::before{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.04);}
    .header-tag{display:inline-block;background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.3);color:#67e8f9;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:18px;}
    .report-header h1{font-size:26px;font-weight:800;color:#fff;line-height:1.3;max-width:600px;position:relative;z-index:1;}
    .header-meta{display:flex;gap:24px;margin-top:24px;flex-wrap:wrap;position:relative;z-index:1;}
    .meta-item{display:flex;flex-direction:column;gap:2px;}
    .meta-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5);}
    .meta-value{font-size:14px;font-weight:600;color:#fff;}
    .version-badge{display:inline-flex;align-items:center;gap:6px;background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.3);color:#67e8f9;font-size:12px;font-weight:700;padding:3px 12px;border-radius:100px;}
    .report-body{padding:48px 56px;}
    .section-title{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#0c4a6e;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--border);}
    .section-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;border-radius:8px;flex-shrink:0;}
    .overview-box{background:var(--surface-alt);border-left:4px solid var(--accent);border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:40px;font-size:14.5px;color:var(--text-2);}
    .event-card{border:1px solid var(--border);border-radius:12px;margin-bottom:24px;overflow:hidden;}
    .event-header{display:flex;align-items:center;gap:12px;padding:14px 20px;background:var(--surface-alt);border-bottom:1px solid var(--border);flex-wrap:wrap;}
    .event-num{font-size:11px;font-weight:700;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:6px;}
    .event-name{font-family:'JetBrains Mono',monospace;font-size:14px;font-weight:600;color:var(--accent);background:rgba(8,145,178,.08);padding:3px 10px;border-radius:6px;}
    .event-trigger{font-size:12px;color:var(--text-m);}
    .event-page{font-size:12px;color:var(--text-2);margin-left:auto;}
    .event-body{padding:20px;}
    .event-desc{font-size:13.5px;color:var(--text-2);margin-bottom:12px;}
    .vars-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:12px;}
    .vars-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--text-m);}
    .var-badge{font-family:'JetBrains Mono',monospace;font-size:11px;background:#e0f2fe;color:#0369a1;padding:2px 8px;border-radius:4px;font-weight:600;}
    .code-wrap{background:#0f172a;border-radius:10px;overflow:hidden;margin:12px 0;}
    .code-label{display:flex;align-items:center;gap:8px;padding:8px 14px;background:rgba(255,255,255,.04);border-bottom:1px solid rgba(255,255,255,.07);}
    .code-dot{width:10px;height:10px;border-radius:50%;}.code-dot.r{background:#ef4444;}.code-dot.y{background:#f59e0b;}.code-dot.g{background:#22c55e;}
    .code-lang{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.35);margin-left:auto;}
    pre{padding:16px 20px;overflow-x:auto;font-family:'JetBrains Mono',monospace;font-size:12.5px;line-height:1.65;color:#e2e8f0;white-space:pre-wrap;word-wrap:break-word;}
    code{font-family:'JetBrains Mono',monospace;font-size:12px;background:rgba(0,0,0,.06);padding:1px 5px;border-radius:4px;}
    .var-code{color:var(--accent);background:rgba(8,145,178,.08);}
    .data-table{width:100%;border-collapse:collapse;font-size:13.5px;margin:16px 0;}
    .data-table th{background:var(--surface-alt);font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text-m);padding:10px 14px;text-align:left;border-bottom:2px solid var(--border);}
    .data-table td{padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;}
    .data-table tr:last-child td{border-bottom:none;}
    .type-badge{display:inline-block;font-size:11px;font-weight:700;padding:2px 8px;border-radius:4px;}
    .type-string{background:#dcfce7;color:#15803d;}.type-number{background:#fef3c7;color:#92400e;}
    .type-boolean{background:#ede9fe;color:#5b21b6;}.type-array{background:#e0f2fe;color:#075985;}
    .type-object{background:#fce7f3;color:#9d174d;}
    .divider{border:none;border-top:1px solid var(--border);margin:36px 0;}
    .report-footer{background:var(--surface-alt);border-top:1px solid var(--border);padding:20px 56px;display:flex;align-items:center;justify-content:space-between;}
    .footer-brand{font-size:13px;font-weight:700;color:var(--text-m);}.footer-note{font-size:12px;color:var(--text-m);}
    .toc{background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:24px 28px;margin-bottom:36px;}
    .toc-title{font-size:13px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:var(--accent);margin-bottom:16px;}
    .toc-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:8px;}
    .toc-section>a{font-size:14px;font-weight:700;color:var(--text);text-decoration:none;}
    .toc-findings{list-style:none;padding:6px 0 2px 16px;margin:4px 0 0 0;display:flex;flex-direction:column;gap:4px;border-left:2px solid var(--border);}
    .toc-findings li a{font-size:13px;color:var(--text-2);text-decoration:none;}
    .rte-content p,.rte-content div{margin-bottom:.4em;min-height:1em;}
    .rte-content ul{list-style-type:disc;padding-left:1.4em;margin:.4em 0;}
    .rte-content ol{list-style-type:decimal;padding-left:1.4em;margin:.4em 0;}
    .rte-content li{margin-bottom:.2em;}
    @media print{@page{margin:14mm 18mm 16mm 18mm;size:A4;}html,body{margin:0!important;padding:0!important;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{width:210mm!important;max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important;}.report-header{padding:10mm 12mm 8mm!important;}.report-body{padding:8mm 12mm!important;}.report-footer{padding:5mm 12mm!important;}.event-card,.data-table tr{break-inside:avoid;page-break-inside:avoid;}}
  </style>
</head>
<body>
<div class="page">
  <div class="report-header">
    <div class="header-tag">📐 Documentación DataLayer</div>
    <h1>${esc(report.projectName)}</h1>
    <div class="header-meta">
      <div class="meta-item"><span class="meta-label">Cliente</span><span class="meta-value">${esc(report.client)}</span></div>
      ${report.author ? `<div class="meta-item"><span class="meta-label">Autor</span><span class="meta-value">${esc(report.author)}</span></div>` : ''}
      <div class="meta-item"><span class="meta-label">Fecha</span><span class="meta-value">${esc(report.date)}</span></div>
      <div class="meta-item"><span class="meta-label">Versión</span><span class="meta-value"><span class="version-badge">${esc(report.version)}</span></span></div>
    </div>
  </div>
  <div class="report-body">
    ${tocHtml}
    <h2 id="section-overview" class="section-title"><span class="section-num">1</span> Descripción General</h2>
    <div class="overview-box rte-content">${richHtml(report.overview) || '<em style="color:#94a3b8;">Sin descripción.</em>'}</div>
    <hr class="divider"/>
    <h2 id="section-events" class="section-title"><span class="section-num">2</span> Eventos del DataLayer</h2>
    ${eventsHtml || '<p style="color:#94a3b8;font-style:italic;">No se han registrado eventos.</p>'}
    ${varsHtml}
  </div>
  <div class="report-footer">
    <span class="footer-brand">${esc(report.footerBrand)}</span>
    <span class="footer-note">${esc(report.footerNote)}</span>
  </div>
</div>
</body></html>`;
}
