-- GramCare / GramSwasthya Complete Platform Upgrade Migration (SIH26133)
-- Adds extended roles, full referral lifecycle, clinical visits, referral events, and RLS policies.

-- 1. Extend user_role enum
alter type public.user_role add value if not exists 'patient';
alter type public.user_role add value if not exists 'medical_officer';
alter type public.user_role add value if not exists 'hospital';

-- 2. Extend referral_status enum
alter type public.referral_status add value if not exists 'in_transit';
alter type public.referral_status add value if not exists 'arrived';
alter type public.referral_status add value if not exists 'treatment_started';
alter type public.referral_status add value if not exists 'rejected';

-- 3. Extend public.patients table with location, identity, emergency, and clinical metadata
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

-- 4. Extend public.health_records table with additional vitals
alter table public.health_records add column if not exists height_cm numeric(5,2);
alter table public.health_records add column if not exists bmi numeric(4,1);
alter table public.health_records add column if not exists respiratory_rate smallint;
alter table public.health_records add column if not exists hemoglobin numeric(4,1);
alter table public.health_records add column if not exists source_device text default 'manual_input';

-- 5. Extend public.referrals table
alter table public.referrals add column if not exists receiving_hospital_name text;
alter table public.referrals add column if not exists treatment_summary text;
alter table public.referrals add column if not exists rejection_reason text;
alter table public.referrals add column if not exists ambulance_assigned text;

-- 6. Create public.visits (Clinical encounters) table
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

-- 7. Create public.referral_events (Referral status audit trail) table
create table if not exists public.referral_events (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid not null references public.referrals(id) on delete cascade,
  status public.referral_status not null,
  changed_by uuid references public.users(id) on delete set null,
  notes text,
  ambulance_info jsonb,
  created_at timestamptz not null default now()
);

-- 8. Enable Row Level Security (RLS)
alter table public.visits enable row level security;
alter table public.referral_events enable row level security;

-- 9. RLS Policies
create policy "staff see permitted visits" on public.visits 
  for select to authenticated using (public.can_access_patient(patient_id));

create policy "authorized staff create visits" on public.visits 
  for insert to authenticated with check (recorded_by = auth.uid() and public.can_access_patient(patient_id));

create policy "staff see referral events" on public.referral_events 
  for select to authenticated using (true);

create policy "authorized staff insert referral events" on public.referral_events 
  for insert to authenticated with check (changed_by = auth.uid());

-- 10. Indexes for fast query resolution
create index if not exists visits_patient_created_idx on public.visits(patient_id, created_at desc);
create index if not exists referral_events_referral_idx on public.referral_events(referral_id, created_at asc);
