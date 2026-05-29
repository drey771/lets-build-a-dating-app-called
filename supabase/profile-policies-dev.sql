-- Datez development-only profile policies.
-- Run this in Supabase SQL Editor if profile save/load fails while prototyping.
-- These policies are intentionally open because Datez currently authenticates
-- with Firebase, not Supabase Auth. Replace before production.

alter table public.profiles enable row level security;

drop policy if exists "profiles are readable during development" on public.profiles;
create policy "profiles are readable during development"
on public.profiles
for select
using (true);

drop policy if exists "profiles are writable during development" on public.profiles;
create policy "profiles are writable during development"
on public.profiles
for insert
with check (true);

drop policy if exists "profiles are editable during development" on public.profiles;
create policy "profiles are editable during development"
on public.profiles
for update
using (true)
with check (true);
