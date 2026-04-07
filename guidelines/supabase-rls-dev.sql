-- RLS de desarrollo para SGT-Unimar
-- Ejecuta esto en Supabase SQL Editor del proyecto NUEVO.
-- ADVERTENCIA: politicas permisivas, solo para desarrollo.

alter table public.usuarios enable row level security;
alter table public.torneos enable row level security;
alter table public.equipo enable row level security;
alter table public.jugadores enable row level security;
alter table public.fixture enable row level security;

-- Limpieza de politicas previas para evitar duplicados
DROP POLICY IF EXISTS usuarios_select_dev ON public.usuarios;
DROP POLICY IF EXISTS usuarios_insert_dev ON public.usuarios;
DROP POLICY IF EXISTS usuarios_update_dev ON public.usuarios;
DROP POLICY IF EXISTS usuarios_delete_dev ON public.usuarios;

DROP POLICY IF EXISTS torneos_select_dev ON public.torneos;
DROP POLICY IF EXISTS torneos_insert_dev ON public.torneos;
DROP POLICY IF EXISTS torneos_update_dev ON public.torneos;
DROP POLICY IF EXISTS torneos_delete_dev ON public.torneos;

DROP POLICY IF EXISTS equipo_select_dev ON public.equipo;
DROP POLICY IF EXISTS equipo_insert_dev ON public.equipo;
DROP POLICY IF EXISTS equipo_update_dev ON public.equipo;
DROP POLICY IF EXISTS equipo_delete_dev ON public.equipo;

DROP POLICY IF EXISTS jugadores_select_dev ON public.jugadores;
DROP POLICY IF EXISTS jugadores_insert_dev ON public.jugadores;
DROP POLICY IF EXISTS jugadores_update_dev ON public.jugadores;
DROP POLICY IF EXISTS jugadores_delete_dev ON public.jugadores;

DROP POLICY IF EXISTS fixture_select_dev ON public.fixture;
DROP POLICY IF EXISTS fixture_insert_dev ON public.fixture;
DROP POLICY IF EXISTS fixture_update_dev ON public.fixture;
DROP POLICY IF EXISTS fixture_delete_dev ON public.fixture;

-- usuarios
create policy usuarios_select_dev on public.usuarios for select using (true);
create policy usuarios_insert_dev on public.usuarios for insert with check (true);
create policy usuarios_update_dev on public.usuarios for update using (true) with check (true);
create policy usuarios_delete_dev on public.usuarios for delete using (true);

-- torneos
create policy torneos_select_dev on public.torneos for select using (true);
create policy torneos_insert_dev on public.torneos for insert with check (true);
create policy torneos_update_dev on public.torneos for update using (true) with check (true);
create policy torneos_delete_dev on public.torneos for delete using (true);

-- equipo
create policy equipo_select_dev on public.equipo for select using (true);
create policy equipo_insert_dev on public.equipo for insert with check (true);
create policy equipo_update_dev on public.equipo for update using (true) with check (true);
create policy equipo_delete_dev on public.equipo for delete using (true);

-- jugadores
create policy jugadores_select_dev on public.jugadores for select using (true);
create policy jugadores_insert_dev on public.jugadores for insert with check (true);
create policy jugadores_update_dev on public.jugadores for update using (true) with check (true);
create policy jugadores_delete_dev on public.jugadores for delete using (true);

-- fixture
create policy fixture_select_dev on public.fixture for select using (true);
create policy fixture_insert_dev on public.fixture for insert with check (true);
create policy fixture_update_dev on public.fixture for update using (true) with check (true);
create policy fixture_delete_dev on public.fixture for delete using (true);
