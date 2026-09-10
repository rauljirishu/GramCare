-- Fix appointments schema relationships & reload PostgREST schema cache.
-- Safe, idempotent script that preserves all existing data and prevents duplicate constraints/policies.

DO $$
DECLARE
  has_patient_fk boolean;
  has_doctor_fk boolean;
  has_facility_fk boolean;
  has_referral_fk boolean;
BEGIN
  -- 1. Ensure required tables exist
  IF to_regclass('public.appointments') IS NULL THEN
    RAISE EXCEPTION 'Required table public.appointments does not exist';
  END IF;

  IF to_regclass('public.patients') IS NULL THEN
    RAISE EXCEPTION 'Required table public.patients does not exist';
  END IF;

  IF to_regclass('public.users') IS NULL THEN
    RAISE EXCEPTION 'Required table public.users does not exist';
  END IF;

  IF to_regclass('public.facilities') IS NULL THEN
    RAISE EXCEPTION 'Required table public.facilities does not exist';
  END IF;

  -- 2. Check and add appointments -> patients foreign key (patient_id -> patients.id)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute child_col ON child_col.attrelid = c.conrelid AND child_col.attnum = c.conkey[1]
    JOIN pg_attribute parent_col ON parent_col.attrelid = c.confrelid AND parent_col.attnum = c.confkey[1]
    WHERE c.contype = 'f'
      AND c.conrelid = 'public.appointments'::regclass
      AND c.confrelid = 'public.patients'::regclass
      AND child_col.attname = 'patient_id'
      AND parent_col.attname = 'id'
  ) INTO has_patient_fk;

  IF NOT has_patient_fk THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_patient_id_fkey
      FOREIGN KEY (patient_id)
      REFERENCES public.patients(id)
      ON DELETE CASCADE;
  END IF;

  -- 3. Check and add appointments -> users foreign key (doctor_id -> users.id)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute child_col ON child_col.attrelid = c.conrelid AND child_col.attnum = c.conkey[1]
    JOIN pg_attribute parent_col ON parent_col.attrelid = c.confrelid AND parent_col.attnum = c.confkey[1]
    WHERE c.contype = 'f'
      AND c.conrelid = 'public.appointments'::regclass
      AND c.confrelid = 'public.users'::regclass
      AND child_col.attname = 'doctor_id'
      AND parent_col.attname = 'id'
  ) INTO has_doctor_fk;

  IF NOT has_doctor_fk THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_doctor_id_users_id_fkey
      FOREIGN KEY (doctor_id)
      REFERENCES public.users(id)
      ON DELETE SET NULL;
  END IF;

  -- 4. Check and add appointments -> facilities foreign key (facility_id -> facilities.id)
  SELECT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_attribute child_col ON child_col.attrelid = c.conrelid AND child_col.attnum = c.conkey[1]
    JOIN pg_attribute parent_col ON parent_col.attrelid = c.confrelid AND parent_col.attnum = c.confkey[1]
    WHERE c.contype = 'f'
      AND c.conrelid = 'public.appointments'::regclass
      AND c.confrelid = 'public.facilities'::regclass
      AND child_col.attname = 'facility_id'
      AND parent_col.attname = 'id'
  ) INTO has_facility_fk;

  IF NOT has_facility_fk THEN
    ALTER TABLE public.appointments
      ADD CONSTRAINT appointments_facility_id_facilities_id_fkey
      FOREIGN KEY (facility_id)
      REFERENCES public.facilities(id)
      ON DELETE SET NULL;
  END IF;

  -- 5. Check and add appointments -> referrals foreign key (referral_id -> referrals.id)
  IF to_regclass('public.referrals') IS NOT NULL THEN
    SELECT EXISTS (
      SELECT 1 FROM pg_constraint c
      JOIN pg_attribute child_col ON child_col.attrelid = c.conrelid AND child_col.attnum = c.conkey[1]
      JOIN pg_attribute parent_col ON parent_col.attrelid = c.confrelid AND parent_col.attnum = c.confkey[1]
      WHERE c.contype = 'f'
        AND c.conrelid = 'public.appointments'::regclass
        AND c.confrelid = 'public.referrals'::regclass
        AND child_col.attname = 'referral_id'
        AND parent_col.attname = 'id'
    ) INTO has_referral_fk;

    IF NOT has_referral_fk THEN
      ALTER TABLE public.appointments
        ADD CONSTRAINT appointments_referral_id_referrals_id_fkey
        FOREIGN KEY (referral_id)
        REFERENCES public.referrals(id)
        ON DELETE SET NULL;
    END IF;
  END IF;

END
$$;

-- 6. Enable RLS and create non-duplicating policies
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
CREATE POLICY "appointments_select"
  ON public.appointments FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
CREATE POLICY "appointments_insert"
  ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_update"
  ON public.appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 7. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
