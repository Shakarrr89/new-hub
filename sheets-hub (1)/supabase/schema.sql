-- =====================================================================
-- Sheets Hub: schema, roles and Row Level Security (safe to re-run)
-- Supabase: SQL Editor > New query > paste everything > Run
-- =====================================================================

-- 1. TABLES -----------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade
);
alter table public.profiles add column if not exists email      text;
alter table public.profiles add column if not exists full_name  text;
alter table public.profiles add column if not exists role       text not null default 'viewer';
alter table public.profiles add column if not exists created_at timestamptz not null default now();

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('admin', 'viewer'));

create table if not exists public.datasets (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  description     text,
  google_sheet_id text not null,
  sheet_tab       text not null default 'Sheet1',
  last_synced_at  timestamptz,
  created_at      timestamptz not null default now()
);

create table if not exists public.dataset_access (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  dataset_id  uuid not null references public.datasets(id) on delete cascade,
  granted_at  timestamptz not null default now(),
  primary key (user_id, dataset_id)
);

create table if not exists public.dataset_rows (
  id          bigint generated always as identity primary key,
  dataset_id  uuid not null references public.datasets(id) on delete cascade,
  row_number  integer not null,
  data        jsonb not null,
  unique (dataset_id, row_number)
);

create index if not exists dataset_rows_dataset_idx on public.dataset_rows (dataset_id);
create index if not exists dataset_access_user_idx  on public.dataset_access (user_id);

-- 2. HELPER FUNCTIONS -------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.has_dataset_access(d uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select public.is_admin()
      or exists (
        select 1 from public.dataset_access
        where user_id = auth.uid() and dataset_id = d
      );
$$;

-- 3. AUTO-CREATE A PROFILE FOR EVERY NEW USER -------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Create profiles for users that already exist
insert into public.profiles (id, email)
select id, email from auth.users
on conflict (id) do update set email = excluded.email;

-- 4. ROW LEVEL SECURITY -----------------------------------------------

alter table public.profiles       enable row level security;
alter table public.datasets       enable row level security;
alter table public.dataset_access enable row level security;
alter table public.dataset_rows   enable row level security;

revoke all on public.profiles, public.datasets,
              public.dataset_access, public.dataset_rows from anon;

drop policy if exists profiles_select       on public.profiles;
drop policy if exists profiles_admin_update on public.profiles;
drop policy if exists datasets_select       on public.datasets;
drop policy if exists datasets_admin_write  on public.datasets;
drop policy if exists access_select         on public.dataset_access;
drop policy if exists access_admin_write    on public.dataset_access;
drop policy if exists rows_select           on public.dataset_rows;

create policy profiles_select on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_admin());

create policy profiles_admin_update on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy datasets_select on public.datasets
  for select to authenticated
  using (public.has_dataset_access(id));

create policy datasets_admin_write on public.datasets
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy access_select on public.dataset_access
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

create policy access_admin_write on public.dataset_access
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy rows_select on public.dataset_rows
  for select to authenticated
  using (public.has_dataset_access(dataset_id));

-- 5. MAKE YOURSELF ADMIN ----------------------------------------------
-- Run this as a separate query. Replace the email with yours:
--
-- update public.profiles set role = 'admin' where email = 'you@example.com';
