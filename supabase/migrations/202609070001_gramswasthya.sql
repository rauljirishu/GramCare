-- GramSwasthya core schema. Run in the Supabase SQL editor or migrations folder.
create extension if not exists "pgcrypto";

create type public.user_role as enum ('doctor', 'asha', 'anm', 'admin');
create type public.gender as enum ('female', 'male', 'other', 'unknown');
create type public.risk_level as enum ('low', 'medium', 'high');
create type public.referral_status as enum ('pending', 'accepted', 'completed', 'cancelled');
create type public.follow_up_status as enum ('scheduled', 'completed', 'missed');

create table public.facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  village text,
  address text,
  created_at timestamptz not null default now()
);

-- A profile is created after signup. Its id deliberately equals auth.users.id.
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role public.user_role not null,
  phone text unique,
  email text unique,
  facility_id uuid references public.facilities(id) on delete set null,
  created_at timestamptz not null default now(),
  constraint users_phone_format check (phone is null or phone ~ '^[0-9+() -]{7,20}$')
);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  age smallint not null check (age between 0 and 130),
  gender public.gender not null default 'unknown',
  village text,
  address text,
  phone text,
  guardian_name text,
  registered_by uuid not null references public.users(id) on delete restrict,
  created_at timestamptz not null default now()
);

create table public.health_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  recorded_by uuid not null references public.users(id) on delete restrict,
  systolic_bp smallint check (systolic_bp between 40 and 300),
  diastolic_bp smallint check (diastolic_bp between 20 and 200),
  blood_sugar numeric(6,2) check (blood_sugar >= 0),
  weight_kg numeric(5,2) check (weight_kg > 0 and weight_kg < 500),
  temperature_c numeric(4,1) check (temperature_c between 25 and 45),
  pulse_bpm smallint check (pulse_bpm between 20 and 300),
  spo2 smallint check (spo2 between 0 and 100),
  symptoms text,
  notes text,
  recorded_at timestamptz not null default now()
);

create table public.risk_assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  health_record_id uuid references public.health_records(id) on delete set null,
  risk_score numeric(5,2) not null check (risk_score between 0 and 100),
  risk_level public.risk_level not null,
  model_version text not null,
  assessed_at timestamptz not null default now()
);

create table public.referrals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.patients(id) on delete cascade,
  risk_assessment_id uuid references public.risk_assessments(id) on delete set null,
  referred_by uuid not null references public.users(id) on delete restrict,
  referred_to_facility_id uuid references public.facilities(id) on delete set null,
  referred_to_doctor_id uuid references public.users(id) on delete set null,
  referred_to_text text,
  reason text not null check (char_length(reason) >= 3),
  status public.referral_status not null default 'pending',
  created_at timestamptz not null default now(),
  constraint referral_destination check (referred_to_facility_id is not null or referred_to_doctor_id is not null or referred_to_text is not null)
);

create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  referral_id uuid references public.referrals(id) on delete set null,
  patient_id uuid not null references public.patients(id) on delete cascade,
  scheduled_date date not null,
  status public.follow_up_status not null default 'scheduled',
  notes text,
  updated_by uuid references public.users(id) on delete set null,
  updated_at timestamptz not null default now()
);

create index patients_registered_by_idx on public.patients(registered_by);
create index health_records_patient_recorded_idx on public.health_records(patient_id, recorded_at desc);
create index risk_assessments_patient_assessed_idx on public.risk_assessments(patient_id, assessed_at desc);
create index referrals_patient_status_idx on public.referrals(patient_id, status);
create index referrals_doctor_status_idx on public.referrals(referred_to_doctor_id, status);
create index follow_ups_patient_date_idx on public.follow_ups(patient_id, scheduled_date);

create or replace function public.current_role() returns public.user_role
language sql stable security definer set search_path = public as $$
  select role from public.users where id = auth.uid()
$$;
create or replace function public.current_facility_id() returns uuid
language sql stable security definer set search_path = public as $$
  select facility_id from public.users where id = auth.uid()
$$;
create or replace function public.can_access_patient(target_patient uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.patients p join public.users registrar on registrar.id = p.registered_by
    where p.id = target_patient and (
      p.registered_by = auth.uid()
      or public.current_role() = 'admin'
      or (public.current_role() = 'doctor' and registrar.facility_id is not null and registrar.facility_id = public.current_facility_id())
      or (public.current_role() = 'doctor' and exists (select 1 from public.referrals r where r.patient_id = p.id and r.referred_to_doctor_id = auth.uid()))
    )
  )
$$;

alter table public.facilities enable row level security;
alter table public.users enable row level security;
alter table public.patients enable row level security;
alter table public.health_records enable row level security;
alter table public.risk_assessments enable row level security;
alter table public.referrals enable row level security;
alter table public.follow_ups enable row level security;

create policy "authenticated users can view facilities" on public.facilities for select to authenticated using (true);
create policy "users see their own profile" on public.users for select to authenticated using (id = auth.uid() or public.current_role() = 'admin');
create policy "users update own profile" on public.users for update to authenticated using (id = auth.uid() or public.current_role() = 'admin') with check (id = auth.uid() or public.current_role() = 'admin');

create policy "staff see permitted patients" on public.patients for select to authenticated using (public.can_access_patient(id));
create policy "field staff register patients" on public.patients for insert to authenticated with check (registered_by = auth.uid() and public.current_role() in ('asha', 'anm', 'admin'));
create policy "registrars update their patients" on public.patients for update to authenticated using (registered_by = auth.uid() or public.current_role() = 'admin') with check (registered_by = auth.uid() or public.current_role() = 'admin');

create policy "staff see permitted records" on public.health_records for select to authenticated using (public.can_access_patient(patient_id));
create policy "authorized staff create records" on public.health_records for insert to authenticated with check (recorded_by = auth.uid() and public.can_access_patient(patient_id));
create policy "staff see permitted risk" on public.risk_assessments for select to authenticated using (public.can_access_patient(patient_id));
create policy "staff see permitted referrals" on public.referrals for select to authenticated using (public.can_access_patient(patient_id) or referred_to_doctor_id = auth.uid());
create policy "authorized staff create referrals" on public.referrals for insert to authenticated with check (referred_by = auth.uid() and public.can_access_patient(patient_id));
create policy "doctors update assigned referrals" on public.referrals for update to authenticated using (referred_to_doctor_id = auth.uid() or referred_by = auth.uid() or public.current_role() = 'admin');
create policy "staff see permitted followups" on public.follow_ups for select to authenticated using (public.can_access_patient(patient_id));
create policy "authorized staff update followups" on public.follow_ups for update to authenticated using (public.can_access_patient(patient_id)) with check (updated_by = auth.uid());
create policy "authorized staff create followups" on public.follow_ups for insert to authenticated with check (updated_by = auth.uid() and public.can_access_patient(patient_id));

-- Create a least-privilege profile at registration. Promote verified clinicians to
-- doctor/admin with a server-side admin workflow; never trust signup metadata for roles.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.users (id, name, role, phone, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'New user'), 'asha',
          new.phone, new.email);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
