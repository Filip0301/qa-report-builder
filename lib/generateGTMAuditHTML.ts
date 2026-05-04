import { GTMAuditData, GTMTag, GTMTrigger, GTMVariable } from './types';

function esc(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function richHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/\son\w+\s*=/gi,' data-removed=');
}

function tagStatusBadge(status: GTMTag['status']): string {
  const map = { active:['Activo','badge-active'], paused:['Pausado','badge-paused'], issues:['Con Problemas','badge-issues'] } as const;
  const [label, cls] = map[status];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function generateGTMAuditHTML(report: GTMAuditData): string {
  const activeCount = report.tags.filter(t => t.status === 'active').length;
  const pausedCount = report.tags.filter(t => t.status === 'paused').length;
  const issueCount  = report.tags.filter(t => t.status === 'issues').length;

  const tagsHtml = report.tags.map(t => `<tr>
    <td style="font-weight:700;">${esc(t.name)}</td>
    <td><code style="font-size:11px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(t.type)}</code></td>
    <td>${tagStatusBadge(t.status)}</td>
    <td style="color:#475569;">${esc(t.trigger)}</td>
    <td style="color:#dc2626;font-size:13px;">${t.issues ? richHtml(t.issues) : '<span style="color:#94a3b8;">—</span>'}</td>
  </tr>`).join('');

  const triggersHtml = report.triggers.map(t => `<tr>
    <td style="font-weight:700;">${esc(t.name)}</td>
    <td><code style="font-size:11px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(t.type)}</code></td>
    <td style="color:#475569;">${esc(t.conditions)}</td>
    <td style="color:#dc2626;font-size:13px;">${t.issues || '<span style="color:#94a3b8;">—</span>'}</td>
  </tr>`).join('');

  const variablesHtml = report.variables.map(v => `<tr>
    <td style="font-weight:700;">${esc(v.name)}</td>
    <td><code style="font-size:11px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(v.type)}</code></td>
    <td style="color:#475569;">${esc(v.value)}</td>
    <td style="color:#dc2626;font-size:13px;">${v.issues || '<span style="color:#94a3b8;">—</span>'}</td>
  </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(report.projectName)} | ${esc(report.client)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root{--accent:#059669;--surface:#fff;--surface-alt:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text-2:#475569;--text-m:#94a3b8;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#ecfdf5;color:var(--text);line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:960px;margin:40px auto;background:var(--surface);border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.07),0 20px 60px -10px rgba(0,0,0,.15);}
    .report-header{background:linear-gradient(135deg,#064e3b 0%,#047857 60%,#059669 100%);padding:48px 56px 40px;position:relative;overflow:hidden;}
    .report-header::before{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.04);}
    .header-tag{display:inline-block;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#6ee7b7;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:18px;}
    .container-id{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;background:rgba(52,211,153,.15);border:1px solid rgba(52,211,153,.3);color:#6ee7b7;font-size:13px;font-weight:600;padding:3px 12px;border-radius:100px;}
    .report-header h1{font-size:26px;font-weight:800;color:#fff;line-height:1.3;max-width:600px;position:relative;z-index:1;}
    .header-meta{display:flex;gap:24px;margin-top:24px;flex-wrap:wrap;position:relative;z-index:1;}
    .meta-item{display:flex;flex-direction:column;gap:2px;}
    .meta-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5);}
    .meta-value{font-size:14px;font-weight:600;color:#fff;}
    .stats-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:36px;}
    .stat-card{background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:16px 20px;}
    .stat-num{font-size:28px;font-weight:800;}.stat-label{font-size:12px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.04em;}
    .stat-active .stat-num{color:#059669;}.stat-paused .stat-num{color:#6b7280;}.stat-issues .stat-num{color:#dc2626;}
    .report-body{padding:48px 56px;}
    .section-title{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#064e3b;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--border);}
    .section-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;border-radius:8px;flex-shrink:0;}
    .rte-box{background:var(--surface-alt);border-left:4px solid var(--accent);border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:36px;font-size:14px;color:var(--text-2);}
    .data-table{width:100%;border-collapse:collapse;font-size:13px;margin:0 0 32px 0;}
    .data-table th{background:#ecfdf5;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text-m);padding:10px 14px;text-align:left;border-bottom:2px solid #a7f3d0;}
    .data-table td{padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;}
    .data-table tr:last-child td{border-bottom:none;}
    .badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;}
    .badge-active{background:#dcfce7;color:#15803d;}.badge-paused{background:#f1f5f9;color:#475569;}.badge-issues{background:#fee2e2;color:#991b1b;}
    .divider{border:none;border-top:1px solid var(--border);margin:36px 0;}
    .report-footer{background:var(--surface-alt);border-top:1px solid var(--border);padding:20px 56px;display:flex;align-items:center;justify-content:space-between;}
    .footer-brand{font-size:13px;font-weight:700;color:var(--text-m);}.footer-note{font-size:12px;color:var(--text-m);}
    .rte-content p,.rte-content div{margin-bottom:.4em;}.rte-content ul{list-style-type:disc;padding-left:1.4em;margin:.4em 0;}.rte-content ol{list-style-type:decimal;padding-left:1.4em;margin:.4em 0;}.rte-content li{margin-bottom:.2em;}
    @media print{@page{margin:14mm 18mm 16mm 18mm;size:A4;}html,body{margin:0!important;padding:0!important;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{width:210mm!important;max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important;}.report-header{padding:10mm 12mm 8mm!important;}.report-body{padding:8mm 12mm!important;}.data-table tr{break-inside:avoid;page-break-inside:avoid;}}
  </style>
</head>
<body>
<div class="page">
  <div class="report-header">
    <div class="header-tag">🔍 Auditoría de Contenedor GTM</div>
    <h1>${esc(report.projectName)}</h1>
    <div class="header-meta">
      <div class="meta-item"><span class="meta-label">Cliente</span><span class="meta-value">${esc(report.client)}</span></div>
      <div class="meta-item"><span class="meta-label">Container ID</span><span class="meta-value"><span class="container-id">${esc(report.containerId)}</span></span></div>
      ${report.accountId ? `<div class="meta-item"><span class="meta-label">Cuenta</span><span class="meta-value">${esc(report.accountId)}</span></div>` : ''}
      ${report.auditor ? `<div class="meta-item"><span class="meta-label">Auditor</span><span class="meta-value">${esc(report.auditor)}</span></div>` : ''}
      <div class="meta-item"><span class="meta-label">Fecha</span><span class="meta-value">${esc(report.date)}</span></div>
    </div>
  </div>
  <div class="report-body">
    <div class="stats-grid">
      <div class="stat-card stat-active"><div class="stat-num">${activeCount}</div><div class="stat-label">Tags Activos</div></div>
      <div class="stat-card stat-paused"><div class="stat-num">${pausedCount}</div><div class="stat-label">Tags Pausados</div></div>
      <div class="stat-card stat-issues"><div class="stat-num">${issueCount}</div><div class="stat-label">Con Problemas</div></div>
    </div>
    ${report.summaryText ? `<h2 class="section-title"><span class="section-num">1</span> Resumen de Hallazgos</h2><div class="rte-box rte-content">${richHtml(report.summaryText)}</div><hr class="divider"/>` : ''}
    <h2 class="section-title"><span class="section-num">2</span> Revisión de Tags</h2>
    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Estado</th><th>Trigger</th><th>Problemas</th></tr></thead>
      <tbody>${tagsHtml || `<tr><td colspan="5" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay tags registrados.</td></tr>`}</tbody>
    </table>
    <h2 class="section-title"><span class="section-num">3</span> Revisión de Triggers</h2>
    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Condiciones</th><th>Problemas</th></tr></thead>
      <tbody>${triggersHtml || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay triggers registrados.</td></tr>`}</tbody>
    </table>
    <h2 class="section-title"><span class="section-num">4</span> Revisión de Variables</h2>
    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Tipo</th><th>Valor</th><th>Problemas</th></tr></thead>
      <tbody>${variablesHtml || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay variables registradas.</td></tr>`}</tbody>
    </table>
    ${report.recommendations ? `<hr class="divider"/><h2 class="section-title"><span class="section-num">5</span> Recomendaciones</h2><div class="rte-box rte-content">${richHtml(report.recommendations)}</div>` : ''}
  </div>
  <div class="report-footer">
    <span class="footer-brand">${esc(report.footerBrand)}</span>
    <span class="footer-note">${esc(report.footerNote)}</span>
  </div>
</div>
</body></html>`;
}
