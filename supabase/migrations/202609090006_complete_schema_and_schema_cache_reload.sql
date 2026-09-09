-- GramCare / GramSwasthya Complete Consolidated Database Migration (SIH26133)
-- Run this complete SQL script in your Supabase SQL Editor (Dashboard > SQL Editor > New Query > Run)

-- 1. Enable Extensions
create extension if not exists "pgcrypto";

-- 2. Create Enums Safely
do $$ begin
  create type public.user_role as enum ('doctor', 'asha', 'anm', 'admin', 'patient', 'medical_officer', 'hospital');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.gender as enum ('female', 'male', 'other', 'unknown');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.risk_level as enum ('low', 'medium', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.referral_status as enum ('pending', 'accepted', 'in_transit', 'arrived', 'treatment_started', 'completed', 'cancelled', 'rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.follow_up_status as enum ('scheduled', 'completed', 'missed');
exception when duplicate_object then null; end $$;

-- 3. Create Facilities Table
create table if not exists public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  village text,
  address text,
  created_at timestamptz not null default now()
);

-- 4. Create Users Table
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role public.user_role not null default 'asha',
  phone text,
  email text,
  facility_id uuid references public.facilities(id) on delete set null,
  avatar_url text,
  gender text,
  dob text,
  address text,
  city text,
  state text,
  pincode text,
  department text,
  designation text,
  assigned_area text,
  joining_date date,
  staff_id text,
  created_at timestamptz not null default now()
);

-- 5. Create Patients Table
create table if not exists public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age smallint not null check (age between 0 and 130),
  gender public.gender not null default 'unknown',
  village text,
  address text,
  phone text,
  guardian_name text,
  emergency_contact text,
  blood_group text,
  existing_conditions text[],
  allergies text[],
  current_medications text[],
  gram_panchayat text,
  block text,
  district text,
  state text,
  pincode text,
  phc_assigned text,
  village_id text,
  dob text,
  preferred_language text default 'en',
  emergency_contact_name text,
  emergency_contact_relation text,
  emergency_contact_phone text,
  marital_status text,
  occupation text,
  rh_factor text,
  family_history text,
  lifestyle_risk jsonb default '{"tobacco": false, "alcohol": false, "nutrition": "normal"}'::jsonb,
  womens_health jsonb,
  child_health jsonb,
  registered_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Add missing columns if patients table existed previously
alter table public.patients add column if not exists emergency_contact text;
alter table public.patients add column if not exists blood_group text;
alter table public.patients add column if not exists existing_conditions text[];
alter table public.patients add column if not exists allergies text[];
alter table public.patients add column if not exists current_medications text[];
alter table public.patients add column if not exists gram_panchayat text;
alter table public.patients add column if not exists block text;
alter table public.patients add column if not exists district text;
alter table public.patients add column if not exists state text;
alter table public.patients add column if not exists pincode text;
alter table public.patients add column if not exists phc_assigned text;
alter table public.patients add column if not exists village_id text;
alter table public.patients add column if not exists dob text;
alter table public.patients add column if not exists preferred_language text default 'en';
alter table public.patients add column if not exists emergency_contact_name text;
alter table public.patients add column if not exists emergency_contact_relation text;
alter table public.patients add column if not exists emergency_contact_phone text;
alter table public.patients add column if not exists marital_status text;
alter table public.patients add column if not exists occupation text;
alter table public.patients add column if not exists rh_factor text;
alter table public.patients add column if not exists family_history text;
alter table public.patients add column if not exists lifestyle_risk jsonb default '{"tobacco": false, "alcohol": false, "nutrition": "normal"}'::jsonb;
alter table public.patients add column if not exists womens_health jsonb;
alter table public.patients add column if not exists child_health jsonb;
alter table public.patients add column if not exists registered_by uuid references public.users(id) on delete set null;

-- 6. Create Health Records Table
create table if not exists public.health_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_by uuid references public.users(id) on delete set null,
  systolic_bp smallint,
  diastolic_bp smallint,
  blood_sugar numeric(6,2),
  weight_kg numeric(5,2),
  temperature_c numeric(4,1),
  pulse_bpm smallint,
  spo2 smallint,
  height_cm numeric(5,2),
  bmi numeric(4,1),
  respiratory_rate smallint,
  hemoglobin numeric(4,1),
  source_device text default 'manual_input',
  symptoms text,
  notes text,
  recorded_at timestamptz not null default now()
);

-- 7. Create Risk Assessments Table
create table if not exists public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  health_record_id uuid references public.health_records(id) on delete set null,
  risk_score numeric(5,2) not null,
  risk_level public.risk_level not null default 'low',
  model_version text not null default 'v2.4',
  override_reason text,
  overridden_by uuid references public.users(id) on delete set null,
  assessed_at timestamptz not null default now()
);

-- 8. Create Referrals Table
create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  risk_assessment_id uuid references public.risk_assessments(id) on delete set null,
  referred_by uuid references public.users(id) on delete set null,
  referred_to_facility_id uuid references public.facilities(id) on delete set null,
  referred_to_doctor_id uuid references public.users(id) on delete set null,
  referred_to_text text,
  receiving_hospital_name text,
  reason text not null,
  priority text default 'routine',
  symptoms text,
  clinical_notes text,
  treatment_summary text,
  rejection_reason text,
  ambulance_assigned text,
  expected_visit_date date,
  status public.referral_status not null default 'pending',
  created_at timestamptz not null default now()
);

-- 9. Create Referral Events Audit Table
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  status public.referral_status not null,
  changed_by uuid references public.users(id) on delete set null,
  notes text,
  ambulance_info jsonb,
  created_at timestamptz not null default now()
);

-- 10. Create Visits Table
create table if not exists public.visits (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_by uuid references public.users(id) on delete set null,
  location text,
  chief_complaint text,
  symptoms text,
  observations text,
  vitals jsonb,
  assessment text,
  treatment text,
  prescription text,
  advice text,
  follow_up_date date,
  notes text,
  created_at timestamptz not null default now()
);

-- 11. Create Follow-ups Table
create table if not exists public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references public.referrals(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  scheduled_date date not null,
  status public.follow_up_status not null default 'scheduled',
  notes text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

-- 12. Create User Preferences Table
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

-- 13. Create Notifications Table
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

-- 14. Create Audit Logs Table
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  details jsonb,
  created_at timestamptz not null default now()
);

-- 15. Helper Functions
create or replace function public.current_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select coalesce(role, 'asha'::public.user_role) from public.users where id = auth.uid()
$$;

create or replace function public.can_access_patient(target_patient uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.patients p where p.id = target_patient
  )
$$;

-- 16. Enable Row Level Security (RLS) on ALL tables
alter table public.facilities enable row level security;
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.patients enable row level security;
alter table public.health_records enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.referrals enable row level security;
alter table public.referral_events enable row level security;
alter table public.visits enable row level security;
alter table public.follow_ups enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- 17. Clean & Create RLS Policies
-- Facilities
drop policy if exists "facilities_select" on public.facilities;
create policy "facilities_select" on public.facilities for select to authenticated using (true);

-- Users
drop policy if exists "users_select" on public.users;
drop policy if exists "users_insert" on public.users;
drop policy if exists "users_update" on public.users;
create policy "users_select" on public.users for select to authenticated using (true);
create policy "users_insert" on public.users for insert to authenticated with check (true);
create policy "users_update" on public.users for update to authenticated using (true) with check (true);

-- User Preferences
drop policy if exists "user_preferences_select" on public.user_preferences;
drop policy if exists "user_preferences_insert" on public.user_preferences;
drop policy if exists "user_preferences_update" on public.user_preferences;
create policy "user_preferences_select" on public.user_preferences for select to authenticated using (true);
create policy "user_preferences_insert" on public.user_preferences for insert to authenticated with check (true);
create policy "user_preferences_update" on public.user_preferences for update to authenticated using (true) with check (true);

-- Patients
drop policy if exists "patients_select" on public.patients;
drop policy if exists "patients_insert" on public.patients;
drop policy if exists "patients_update" on public.patients;
drop policy if exists "patients_delete" on public.patients;
create policy "patients_select" on public.patients for select to authenticated using (true);
create policy "patients_insert" on public.patients for insert to authenticated with check (true);
create policy "patients_update" on public.patients for update to authenticated using (true) with check (true);
create policy "patients_delete" on public.patients for delete to authenticated using (true);

-- Health Records
drop policy if exists "records_select" on public.health_records;
drop policy if exists "records_insert" on public.health_records;
drop policy if exists "records_update" on public.health_records;
create policy "records_select" on public.health_records for select to authenticated using (true);
create policy "records_insert" on public.health_records for insert to authenticated with check (true);
create policy "records_update" on public.health_records for update to authenticated using (true) with check (true);

-- Risk Assessments
drop policy if exists "risk_select" on public.risk_assessments;
drop policy if exists "risk_insert" on public.risk_assessments;
drop policy if exists "risk_update" on public.risk_assessments;
create policy "risk_select" on public.risk_assessments for select to authenticated using (true);
create policy "risk_insert" on public.risk_assessments for insert to authenticated with check (true);
create policy "risk_update" on public.risk_assessments for update to authenticated using (true) with check (true);

-- Referrals
drop policy if exists "referrals_select" on public.referrals;
drop policy if exists "referrals_insert" on public.referrals;
drop policy if exists "referrals_update" on public.referrals;
create policy "referrals_select" on public.referrals for select to authenticated using (true);
create policy "referrals_insert" on public.referrals for insert to authenticated with check (true);
create policy "referrals_update" on public.referrals for update to authenticated using (true) with check (true);

-- Referral Events
drop policy if exists "ref_events_select" on public.referral_events;
drop policy if exists "ref_events_insert" on public.referral_events;
create policy "ref_events_select" on public.referral_events for select to authenticated using (true);
create policy "ref_events_insert" on public.referral_events for insert to authenticated with check (true);

-- Visits
drop policy if exists "visits_select" on public.visits;
drop policy if exists "visits_insert" on public.visits;
create policy "visits_select" on public.visits for select to authenticated using (true);
create policy "visits_insert" on public.visits for insert to authenticated with check (true);

-- Follow-ups
drop policy if exists "followups_select" on public.follow_ups;
drop policy if exists "followups_insert" on public.follow_ups;
drop policy if exists "followups_update" on public.follow_ups;
create policy "followups_select" on public.follow_ups for select to authenticated using (true);
create policy "followups_insert" on public.follow_ups for insert to authenticated with check (true);
create policy "followups_update" on public.follow_ups for update to authenticated using (true) with check (true);

-- Notifications
drop policy if exists "notifications_select" on public.notifications;
drop policy if exists "notifications_insert" on public.notifications;
drop policy if exists "notifications_update" on public.notifications;
create policy "notifications_select" on public.notifications for select to authenticated using (true);
create policy "notifications_insert" on public.notifications for insert to authenticated with check (true);
create policy "notifications_update" on public.notifications for update to authenticated using (true) with check (true);

-- Audit Logs
drop policy if exists "audit_logs_select" on public.audit_logs;
drop policy if exists "audit_logs_insert" on public.audit_logs;
create policy "audit_logs_select" on public.audit_logs for select to authenticated using (true);
create policy "audit_logs_insert" on public.audit_logs for insert to authenticated with check (true);

-- 18. Auto-Sync User Profile Trigger on Auth Signup
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  requested_role_text text;
  assigned_role public.user_role;
begin
  requested_role_text := coalesce(new.raw_user_meta_data->>'requested_role', new.raw_user_meta_data->>'role', 'asha');
  begin
    assigned_role := requested_role_text::public.user_role;
  exception when others then
    assigned_role := 'asha'::public.user_role;
  end;

  insert into public.users (id, name, role, phone, email)
  values (
    new.id, 
    coalesce(new.raw_user_meta_data->>'name', 'Healthcare Staff'), 
    assigned_role,
    new.phone, 
    new.email
  )
  on conflict (id) do update set
    name = coalesce(excluded.name, public.users.name),
    role = coalesce(excluded.role, public.users.role),
    email = coalesce(excluded.email, public.users.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- 19. Reload PostgREST Schema Cache Immediately
notify pgrst, 'reload schema';
