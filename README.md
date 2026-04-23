# QA Report Builder

Generador de auditorías técnicas QA estandarizadas. Construido con **Next.js 14 + TypeScript + Tailwind CSS**.

## Funcionalidades

- 📋 Formulario estructurado para todos los campos del informe
- 🔍 Hallazgos con severidad: Crítico / Advertencia / Informativo / Mejora
- 📸 Carga de imágenes (base64, embebidas en el HTML exportado)
- 🧩 Bloques de código JSON con syntax highlighting
- ⚖️ Comparativa Anómalo vs. Correcto
- 👁️ Preview en tiempo real del reporte
- ⬇️ Exportar como HTML autocontenido
- 🖨️ Exportar a PDF vía impresión del navegador (A4 optimizado)

## Ejecutar localmente

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Desplegar en Vercel

### Opción A — GitHub
1. Sube este proyecto a un repositorio GitHub
2. Ve a [vercel.com](https://vercel.com) → "Add New Project" → importa el repo
3. Vercel lo detecta automáticamente como Next.js. Haz clic en **Deploy**

### Opción B — Vercel CLI
```bash
npm install -g vercel
vercel --prod
```

## Estructura del proyecto

```
app/
  page.tsx          — Página principal (layout split)
  layout.tsx        — Layout raíz
  globals.css       — Clases CSS globales del builder
components/
  builder/
    ReportMeta.tsx      — Metadata del informe
    ExecutiveSummary.tsx
    FindingCard.tsx     — Formulario de hallazgo individual
    FindingsList.tsx    — Lista dinámica de hallazgos
    BusinessImpact.tsx  — Implicación de negocio
  preview/
    ReportPreview.tsx   — Preview en iframe en tiempo real
lib/
  types.ts          — Tipos TypeScript
  generateHTML.ts   — Generador del HTML del reporte
```
