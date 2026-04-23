import { ReportData, Finding, Severity, severityConfig } from './types';

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function syntaxHighlightJSON(json: string): string {
  const escaped = escapeHtml(json);
  return escaped
    .replace(/("(?:[^"\\]|\\.)*")\s*:/g, '<span class="c-key">$1</span>:')
    .replace(/:\s*("(?:[^"\\]|\\.)*")/g, ': <span class="c-str">$1</span>')
    .replace(/:\s*(\b\d+\.?\d*\b)/g, ': <span class="c-num">$1</span>')
    .replace(/:\s*(null)/g, ': <span class="c-null">null</span>')
    .replace(/:\s*(true|false)/g, ': <span class="c-bool">$1</span>');
}

function getSeverityVars(severity: Severity) {
  const conf = severityConfig[severity];
  switch (severity) {
    case 'critical':
      return {
        cardClass: 'critical',
        badgeEmoji: '🔴',
        bugNumBg: 'var(--critical-border)',
        bugNumColor: '#7f1d1d',
        badgeBg: 'rgba(239,68,68,.15)',
      };
    case 'warning':
      return {
        cardClass: 'warning',
        badgeEmoji: '🟡',
        bugNumBg: 'var(--warning-border)',
        bugNumColor: '#78350f',
        badgeBg: 'rgba(245,158,11,.15)',
      };
    case 'info':
      return {
        cardClass: 'info',
        badgeEmoji: '🔵',
        bugNumBg: '#bfdbfe',
        bugNumColor: '#1e3a8a',
        badgeBg: 'rgba(59,130,246,.15)',
      };
    case 'improvement':
      return {
        cardClass: 'improvement',
        badgeEmoji: '🟣',
        bugNumBg: '#ddd6fe',
        bugNumColor: '#4c1d95',
        badgeBg: 'rgba(139,92,246,.15)',
      };
  }
}

function renderFinding(finding: Finding, index: number): string {
  const vars = getSeverityVars(finding.severity);
  const num = String(index + 1).padStart(2, '0');
  const typeLabel = severityConfig[finding.severity].label.toUpperCase();

  let codeBlockHtml = '';
  if (finding.codeBlock?.content) {
    codeBlockHtml = `
      <div class="code-wrap">
        <div class="code-label">
          <span class="code-dot r"></span>
          <span class="code-dot y"></span>
          <span class="code-dot g"></span>
          <span class="code-lang">${escapeHtml(finding.codeBlock.language || 'JSON · DataLayer')}</span>
        </div>
        <pre>${syntaxHighlightJSON(finding.codeBlock.content)}</pre>
      </div>`;
  }

  let compareHtml = '';
  if (finding.showCompare && finding.compareBlock) {
    const cb = finding.compareBlock;
    compareHtml = `
      <div class="compare-grid">
        <div class="compare-col anomaly">
          <div class="compare-col-header">🔴 ${escapeHtml(cb.anomalyLabel || 'Escenario Anómalo')}</div>
          <div class="code-wrap" style="border-radius:0;margin:0;">
            <pre style="font-size:11.5px;">${syntaxHighlightJSON(cb.anomalyCode)}</pre>
          </div>
        </div>
        <div class="compare-col correct">
          <div class="compare-col-header">🟢 ${escapeHtml(cb.correctLabel || 'Escenario Correcto')}</div>
          <div class="code-wrap" style="border-radius:0;margin:0;">
            <pre style="font-size:11.5px;">${syntaxHighlightJSON(cb.correctCode)}</pre>
          </div>
        </div>
      </div>`;
  }

  let imageHtml = '';
  if (finding.image) {
    imageHtml = `
      <div style="margin:16px 0;">
        <img src="${finding.image}" alt="${escapeHtml(finding.imageCaption || 'Captura de evidencia')}" style="max-width:100%;border-radius:8px;border:1px solid #e2e8f0;" />
        ${finding.imageCaption ? `<p style="font-size:12px;color:#64748b;margin-top:6px;font-style:italic;">${escapeHtml(finding.imageCaption)}</p>` : ''}
      </div>`;
  }

  let locationHtml = '';
  if (finding.location) {
    locationHtml = `
      <div class="field-row">
        <span class="field-label">Ubicación</span>
        <span class="field-value">${escapeHtml(finding.location)}</span>
      </div>`;
  }

  return `
    <div id="finding-${index}" class="bug-card ${vars.cardClass}">
      <div class="bug-header">
        <span class="bug-badge" style="background:${vars.badgeBg};">${vars.badgeEmoji}</span>
        <span class="bug-title">${escapeHtml(finding.title)}</span>
        <span class="bug-num" style="background:${vars.bugNumBg};color:${vars.bugNumColor};">${typeLabel} #${num}</span>
      </div>
      <div class="bug-body">
        <div class="field-row">
          <span class="field-label">Descripción</span>
          <span class="field-value">${escapeHtml(finding.description)}</span>
        </div>
        ${locationHtml}
        ${codeBlockHtml}
        ${compareHtml}
        ${imageHtml}
        ${finding.impact ? `<div class="impact-box"><span class="impact-icon">📉</span><div><strong>Impacto:</strong> ${escapeHtml(finding.impact)}</div></div>` : ''}
        ${finding.solution ? `<div class="fix-box"><span class="impact-icon">✅</span><div><strong>Solución IT:</strong> ${escapeHtml(finding.solution)}</div></div>` : ''}
      </div>
    </div>`;
}

function getStatusBadge(status: string, label: string) {
  if (status === 'critical')
    return `<span class="badge-critical">${label || 'Crítico / Acción Requerida'}</span>`;
  if (status === 'warning')
    return `<span class="badge-warning">${label || 'Advertencia'}</span>`;
  return `<span class="badge-ok">${label || 'OK'}</span>`;
}

export function generateHTML(report: ReportData): string {
  const findingsHtml = report.findings.map((f, i) => renderFinding(f, i)).join('\n');
  const businessHtml = report.businessPoints
    .map(
      (bp, i) => `
      <li>
        <span class="list-num">${i + 1}</span>
        <span><strong>${escapeHtml(bp.title)}:</strong> ${escapeHtml(bp.description)}</span>
      </li>`
    )
    .join('\n');

  const statusBadge = getStatusBadge(report.status, '');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${escapeHtml(report.reportTitle)} | ${escapeHtml(report.client)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <style>
    :root {
      --brand-primary:   #1a1f36;
      --brand-accent:    #4f46e5;
      --brand-accent-lt: #818cf8;
      --critical:        #ef4444;
      --critical-bg:     #fef2f2;
      --critical-border: #fca5a5;
      --warning:         #f59e0b;
      --warning-bg:      #fffbeb;
      --warning-border:  #fcd34d;
      --info:            #3b82f6;
      --info-bg:         #eff6ff;
      --info-border:     #93c5fd;
      --improvement:     #8b5cf6;
      --improvement-bg:  #f5f3ff;
      --improvement-border: #c4b5fd;
      --success:         #22c55e;
      --surface:         #ffffff;
      --surface-alt:     #f8fafc;
      --border:          #e2e8f0;
      --text-primary:    #0f172a;
      --text-secondary:  #475569;
      --text-muted:      #94a3b8;
      --page-max-width:  860px;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f1f5f9; color: var(--text-primary); line-height: 1.7; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .page { max-width: var(--page-max-width); margin: 40px auto; background: var(--surface); border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,.07), 0 20px 60px -10px rgba(0,0,0,.15); }
    .report-header { background: linear-gradient(135deg, #1a1f36 0%, #2d3561 60%, #4f46e5 100%); padding: 48px 56px 40px; position: relative; overflow: hidden; }
    .report-header::before { content: ''; position: absolute; top: -60px; right: -60px; width: 260px; height: 260px; border-radius: 50%; background: rgba(255,255,255,.04); }
    .report-header::after { content: ''; position: absolute; bottom: -80px; right: 120px; width: 200px; height: 200px; border-radius: 50%; background: rgba(79,70,229,.3); }
    .header-tag { display: inline-block; background: rgba(239,68,68,.2); border: 1px solid rgba(239,68,68,.4); color: #fca5a5; font-size: 11px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; padding: 4px 12px; border-radius: 100px; margin-bottom: 18px; }
    .report-header h1 { font-size: 26px; font-weight: 800; color: #fff; line-height: 1.3; max-width: 580px; position: relative; z-index: 1; }
    .header-meta { display: flex; gap: 24px; margin-top: 24px; flex-wrap: wrap; position: relative; z-index: 1; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.5); }
    .meta-value { font-size: 14px; font-weight: 600; color: #fff; }
    .badge-critical { display: inline-flex; align-items: center; gap: 6px; background: rgba(239,68,68,.2); border: 1px solid rgba(239,68,68,.4); color: #fca5a5; font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 100px; }
    .badge-critical::before { content: '●'; color: #ef4444; }
    .badge-warning { display: inline-flex; align-items: center; gap: 6px; background: rgba(245,158,11,.2); border: 1px solid rgba(245,158,11,.4); color: #fcd34d; font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 100px; }
    .badge-warning::before { content: '●'; color: #f59e0b; }
    .badge-ok { display: inline-flex; align-items: center; gap: 6px; background: rgba(34,197,94,.2); border: 1px solid rgba(34,197,94,.4); color: #4ade80; font-size: 12px; font-weight: 700; padding: 3px 12px; border-radius: 100px; }
    .badge-ok::before { content: '●'; color: #22c55e; }
    .report-body { padding: 48px 56px; }
    .section-title { display: flex; align-items: center; gap: 12px; font-size: 18px; font-weight: 700; color: var(--brand-primary); margin-bottom: 20px; padding-bottom: 12px; border-bottom: 2px solid var(--border); }
    .section-num { display: inline-flex; align-items: center; justify-content: center; width: 30px; height: 30px; background: var(--brand-accent); color: #fff; font-size: 13px; font-weight: 700; border-radius: 8px; flex-shrink: 0; }
    .exec-summary { background: var(--surface-alt); border-left: 4px solid var(--brand-accent); border-radius: 0 12px 12px 0; padding: 20px 24px; margin-bottom: 40px; font-size: 14.5px; color: var(--text-secondary); white-space: pre-wrap; }
    .exec-summary strong { color: var(--text-primary); }
    .bug-card { border-radius: 12px; border: 1px solid; margin-bottom: 28px; overflow: hidden; }
    .bug-card.critical { border-color: var(--critical-border); background: var(--critical-bg); }
    .bug-card.warning  { border-color: var(--warning-border);  background: var(--warning-bg); }
    .bug-card.info     { border-color: var(--info-border);     background: var(--info-bg); }
    .bug-card.improvement { border-color: var(--improvement-border); background: var(--improvement-bg); }
    .bug-header { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-bottom: 1px solid; }
    .bug-card.critical    .bug-header { border-color: var(--critical-border); }
    .bug-card.warning     .bug-header { border-color: var(--warning-border); }
    .bug-card.info        .bug-header { border-color: var(--info-border); }
    .bug-card.improvement .bug-header { border-color: var(--improvement-border); }
    .bug-badge { display: inline-flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 8px; font-size: 15px; flex-shrink: 0; }
    .bug-title { font-size: 14px; font-weight: 700; color: var(--text-primary); flex: 1; }
    .bug-num { margin-left: auto; font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; padding: 3px 10px; border-radius: 100px; white-space: nowrap; }
    .bug-body { padding: 20px; }
    .field-row { display: grid; grid-template-columns: 140px 1fr; gap: 6px 16px; font-size: 13.5px; margin-bottom: 8px; align-items: baseline; }
    .field-label { font-weight: 600; color: var(--text-secondary); font-size: 12px; text-transform: uppercase; letter-spacing: .05em; padding-top: 2px; }
    .field-value { color: var(--text-primary); }
    .code-wrap { background: #0f172a; border-radius: 10px; overflow: hidden; margin: 14px 0; }
    .code-label { display: flex; align-items: center; gap: 8px; padding: 8px 14px; background: rgba(255,255,255,.04); border-bottom: 1px solid rgba(255,255,255,.07); }
    .code-dot { width: 10px; height: 10px; border-radius: 50%; }
    .code-dot.r { background: #ef4444; }
    .code-dot.y { background: #f59e0b; }
    .code-dot.g { background: #22c55e; }
    .code-lang { font-size: 11px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase; color: rgba(255,255,255,.35); margin-left: auto; }
    pre { padding: 16px 20px; overflow-x: auto; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.65; color: #e2e8f0; white-space: pre-wrap; word-wrap: break-word; }
    .c-key { color: #93c5fd; }
    .c-str { color: #86efac; }
    .c-num { color: #fde68a; }
    .c-null { color: #fb7185; }
    .c-bool { color: #c4b5fd; }
    .c-err { color: #f87171; font-weight: 700; }
    .c-ok { color: #4ade80; font-weight: 700; }
    .c-comment { color: #64748b; font-style: italic; }
    .impact-box { display: flex; gap: 10px; align-items: flex-start; background: rgba(79,70,229,.06); border: 1px solid rgba(79,70,229,.15); border-radius: 8px; padding: 12px 16px; margin: 12px 0; font-size: 13.5px; }
    .impact-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .impact-box strong { color: var(--brand-accent); }
    .fix-box { display: flex; gap: 10px; align-items: flex-start; background: rgba(34,197,94,.06); border: 1px solid rgba(34,197,94,.2); border-radius: 8px; padding: 12px 16px; font-size: 13.5px; }
    .fix-box strong { color: #15803d; }
    code { font-family: 'JetBrains Mono', monospace; font-size: 12px; background: rgba(0,0,0,.06); padding: 1px 5px; border-radius: 4px; }
    .compare-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 14px 0; }
    .compare-col { border-radius: 10px; overflow: hidden; }
    .compare-col-header { padding: 8px 14px; font-size: 12px; font-weight: 700; display: flex; align-items: center; gap: 6px; }
    .compare-col.anomaly .compare-col-header { background: rgba(239,68,68,.15); color: #b91c1c; }
    .compare-col.correct .compare-col-header { background: rgba(34,197,94,.15); color: #15803d; }
    .numbered-list { list-style: none; display: flex; flex-direction: column; gap: 12px; margin-top: 16px; }
    .numbered-list li { display: grid; grid-template-columns: 28px 1fr; gap: 12px; align-items: baseline; font-size: 14px; }
    .list-num { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background: var(--brand-accent); color: #fff; font-size: 12px; font-weight: 700; border-radius: 50%; flex-shrink: 0; }
    .divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }
    .report-footer { background: var(--surface-alt); border-top: 1px solid var(--border); padding: 20px 56px; display: flex; align-items: center; justify-content: space-between; }
    .footer-brand { font-size: 13px; font-weight: 700; color: var(--text-muted); letter-spacing: .04em; }
    .footer-note  { font-size: 12px; color: var(--text-muted); }
    @media print {
      @page { margin: 14mm 18mm 16mm 18mm; size: A4; }
      html { width: 210mm; }
      html, body { margin: 0 !important; padding: 0 !important; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { width: 210mm !important; max-width: none !important; min-width: 0 !important; margin: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
      .report-header { padding: 10mm 12mm 8mm !important; }
      .report-body { padding: 8mm 12mm !important; }
      .report-footer { padding: 5mm 12mm !important; }
      .divider { display: none; }
      .bug-card, .exec-summary, .code-wrap, .impact-box, .fix-box, .compare-grid, .compare-col, .field-row, .numbered-list li, .report-footer { break-inside: avoid; page-break-inside: avoid; }
      .section-title, .bug-header, h2 { break-after: avoid; page-break-after: avoid; }
    }
  </style>
</head>
<body>
<div class="page">
  <div class="report-header">
    <div class="header-tag">⚠ Auditoría Técnica</div>
    <h1>${escapeHtml(report.reportTitle)}</h1>
    <div class="header-meta">
      <div class="meta-item">
        <span class="meta-label">Cliente</span>
        <span class="meta-value">${escapeHtml(report.client)}</span>
      </div>
      ${report.auditor ? `<div class="meta-item"><span class="meta-label">Auditor</span><span class="meta-value">${escapeHtml(report.auditor)}</span></div>` : ''}
      <div class="meta-item">
        <span class="meta-label">Fecha</span>
        <span class="meta-value">${escapeHtml(report.date)}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Estado</span>
        <span class="meta-value">${statusBadge}</span>
      </div>
    </div>
  </div>

  <div class="report-body">
    <h2 class="section-title"><span class="section-num">1</span> Resumen Ejecutivo</h2>
    <div class="exec-summary">${escapeHtml(report.executiveSummary)}</div>

    <hr class="divider"/>

    <h2 class="section-title"><span class="section-num">2</span> Hallazgos Detectados</h2>

    ${findingsHtml || '<p style="color:#94a3b8;font-style:italic;">No se han registrado hallazgos.</p>'}

    ${report.businessPoints.length > 0 ? `
    <hr class="divider"/>
    <h2 class="section-title"><span class="section-num">3</span> Implicación de Negocio</h2>
    <ul class="numbered-list">
      ${businessHtml}
    </ul>` : ''}
  </div>

  <div class="report-footer">
    <span class="footer-brand">${escapeHtml(report.footerBrand)}</span>
    <span class="footer-note">${escapeHtml(report.footerNote)}</span>
  </div>
</div>
</body>
</html>`;
}
