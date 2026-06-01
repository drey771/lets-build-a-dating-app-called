create table if not exists public.profiles (
  id text primary key,
  email text unique,
  display_name text,
  avatar_url text,
  photo_urls text[] not null default '{}',
  bio text,
  birthdate date,
  location text,
  gender text,
  interested_in text,
  relationship_goal text,
  occupation text,
  education text,
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_a_id text not null references public.profiles(id) on delete cascade,
  user_b_id text not null references public.profiles(id) on delete cascade,
  matched_at timestamptz not null default now(),
  unique (user_a_id, user_b_id),
  check (user_a_id <> user_b_id)
);

create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id text not null references public.profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.chats enable row level security;
alter table public.messages enable row level security;

-- Development policies for the Firebase-auth prototype.
-- Replace these before production with policies that validate Firebase JWTs
-- or move auth fully into Supabase Auth.
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
