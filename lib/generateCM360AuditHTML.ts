import { CM360AuditData, CM360Floodlight, CM360Action } from './types';

function esc(s: string): string {
  return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function actionBadge(action: CM360Action): string {
  const map: Record<CM360Action, [string, string]> = {
    'Mantener': ['Mantener', 'badge-active'],
    'Modificar': ['Modificar', 'badge-warning'],
    'Eliminar': ['Eliminar', 'badge-issues'],
    'Crear': ['Crear', 'badge-info']
  };
  const [label, cls] = map[action];
  return `<span class="badge ${cls}">${label}</span>`;
}

export function generateCM360AuditHTML(report: CM360AuditData): string {
  const floodlightsCount = report.floodlights.length;
  const variablesCount = report.variables.length;
  const tagsCount = report.tags.length;
  const proposalsCount = report.taggingProposals.length;

  const floodlightsHtml = report.floodlights.map(f => `<tr>
    <td style="font-weight:700;font-size:11px;">${esc(f.name)}</td>
    <td><code style="font-size:10px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(f.cm360Id)}</code></td>
    <td style="color:#475569;font-size:11px;">${esc(f.impressionsLast7Days)}</td>
    <td>${actionBadge(f.action)}</td>
    <td style="color:#475569;font-size:11px;">${esc(f.actionJustification)}</td>
    <td style="color:#059669;font-size:11px;">${esc(f.newSourceOfTruth)}</td>
  </tr>`).join('');

  const variablesHtml = report.variables.map(v => `<tr>
    <td style="font-weight:700;font-size:11px;">${esc(v.name)}</td>
    <td><code style="font-size:10px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(v.type)}</code></td>
    <td style="color:#475569;font-size:11px;word-break:break-all;">${esc(v.logic)}</td>
    <td style="color:#475569;font-size:11px;">${esc(v.purpose)}</td>
  </tr>`).join('');

  const triggersHtml = report.triggers.map(t => `<tr>
    <td style="font-weight:700;font-size:11px;">${esc(t.name)}</td>
    <td><code style="font-size:10px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(t.type)}</code></td>
    <td style="color:#475569;font-size:11px;">${esc(t.eventName)}</td>
    <td style="color:#475569;font-size:11px;">${esc(t.firesOn)}</td>
  </tr>`).join('');

  const tagsHtml = report.tags.map(t => `<tr>
    <td style="font-weight:700;font-size:11px;">${esc(t.name)}</td>
    <td><code style="font-size:10px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(t.type)}</code></td>
    <td style="color:#475569;font-size:11px;">${esc(t.activityId)}</td>
    <td style="color:#475569;font-size:11px;">${esc(t.uVariables)}</td>
    <td style="color:#475569;font-size:11px;">${esc(t.triggerAssigned)}</td>
  </tr>`).join('');

  const proposalsHtml = report.taggingProposals.map(p => `<tr>
    <td style="font-weight:700;font-size:11px;">${esc(p.priority)}</td>
    <td><code style="font-size:10px;background:rgba(0,0,0,.05);padding:1px 5px;border-radius:3px;">${esc(p.cm360Id)}</code></td>
    <td style="font-weight:700;font-size:11px;">${esc(p.activityName)}</td>
    <td style="color:#475569;font-size:11px;">${esc(p.countingType)}</td>
    <td style="color:#475569;font-size:11px;">${esc(p.gtmTrigger)}</td>
    <td style="font-size:10px;color:#475569;">
      ${p.u1 ? `<b>u1:</b> ${esc(p.u1)}<br/>` : ''}
      ${p.u2 ? `<b>u2:</b> ${esc(p.u2)}<br/>` : ''}
      ${p.u3 ? `<b>u3:</b> ${esc(p.u3)}<br/>` : ''}
      ${p.u4 ? `<b>u4:</b> ${esc(p.u4)}<br/>` : ''}
      ${p.u5 ? `<b>u5:</b> ${esc(p.u5)}<br/>` : ''}
      ${p.u6 ? `<b>u6:</b> ${esc(p.u6)}<br/>` : ''}
      ${p.u7 ? `<b>u7:</b> ${esc(p.u7)}<br/>` : ''}
      ${p.uN ? `<b>uN:</b> ${esc(p.uN)}` : ''}
    </td>
  </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${esc(report.projectName)} | ${esc(report.client)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root{--accent:#0891b2;--surface:#fff;--surface-alt:#f8fafc;--border:#e2e8f0;--text:#0f172a;--text-2:#475569;--text-m:#94a3b8;}
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
    body{font-family:'Inter',sans-serif;background:#ecfeff;color:var(--text);line-height:1.7;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
    .page{max-width:1000px;margin:40px auto;background:var(--surface);border-radius:16px;overflow:hidden;box-shadow:0 4px 6px -1px rgba(0,0,0,.07),0 20px 60px -10px rgba(0,0,0,.15);}
    .report-header{background:linear-gradient(135deg,#164e63 0%,#0e7490 60%,#0891b2 100%);padding:48px 56px 40px;position:relative;overflow:hidden;}
    .report-header::before{content:'';position:absolute;top:-60px;right:-60px;width:260px;height:260px;border-radius:50%;background:rgba(255,255,255,.04);}
    .header-tag{display:inline-block;background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.3);color:#67e8f9;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;padding:4px 12px;border-radius:100px;margin-bottom:18px;}
    .container-id{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;background:rgba(34,211,238,.15);border:1px solid rgba(34,211,238,.3);color:#67e8f9;font-size:13px;font-weight:600;padding:3px 12px;border-radius:100px;}
    .report-header h1{font-size:26px;font-weight:800;color:#fff;line-height:1.3;max-width:600px;position:relative;z-index:1;}
    .header-meta{display:flex;gap:24px;margin-top:24px;flex-wrap:wrap;position:relative;z-index:1;}
    .meta-item{display:flex;flex-direction:column;gap:2px;}
    .meta-label{font-size:11px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:rgba(255,255,255,.5);}
    .meta-value{font-size:14px;font-weight:600;color:#fff;}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;margin-bottom:36px;}
    .stat-card{background:var(--surface-alt);border:1px solid var(--border);border-radius:12px;padding:16px 20px;}
    .stat-num{font-size:28px;font-weight:800;color:#0891b2;}.stat-label{font-size:11px;font-weight:600;color:var(--text-m);text-transform:uppercase;letter-spacing:.04em;}
    .report-body{padding:48px 56px;}
    .section-title{display:flex;align-items:center;gap:12px;font-size:18px;font-weight:700;color:#164e63;margin-bottom:20px;padding-bottom:12px;border-bottom:2px solid var(--border);}
    .section-num{display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;background:var(--accent);color:#fff;font-size:13px;font-weight:700;border-radius:8px;flex-shrink:0;}
    .data-table{width:100%;border-collapse:collapse;font-size:12px;margin:0 0 32px 0;}
    .data-table th{background:#cffafe;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:#0f172a;padding:8px 10px;text-align:left;border-bottom:2px solid #a5f3fc;}
    .data-table td{padding:10px;border-bottom:1px solid #f1f5f9;vertical-align:top;}
    .data-table tr:last-child td{border-bottom:none;}
    .badge{display:inline-block;font-size:10px;font-weight:700;padding:3px 8px;border-radius:100px;}
    .badge-active{background:#dcfce7;color:#15803d;}.badge-issues{background:#fee2e2;color:#991b1b;}.badge-warning{background:#fef3c7;color:#b45309;}.badge-info{background:#e0e7ff;color:#4338ca;}
    .report-footer{background:var(--surface-alt);border-top:1px solid var(--border);padding:20px 56px;display:flex;align-items:center;justify-content:space-between;}
    .footer-brand{font-size:13px;font-weight:700;color:var(--text-m);}.footer-note{font-size:12px;color:var(--text-m);}
    @media print{@page{margin:14mm 10mm 16mm 10mm;size:A4 landscape;}html,body{margin:0!important;padding:0!important;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact;}.page{width:277mm!important;max-width:none!important;margin:0!important;border-radius:0!important;box-shadow:none!important;}.report-header{padding:10mm 12mm 8mm!important;}.report-body{padding:8mm 12mm!important;}.data-table tr{break-inside:avoid;page-break-inside:avoid;}}
  </style>
</head>
<body>
<div class="page">
  <div class="report-header">
    <div class="header-tag">🎯 Auditoría CM360</div>
    <h1>${esc(report.projectName)}</h1>
    <div class="header-meta">
      <div class="meta-item"><span class="meta-label">Cliente</span><span class="meta-value">${esc(report.client)}</span></div>
      ${report.advertiserName ? `<div class="meta-item"><span class="meta-label">Anunciante</span><span class="meta-value">${esc(report.advertiserName)}</span></div>` : ''}
      <div class="meta-item"><span class="meta-label">Advertiser ID</span><span class="meta-value"><span class="container-id">${esc(report.advertiserId)}</span></span></div>
      ${report.auditor ? `<div class="meta-item"><span class="meta-label">Auditor</span><span class="meta-value">${esc(report.auditor)}</span></div>` : ''}
      <div class="meta-item"><span class="meta-label">Fecha</span><span class="meta-value">${esc(report.date)}</span></div>
    </div>
  </div>
  <div class="report-body">
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-num">${floodlightsCount}</div><div class="stat-label">Floodlights</div></div>
      <div class="stat-card"><div class="stat-num">${variablesCount}</div><div class="stat-label">Variables</div></div>
      <div class="stat-card"><div class="stat-num">${tagsCount}</div><div class="stat-label">Tags</div></div>
      <div class="stat-card"><div class="stat-num">${proposalsCount}</div><div class="stat-label">Propuestas</div></div>
    </div>
    
    <h2 class="section-title"><span class="section-num">1</span> Floodlights</h2>
    <table class="data-table">
      <thead><tr><th>Activity Name</th><th>ID CM360</th><th>Imp. 7 Days</th><th>Acción</th><th>Justificación</th><th>Nueva Fuente de Verdad</th></tr></thead>
      <tbody>${floodlightsHtml || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay floodlights documentados.</td></tr>`}</tbody>
    </table>

    <h2 class="section-title"><span class="section-num">2</span> Variables GTM</h2>
    <table class="data-table">
      <thead><tr><th>Nombre GTM</th><th>Tipo</th><th>Ruta / Lógica (Código)</th><th>Propósito</th></tr></thead>
      <tbody>${variablesHtml || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay variables registradas.</td></tr>`}</tbody>
    </table>

    <h2 class="section-title"><span class="section-num">3</span> Triggers GTM</h2>
    <table class="data-table">
      <thead><tr><th>Nombre Propuesto</th><th>Tipo</th><th>Event Name</th><th>Condiciones</th></tr></thead>
      <tbody>${triggersHtml || `<tr><td colspan="4" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay triggers registrados.</td></tr>`}</tbody>
    </table>

    <h2 class="section-title"><span class="section-num">4</span> Etiquetas GTM</h2>
    <table class="data-table">
      <thead><tr><th>Nombre Propuesto</th><th>Tipo</th><th>Activity ID</th><th>U-Variables</th><th>Trigger Asignado</th></tr></thead>
      <tbody>${tagsHtml || `<tr><td colspan="5" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay etiquetas registradas.</td></tr>`}</tbody>
    </table>

    <h2 class="section-title"><span class="section-num">5</span> Propuesta de Marcaje</h2>
    <table class="data-table">
      <thead><tr><th>Prioridad</th><th>ID CM360</th><th>Activity Name</th><th>Tipo</th><th>Activador GTM</th><th>Variables (u)</th></tr></thead>
      <tbody>${proposalsHtml || `<tr><td colspan="6" style="text-align:center;color:#94a3b8;font-style:italic;padding:24px;">No hay propuestas de marcaje registradas.</td></tr>`}</tbody>
    </table>
  </div>
  <div class="report-footer">
    <span class="footer-brand">${esc(report.footerBrand)}</span>
    <span class="footer-note">${esc(report.footerNote)}</span>
  </div>
</div>
</body></html>`;
}
