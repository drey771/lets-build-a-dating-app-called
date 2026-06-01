alter table public.profiles
add column if not exists gender text,
add column if not exists interested_in text,
add column if not exists relationship_goal text,
add column if not exists occupation text,
add column if not exists education text,
add column if not exists interests text[] not null default '{}',
add column if not exists photo_urls text[] not null default '{}';

insert into storage.buckets (id, name, public)
values ('datez-profile-photos', 'datez-profile-photos', true)
on conflict (id) do nothing;

drop policy if exists "profile photos are readable during development" on storage.objects;
create policy "profile photos are readable during development"
on storage.objects
for select
using (bucket_id = 'datez-profile-photos');

drop policy if exists "profile photos are uploadable during development" on storage.objects;
create policy "profile photos are uploadable during development"
on storage.objects
for insert
with check (bucket_id = 'datez-profile-photos');

drop policy if exists "profile photos are replaceable during development" on storage.objects;
create policy "profile photos are replaceable during development"
on storage.objects
for update
using (bucket_id = 'datez-profile-photos')
with check (bucket_id = 'datez-profile-photos');
