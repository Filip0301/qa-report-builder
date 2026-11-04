# Doc Builder

Plataforma para crear, guardar y exportar documentación analítica estandarizada. Soporta cinco tipos de documento:

| Tipo | Para qué sirve |
|---|---|
| 🔍 **Auditoría QA** | Hallazgos con severidad, evidencia (capturas, JSON), impacto y solución |
| 📐 **Documentación DataLayer** | Eventos, variables, tipos y ejemplos de código |
| 📌 **Plan de Marcaje** | Eventos a implementar con prioridad y estado |
| 🏷️ **Auditoría GTM** | Tags, triggers y variables del contenedor |
| 🎯 **Auditoría CM360** | Floodlights, marcaje en GTM y propuestas |

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · Vercel.

## Funcionalidades

- **Espacio de equipo con login** (email y contraseña, con Supabase Auth). Cualquier usuario autenticado ve y edita todos los documentos.
- **Autoguardado en la nube.** Cada cambio se copia también en el navegador (IndexedDB): si la nube no responde, no se pierde nada y se reintenta solo.
- **Vista previa en tiempo real.** En Auditoría QA se puede reordenar los hallazgos arrastrándolos y redimensionar las secciones.
- **Exportación a PDF (A4) y HTML autocontenido.** Antes de exportar, la app revisa si faltan campos.
- **Búsqueda y filtros** por título, cliente, estado y tipo. El borrado se puede deshacer.
- **Enlaces directos** a cada documento: `/?doc=<id>`.

## Ejecutar localmente

Requisitos: Node.js 20.9 o superior.

```bash
cp .env.example .env.local   # completa URL y clave pública de Supabase
npm install                  # postinstall copia html2pdf a public/vendor
npm run dev                  # → http://localhost:3000
```

| Script | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` / `start` | Build y servidor de producción |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript sin emitir archivos |
| `npm test` | Tests (Vitest + jsdom) |
| `npm run check` | lint + typecheck + tests |

## Base de datos (Supabase)

Las migraciones están en [`supabase/migrations`](supabase/migrations) y deben aplicarse en orden:

1. `20260515000000_reports_baseline.sql`: tabla `reports`.
2. `20261104000001_reports_audit_columns.sql`: `updated_at`, `created_by`, `updated_by` y `deleted_at` (borrado lógico), un trigger y un índice.
3. `20261104000002_reports_enable_rls.sql`: **activa RLS**. Solo los usuarios autenticados tienen acceso; el rol anónimo queda sin acceso.

### Configuración de Auth (una sola vez, en el dashboard de Supabase)

En **Authentication → URL Configuration**:
- **Site URL:** `https://qa-report-builder.vercel.app`
- **Redirect URLs:** `https://qa-report-builder.vercel.app/**` y `http://localhost:3000/**`

Esto hace que los enlaces de confirmación de cuenta y de recuperación de contraseña vuelvan a la app (ruta `/auth/callback`).

Para controlar quién entra: cuando el equipo ya tenga sus cuentas, desactiva el registro en **Authentication → Sign In / Providers → Allow new users to sign up**. Después puedes invitar usuarios desde **Authentication → Users → Invite**.

## Despliegue (Vercel)

1. Conecta el repositorio de GitHub al proyecto de Vercel, para que cada push a `main` despliegue.
2. Variables de entorno: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (o `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).
3. Las funciones corren en `iad1`, la misma región que el proyecto de Supabase (`us-east-1`).

## Estructura

```
app/
  page.tsx                 Página principal (lee la sesión y monta la app)
  login/, reset-password/  Pantallas de autenticación
  auth/callback/           Destino de los enlaces de email de Supabase
  api/reports/             GET lista · GET/PUT/DELETE por id · POST restore
proxy.ts                   Refresca la sesión y protege las páginas (antes "middleware")
components/
  DocBuilderApp.tsx        Orquestador: abrir / crear / exportar / URL
  home/Landing.tsx         Inicio: abrir, crear, recientes, borradores locales
  editor/                  Cabecera, pestañas, indicador de guardado, menús
  builder/                 Formularios por tipo de documento
  preview/                 Vista previa (edición nativa y vista fiel en iframe aislado)
  ui/                      Modal, confirmación, gestor de documentos, editor de texto, etc.
hooks/useDocumentEditor.ts Estado del documento + autoguardado + copia local
lib/
  docTypes.ts              Registro de tipos de documento (secciones, colores, generador)
  generate*.ts             Generadores del HTML exportable
  html.ts                  Escape y sanitizado (DOMPurify)
  sync/                    Cliente de la API y borradores locales (IndexedDB)
  export/                  PDF y descargas
  api/                     Validación (zod) y utilidades HTTP
  supabase/                Clientes de Supabase (navegador, servidor, proxy)
supabase/migrations/       Esquema y políticas RLS
tests/                     Tests unitarios
```

## Seguridad

- **API:** todas las rutas exigen sesión. Los cuerpos de las peticiones se validan con zod, con un límite de 4 MB.
- **Base de datos:** RLS activo; el rol anónimo no tiene acceso.
- **Texto enriquecido:** se sanitiza con DOMPurify (lista blanca de etiquetas, atributos y estilos) al mostrarlo, al pegarlo y al exportarlo.
- **Vista previa fiel:** se muestra en un `<iframe sandbox="">`, sin scripts.
- **Cabeceras:** CSP `frame-ancestors 'none'`, `X-Content-Type-Options`, `Referrer-Policy` y `Permissions-Policy`.
