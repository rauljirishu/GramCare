-- Repair legacy patient tables so they accept the current Patient Directory form.
-- Every statement is additive and safe to run against an already-upgraded project.

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_code text,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS block text,
  ADD COLUMN IF NOT EXISTS district text,
  ADD COLUMN IF NOT EXISTS state text,
  ADD COLUMN IF NOT EXISTS pincode text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS location_accuracy double precision,
  ADD COLUMN IF NOT EXISTS location_captured_at timestamptz,
  ADD COLUMN IF NOT EXISTS location_source text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS guardian_name text,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS gram_panchayat text,
  ADD COLUMN IF NOT EXISTS phc_assigned text,
  ADD COLUMN IF NOT EXISTS allergies text[],
  ADD COLUMN IF NOT EXISTS existing_conditions text[],
  ADD COLUMN IF NOT EXISTS current_medications text[],
  ADD COLUMN IF NOT EXISTS assigned_worker text,
  ADD COLUMN IF NOT EXISTS last_visit_date date,
  ADD COLUMN IF NOT EXISTS next_follow_up_date date,
  ADD COLUMN IF NOT EXISTS referral_status text,
  ADD COLUMN IF NOT EXISTS referred_hospital text,
  ADD COLUMN IF NOT EXISTS notes text,
  ADD COLUMN IF NOT EXISTS symptoms text,
  ADD COLUMN IF NOT EXISTS risk_level text,
  ADD COLUMN IF NOT EXISTS risk_score numeric(5,2),
  ADD COLUMN IF NOT EXISTS registered_by uuid;

-- Refresh the PostgREST metadata used by the Supabase browser client.
NOTIFY pgrst, 'reload schema';
