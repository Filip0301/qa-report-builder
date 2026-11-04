-- Parte 2 — activar Row Level Security.
-- ⚠ Aplicar SOLO después de desplegar la versión con login (rama feat/qa-hardening).
--   La versión anterior usa la clave anónima sin sesión y dejaría de funcionar.
--
-- Modelo: espacio de equipo compartido. Cualquier usuario autenticado puede ver y
-- editar todos los documentos; el rol anónimo no tiene acceso.

alter table public.reports enable row level security;

revoke all on table public.reports from anon;
grant select, insert, update, delete on table public.reports to authenticated;

drop policy if exists "reports_select_authenticated" on public.reports;
create policy "reports_select_authenticated"
  on public.reports for select
  to authenticated
  using (true);

drop policy if exists "reports_insert_authenticated" on public.reports;
create policy "reports_insert_authenticated"
  on public.reports for insert
  to authenticated
  with check (created_by is null or created_by = (select auth.uid()));

drop policy if exists "reports_update_authenticated" on public.reports;
create policy "reports_update_authenticated"
  on public.reports for update
  to authenticated
  using (true)
  with check (true);

drop policy if exists "reports_delete_authenticated" on public.reports;
create policy "reports_delete_authenticated"
  on public.reports for delete
  to authenticated
  using (true);
