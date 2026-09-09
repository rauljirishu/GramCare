-- GramCare / GramSwasthya Extended User Profiles & User Preferences Migration

-- 1. Extend public.users table with profile fields
alter table public.users add column if not exists avatar_url text;
alter table public.users add column if not exists gender text;
alter table public.users add column if not exists dob text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists state text;
alter table public.users add column if not exists pincode text;
alter table public.users add column if not exists department text;
alter table public.users add column if not exists designation text;
alter table public.users add column if not exists assigned_area text;
alter table public.users add column if not exists joining_date date;
alter table public.users add column if not exists staff_id text;

-- 2. Create public.user_preferences table
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete cascade,
  theme text not null default 'light',
  language text not null default 'en',
  font_size text not null default 'default',
  high_contrast boolean not null default false,
  reduced_motion boolean not null default false,
  notification_preferences jsonb not null default '{"referrals": true, "follow_ups": true, "high_risk": true, "system": true}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- Policies for user_preferences
create policy "users select own preferences" on public.user_preferences 
  for select to authenticated using (user_id = auth.uid() or public.current_role() = 'admin');

create policy "users insert own preferences" on public.user_preferences 
  for insert to authenticated with check (user_id = auth.uid() or public.current_role() = 'admin');

create policy "users update own preferences" on public.user_preferences 
  for update to authenticated using (user_id = auth.uid() or public.current_role() = 'admin') 
  with check (user_id = auth.uid() or public.current_role() = 'admin');

-- Index
create index if not exists user_preferences_user_id_idx on public.user_preferences(user_id);
