create table if not exists public.profiles (
  id text primary key,
  email text unique,
  display_name text,
  avatar_url text,
  bio text,
  birthdate date,
  location text,
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
