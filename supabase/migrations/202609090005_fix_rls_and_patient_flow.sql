-- GramCare / GramSwasthya Data Flow & RLS Fix Migration (SIH26133)
-- Fixes can_access_patient function and grants full RLS permissions for authenticated healthcare staff.

-- 1. Ensure user_role enum contains all healthcare roles
alter type public.user_role add value if not exists 'patient';
alter type public.user_role add value if not exists 'medical_officer';
alter type public.user_role add value if not exists 'hospital';

-- 2. Update can_access_patient function to grant access to all authenticated staff
create or replace function public.can_access_patient(target_patient uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.patients p
    where p.id = target_patient
    and (
      auth.role() = 'authenticated'
      or public.current_role() in ('admin', 'doctor', 'medical_officer', 'asha', 'anm', 'hospital')
      or p.registered_by = auth.uid()
    )
  )
$$;

-- 3. Update RLS policies for patients
drop policy if exists "staff see permitted patients" on public.patients;
drop policy if exists "field staff register patients" on public.patients;
drop policy if exists "registrars update their patients" on public.patients;
drop policy if exists "authenticated staff see patients" on public.patients;
drop policy if exists "authenticated staff insert patients" on public.patients;
drop policy if exists "authenticated staff update patients" on public.patients;

create policy "authenticated staff see patients" on public.patients 
  for select to authenticated using (true);

create policy "authenticated staff insert patients" on public.patients 
  for insert to authenticated with check (auth.role() = 'authenticated');

create policy "authenticated staff update patients" on public.patients 
  for update to authenticated using (true) with check (true);

create policy "authenticated staff delete patients" on public.patients 
  for delete to authenticated using (public.current_role() = 'admin' or registered_by = auth.uid());

-- 4. Update RLS policies for health_records
drop policy if exists "staff see permitted records" on public.health_records;
drop policy if exists "authorized staff create records" on public.health_records;
drop policy if exists "authenticated staff see records" on public.health_records;
drop policy if exists "authenticated staff insert records" on public.health_records;
drop policy if exists "authenticated staff update records" on public.health_records;

create policy "authenticated staff see records" on public.health_records 
  for select to authenticated using (true);

create policy "authenticated staff insert records" on public.health_records 
  for insert to authenticated with check (auth.role() = 'authenticated');

create policy "authenticated staff update records" on public.health_records 
  for update to authenticated using (true) with check (true);

-- 5. Update RLS policies for risk_assessments
drop policy if exists "staff see permitted risk" on public.risk_assessments;
drop policy if exists "authenticated staff insert risk" on public.risk_assessments;
drop policy if exists "authenticated staff see risk" on public.risk_assessments;
drop policy if exists "authenticated staff update risk" on public.risk_assessments;

create policy "authenticated staff see risk" on public.risk_assessments 
  for select to authenticated using (true);

create policy "authenticated staff insert risk" on public.risk_assessments 
  for insert to authenticated with check (auth.role() = 'authenticated');

create policy "authenticated staff update risk" on public.risk_assessments 
  for update to authenticated using (true) with check (true);

-- 6. Update RLS policies for referrals
drop policy if exists "staff see permitted referrals" on public.referrals;
drop policy if exists "authorized staff create referrals" on public.referrals;
drop policy if exists "doctors update assigned referrals" on public.referrals;
drop policy if exists "authenticated staff see referrals" on public.referrals;
drop policy if exists "authenticated staff insert referrals" on public.referrals;
drop policy if exists "authenticated staff update referrals" on public.referrals;

create policy "authenticated staff see referrals" on public.referrals 
  for select to authenticated using (true);

create policy "authenticated staff insert referrals" on public.referrals 
  for insert to authenticated with check (auth.role() = 'authenticated');

create policy "authenticated staff update referrals" on public.referrals 
  for update to authenticated using (true) with check (true);

-- 7. Update RLS policies for follow_ups
drop policy if exists "staff see permitted followups" on public.follow_ups;
drop policy if exists "authorized staff update followups" on public.follow_ups;
drop policy if exists "authorized staff create followups" on public.follow_ups;
drop policy if exists "authenticated staff see followups" on public.follow_ups;
drop policy if exists "authenticated staff insert followups" on public.follow_ups;
drop policy if exists "authenticated staff update followups" on public.follow_ups;

create policy "authenticated staff see followups" on public.follow_ups 
  for select to authenticated using (true);

create policy "authenticated staff insert followups" on public.follow_ups 
  for insert to authenticated with check (auth.role() = 'authenticated');

create policy "authenticated staff update followups" on public.follow_ups 
  for update to authenticated using (true) with check (true);

-- 8. Update RLS policies for users
drop policy if exists "users see their own profile" on public.users;
drop policy if exists "users update own profile" on public.users;
drop policy if exists "authenticated users see profiles" on public.users;
drop policy if exists "authenticated users insert profile" on public.users;
drop policy if exists "authenticated users update profiles" on public.users;

create policy "authenticated users see profiles" on public.users 
  for select to authenticated using (true);

create policy "authenticated users insert profile" on public.users 
  for insert to authenticated with check (true);

create policy "authenticated users update profiles" on public.users 
  for update to authenticated using (id = auth.uid() or public.current_role() = 'admin') with check (true);

-- 9. Trigger to auto-create / sync public.users profile with metadata role
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
