import { TaggingPlanData, TaggingItem, TaggingItemStatus, TaggingItemPriority } from './types';

function esc(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function richHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<script[\s\S]*?<\/script>/gi,'').replace(/<style[\s\S]*?<\/style>/gi,'').replace(/\son\w+\s*=/gi,' data-removed=');
}

const statusLabel: Record<TaggingItemStatus, string> = { pending:'Pendiente', 'in-progress':'En Progreso', done:'Listo', blocked:'Bloqueado' };
const priorityLabel: Record<TaggingItemPriority, string> = { high:'Alta', medium:'Media', low:'Baja' };

function renderItemRow(item: TaggingItem, i: number): string {
  return `<tr>
    <td style="font-weight:700;color:#1e293b;">${esc(item.event)}</td>
    <td style="color:#475569;">${esc(item.trigger)}</td>
    <td style="color:#475569;">${esc(item.page)}</td>
    <td><code style="font-size:11px;background:rgba(0,0,0,.05);padding:1px 4px;border-radius:3px;">${esc(item.variables)}</code></td>
    <td><span class="priority-badge priority-${item.priority}">${priorityLabel[item.priority]}</span></td>
    <td><span class="status-badge status-${item.status}">${statusLabel[item.status]}</span></td>
  </tr>`;
}

export function generateTaggingPlanHTML(report: TaggingPlanData): string {
  const done = report.items.filter(i => i.status === 'done').length;
  const pending = report.items.filter(i => i.status === 'pending').length;
  const inProgress = report.items.filter(i => i.status === 'in-progress').length;
  const blocked = report.items.filter(i => i.status === 'blocked').length;

  const rowsHtml = report.items.map(renderItemRow).join('\n');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(report.projectName)} | ${esc(report.client)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root{--accent:#7c3aed;--accent-lt:#a78bfa;--surface:#fff;--surface-alt:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text-2:#475569;--text-m:#94a3b8;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#f5f3ff;color:var(--text);line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:960px;margin:40px auto;background:var(--surface);border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.07),0 20px 60px -10px rgba(0,0,0,.15);}
    .report-header{background:linear-gradient(135deg,#3b0764 0%,#6d28d9 60%,#7c3aed 100%);padding:48px 56px 40px;position:relative;overflow:hidden;}
    .report-header::before{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.04);}
    .header-tag{display:inline-block;background:rgba(167,139,250,.2);border:1px solid rgba(167,139,250,.4);color:#c4b5fd;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:18px;}
    .report-header h1{font-size:26px;font-weight:800;color:#fff;line-height:1.3;max-width:600px;position:relative;z-index:1;}
    .header-meta{display:flex;gap:24px;margin-top:24px;flex-wrap:wrap;position:relative;z-index:1;}
    .meta-item{display:flex;flex-direction:column;gap:2px;}
    .meta-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5);}
    .meta-value{font-size:14px;font-weight:600;color:#fff;}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px;}
    .stat-card{background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:16px 20px;}
    .stat-num{font-size:28px;font-weight:800;color:var(--text);}.stat-label{font-size:12px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.04em;}
    .stat-done .stat-num{color:#059669;}.stat-progress .stat-num{color:#7c3aed;}.stat-blocked .stat-num{color:#dc2626;}
    .report-body{padding:48px 56px;}
    .section-title{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#3b0764;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--border);}
    .section-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;border-radius:8px;flex-shrink:0;}
    .rte-box{background:var(--surface-alt);border-left:4px solid var(--accent);border-radius:0 12px 12px 0;padding:20px 24px;margin-bottom:32px;font-size:14px;color:var(--text-2);}
    .data-table{width:100%;border-collapse:collapse;font-size:13px;margin:0;}
    .data-table th{background:#f5f3ff;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--text-m);padding:10px 14px;text-align:left;border-bottom:2px solid #e9d5ff;}
    .data-table td{padding:12px 14px;border-bottom:1px solid #f1f5f9;vertical-align:top;}
    .data-table tr:last-child td{border-bottom:none;}
    .status-badge,.priority-badge{display:inline-block;font-size:11px;font-weight:700;padding:3px 10px;border-radius:100px;}
    .status-pending{background:#fef3c7;color:#92400e;}.status-in-progress{background:#ede9fe;color:#5b21b6;}
    .status-done{background:#dcfce7;color:#15803d;}.status-blocked{background:#fee2e2;color:#991b1b;}
    .priority-high{background:#fee2e2;color:#991b1b;}.priority-medium{background:#fef3c7;color:#92400e;}.priority-low{background:#dcfce7;color:#15803d;}
    .divider{border:none;border-top:1px solid var(--border);margin:36px 0;}
    .report-footer{background:var(--surface-alt);border-top:1px solid var(--border);padding:20px 56px;display:flex;align-items:center;justify-content:space-between;}
    .footer-brand{font-size:13px;font-weight:700;color:var(--text-m);}.footer-note{font-size:12px;color:var(--text-m);}
    .rte-content p,.rte-content div{margin-bottom:.4em;}.rte-content ul{list-style-type:disc;padding-left:1.4em;margin:.4em 0;}.rte-content ol{list-style-type:decimal;padding-left:1.4em;margin:.4em 0;}.rte-content li{margin-bottom:.2em;}
    @media print{@page{margin:14mm 18mm 16mm 18mm;size:A4;}html,body{margin:0!important;padding:0!important;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{width:210mm!important;max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important;}.report-header{padding:10mm 12mm 8mm!important;}.report-body{padding:8mm 12mm!important;}.stats-grid{grid-template-columns:repeat(4,1fr)!important;}.data-table tr{break-inside:avoid;page-break-inside:avoid;}}
  </style>
</head>
<body>
<div class="page">
  <div class="report-header">
    <div class="header-tag">📋 Plan de Marcaje</div>
    <h1>${esc(report.projectName)}</h1>
    <div class="header-meta">
      <div class="meta-item"><span class="meta-label">Cliente</span><span class="meta-value">${esc(report.client)}</span></div>
      ${report.author ? `<div class="meta-item"><span class="meta-label">Autor</span><span class="meta-value">${esc(report.author)}</span></div>` : ''}
      <div class="meta-item"><span class="meta-label">Plataforma</span><span class="meta-value">${esc(report.platform)}</span></div>
      <div class="meta-item"><span class="meta-label">Fecha</span><span class="meta-value">${esc(report.date)}</span></div>
      <div class="meta-item"><span class="meta-label">Versión</span><span class="meta-value">${esc(report.version)}</span></div>
    </div>
  </div>
  <div class="report-body">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-num">${report.items.length}</div><div class="stat-label">Total eventos</div></div>
      <div class="stat-card stat-done"><div class="stat-num">${done}</div><div class="stat-label">Listos</div></div>
      <div class="stat-card stat-progress"><div class="stat-num">${inProgress + pending}</div><div class="stat-label">Pendientes</div></div>
      <div class="stat-card stat-blocked"><div class="stat-num">${blocked}</div><div class="stat-label">Bloqueados</div></div>
    </div>
    ${report.objective ? `<h2 class="section-title"><span class="section-num">1</span> Objetivo y Alcance</h2><div class="rte-box rte-content">${richHtml(report.objective)}</div>` : ''}
    ${report.scope ? `<div class="rte-box rte-content" style="margin-top:-20px;">${richHtml(report.scope)}</div>` : ''}
    <h2 class="section-title"><span class="section-num">2</span> Plan de Eventos</h2>
    <table class="data-table">
      <thead><tr><th>Evento</th><th>Trigger</th><th>Página</th><th>Variables</th><th>Prioridad</th><th>Estado</th></tr></thead>
      <tbody>${rowsHtml || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay eventos registrados.</td></tr>`}</tbody>
    </table>
    ${report.acceptanceCriteria ? `<hr class="divider"/><h2 class="section-title"><span class="section-num">3</span> Criterios de Aceptación</h2><div class="rte-box rte-content">${richHtml(report.acceptanceCriteria)}</div>` : ''}
  </div>
  <div class="report-footer">
    <span class="footer-brand">${esc(report.footerBrand)}</span>
    <span class="footer-note">${esc(report.footerNote)}</span>
  </div>
</div>
</body></html>`;
}
