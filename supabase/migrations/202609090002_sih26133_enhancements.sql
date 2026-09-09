-- GramCare / GramSwasthya SIH26133 Enhancements Migration
-- Adds extended patient fields, audit logging, notifications, and referral priority columns safely.

alter table public.patients add column if not exists emergency_contact text;
alter table public.patients add column if not exists blood_group text;
alter table public.patients add column if not exists existing_conditions text[];
alter table public.patients add column if not exists allergies text[];
alter table public.patients add column if not exists current_medications text[];

alter table public.referrals add column if not exists priority text default 'routine';
alter table public.referrals add column if not exists symptoms text;
alter table public.referrals add column if not exists clinical_notes text;
alter table public.referrals add column if not exists expected_visit_date date;

-- Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- Notifications Table
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  patient_id uuid references public.patients(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'system',
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.audit_logs enable row level security;
alter table public.notifications enable row level security;

-- Policies for Audit Logs
create policy "authenticated users view audit logs" on public.audit_logs for select to authenticated using (true);
create policy "authenticated users insert audit logs" on public.audit_logs for insert to authenticated with check (true);

-- Policies for Notifications
create policy "users view relevant notifications" on public.notifications for select to authenticated using (true);
create policy "users update own notifications" on public.notifications for update to authenticated using (true);
create policy "authenticated users insert notifications" on public.notifications for insert to authenticated with check (true);

-- Indexes
create index if not exists audit_logs_created_at_idx on public.audit_logs(created_at desc);
create index if not exists notifications_user_read_idx on public.notifications(user_id, is_read);
