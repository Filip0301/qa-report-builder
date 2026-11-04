-- Esquema base de la tabla `reports`, tal como existía antes de noviembre de 2026.
-- Se incluye para poder recrear la base desde cero (por ejemplo, en un proyecto nuevo).

create table if not exists public.reports (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  client        text not null,
  data          jsonb not null,
  created_at    timestamptz not null default timezone('utc'::text, now()),
  report_status text default 'draft',
  doc_type      text default 'qa-audit'
);
