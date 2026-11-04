-- Parte 1 — cambios aditivos (seguros de aplicar con la versión anterior en producción).
-- Agrega trazabilidad (quién creó / modificó y cuándo) y borrado lógico.

alter table public.reports
  add column if not exists updated_at  timestamptz not null default now(),
  add column if not exists created_by  uuid references auth.users (id) on delete set null default auth.uid(),
  add column if not exists updated_by  uuid references auth.users (id) on delete set null,
  add column if not exists deleted_at  timestamptz;

-- Rellena updated_at de filas existentes con su fecha de creación.
update public.reports set updated_at = created_at where updated_at > created_at;

-- Valores válidos para el estado y el tipo de documento.
alter table public.reports
  drop constraint if exists reports_report_status_check,
  add constraint reports_report_status_check check (report_status in ('draft', 'final'));

alter table public.reports
  drop constraint if exists reports_doc_type_check,
  add constraint reports_doc_type_check
    check (doc_type in ('qa-audit', 'datalayer-doc', 'tagging-plan', 'gtm-audit', 'cm360-audit'));

-- Mantiene updated_at / updated_by automáticamente.
create or replace function public.reports_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := coalesce(auth.uid(), new.updated_by);
  return new;
end;
$$;

drop trigger if exists reports_touch on public.reports;
create trigger reports_touch
  before update on public.reports
  for each row execute function public.reports_touch();

-- Listado principal: documentos no borrados, ordenados por última modificación.
create index if not exists reports_active_updated_idx
  on public.reports (updated_at desc)
  where deleted_at is null;
