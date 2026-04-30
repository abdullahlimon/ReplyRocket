-- ReplyRocket initial schema
-- Run with: psql "$DATABASE_URL" -f supabase/migrations/0001_init.sql
-- Or via Supabase CLI: `supabase db push`

create extension if not exists "pgcrypto";

-- =====================================================
-- 1. profiles  (1:1 with auth.users)
-- =====================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  plan text not null default 'free',
  monthly_quota int not null default 30,
  monthly_used int not null default 0,
  quota_reset_at timestamptz not null default (now() + interval '30 days'),
  created_at timestamptz not null default now()
);

-- =====================================================
-- 2. user_settings
-- =====================================================
create table if not exists public.user_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  default_tone text not null default 'friendly',
  default_goal text not null default 'follow_up',
  per_platform_defaults jsonb not null default '{}'::jsonb,
  language text not null default 'en',
  insert_mode text not null default 'replace',
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 3. voice_profiles
-- =====================================================
create table if not exists public.voice_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  avg_sentence_length numeric,
  formality_score numeric,
  emoji_frequency numeric,
  preferred_greeting text,
  preferred_signoff text,
  common_phrases text[],
  vocabulary_level text,
  contraction_usage numeric,
  paragraph_style text,
  features jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- =====================================================
-- 4. voice_samples
-- =====================================================
create table if not exists public.voice_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  source text not null,
  platform text,
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists voice_samples_user_idx
  on public.voice_samples (user_id, created_at desc);

-- =====================================================
-- 5. replies
-- =====================================================
create table if not exists public.replies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  platform text not null,
  tone text not null,
  goal text not null,
  incoming_message text not null,
  thread_context text,
  drafts jsonb not null,
  selected_draft_id text,
  edited_text text,
  feedback smallint,
  model text not null default 'claude-3-5-sonnet-latest',
  prompt_tokens int,
  completion_tokens int,
  created_at timestamptz not null default now()
);
create index if not exists replies_user_idx
  on public.replies (user_id, created_at desc);

-- =====================================================
-- 6. usage_events
-- =====================================================
create table if not exists public.usage_events (
  id bigserial primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_type text not null,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index if not exists usage_events_user_idx
  on public.usage_events (user_id, created_at desc);

-- =====================================================
-- 7. extension_sessions
-- =====================================================
create table if not exists public.extension_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  token_hash text not null unique,
  user_agent text,
  last_used_at timestamptz,
  created_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index if not exists extension_sessions_user_idx
  on public.extension_sessions (user_id);

-- =====================================================
-- handle_new_user trigger: seed dependent rows
-- =====================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.email, ''),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id) values (new.id)
  on conflict (user_id) do nothing;

  insert into public.voice_profiles (user_id) values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- increment_usage RPC
-- =====================================================
create or replace function public.increment_usage(p_user_id uuid)
returns table (monthly_used int, monthly_quota int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_used int;
  v_quota int;
begin
  update public.profiles
     set monthly_used = monthly_used + 1
   where id = p_user_id
   returning profiles.monthly_used, profiles.monthly_quota
   into v_used, v_quota;
  return query select v_used, v_quota;
end;
$$;

-- =====================================================
-- Row Level Security
-- =====================================================
alter table public.profiles            enable row level security;
alter table public.user_settings       enable row level security;
alter table public.voice_profiles      enable row level security;
alter table public.voice_samples       enable row level security;
alter table public.replies             enable row level security;
alter table public.usage_events        enable row level security;
alter table public.extension_sessions  enable row level security;

-- Helper macro: each table allows users to read/write only their own rows.
-- Service role bypasses RLS automatically.

create policy "profiles_self_select" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);

create policy "settings_self_all" on public.user_settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "voice_profiles_self_all" on public.voice_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "voice_samples_self_all" on public.voice_samples
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "replies_self_all" on public.replies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usage_events_self_select" on public.usage_events
  for select using (auth.uid() = user_id);

create policy "extension_sessions_self_select" on public.extension_sessions
  for select using (auth.uid() = user_id);
create policy "extension_sessions_self_revoke" on public.extension_sessions
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
