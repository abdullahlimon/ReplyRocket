-- ReplyRocket migration 0002
-- - Adds public.pricing_plans (DB-backed pricing, editable from admin)
-- - Adds profiles.role ('user' | 'admin') and profiles.onboarded flag
-- - is_admin() helper for RLS without recursion
-- - Seeds the three default plans

create table if not exists public.pricing_plans (
  id text primary key,
  name text not null,
  price_label text not null,                  -- e.g. "$0", "$9", "Contact"
  price_cents int not null default 0,
  cadence text not null,                      -- "forever", "/ month", "us"
  blurb text not null,
  features jsonb not null default '[]'::jsonb, -- array of strings
  cta text not null default 'Get started',
  highlight boolean not null default false,
  monthly_quota int,                          -- null = unlimited
  accent text not null default 'brand',       -- 'brand' | 'sky' | 'rose' | 'amber' | 'emerald' | 'violet'
  display_order int not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.pricing_plans enable row level security;

drop policy if exists "pricing_public_read" on public.pricing_plans;
create policy "pricing_public_read" on public.pricing_plans
  for select using (active = true);

insert into public.pricing_plans
  (id, name, price_label, price_cents, cadence, blurb, features, cta, highlight, monthly_quota, accent, display_order)
values
  ('free', 'Free', '$0', 0, 'forever',
   'For trying it out.',
   '["30 replies per month","All 6 platforms","Voice profile from 3 samples","Basic reply history"]'::jsonb,
   'Get started', false, 30, 'sky', 0),
  ('pro', 'Pro', '$9', 900, '/ month',
   'For people who reply a lot.',
   '["Unlimited replies","Voice learning from every send","Per-platform default tone & goal","Full searchable history","Priority support"]'::jsonb,
   'Start Pro', true, null, 'violet', 1),
  ('team', 'Team', 'Contact', 0, 'us',
   'For sales, support, and CS teams.',
   '["Everything in Pro","Shared brand voice profile","Per-seat billing","Admin controls + SSO"]'::jsonb,
   'Talk to us', false, null, 'emerald', 2)
on conflict (id) do nothing;

alter table public.profiles
  add column if not exists role text not null default 'user';
alter table public.profiles
  add column if not exists onboarded boolean not null default false;

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (select role = 'admin' from public.profiles where id = auth.uid()),
    false
  )
$$;

drop policy if exists "profiles_admin_select_all" on public.profiles;
create policy "profiles_admin_select_all" on public.profiles
  for select using (public.is_admin());
