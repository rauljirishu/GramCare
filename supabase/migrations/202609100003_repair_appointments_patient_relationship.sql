-- Repair the live appointments -> patients relationship without recreating data.
-- The original appointments migration used CREATE TABLE IF NOT EXISTS, so an
-- older appointments table could exist without the foreign-key metadata that
-- PostgREST needs for nested patient selects.

DO $$
DECLARE
  patient_id_type text;
  appointment_patient_id_type text;
  has_patient_fk boolean;
BEGIN
  IF to_regclass('public.patients') IS NULL THEN
    RAISE EXCEPTION 'Required table public.patients does not exist';
  END IF;

  IF to_regclass('public.appointments') IS NULL THEN
    RAISE EXCEPTION 'Required table public.appointments does not exist';
  END IF;

  SELECT format_type(a.atttypid, a.atttypmod)
    INTO patient_id_type
    FROM pg_attribute a
   WHERE a.attrelid = 'public.patients'::regclass
     AND a.attname = 'id'
     AND NOT a.attisdropped;

  SELECT format_type(a.atttypid, a.atttypmod)
    INTO appointment_patient_id_type
    FROM pg_attribute a
   WHERE a.attrelid = 'public.appointments'::regclass
     AND a.attname = 'patient_id'
     AND NOT a.attisdropped;

  IF patient_id_type IS NULL OR appointment_patient_id_type IS NULL THEN
    RAISE EXCEPTION 'Required patient key columns are missing: patients.id=%, appointments.patient_id=%', patient_id_type, appointment_patient_id_type;
  END IF;

  IF patient_id_type <> 'uuid' OR appointment_patient_id_type <> 'uuid' THEN
    RAISE EXCEPTION 'Expected UUID relationship, found patients.id=% and appointments.patient_id=%', patient_id_type, appointment_patient_id_type;
  END IF;

  SELECT EXISTS (
    SELECT 1
      FROM pg_constraint c
      JOIN pg_attribute child_col
        ON child_col.attrelid = c.conrelid
       AND child_col.attnum = c.conkey[1]
      JOIN pg_attribute parent_col
        ON parent_col.attrelid = c.confrelid
       AND parent_col.attnum = c.confkey[1]
     WHERE c.contype = 'f'
       AND c.conrelid = 'public.appointments'::regclass
       AND c.confrelid = 'public.patients'::regclass
       AND array_length(c.conkey, 1) = 1
       AND array_length(c.confkey, 1) = 1
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
END
$$;

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

NOTIFY pgrst, 'reload schema';

-- The appointment list and insert-return query also nests doctor, facility,
-- and referral records. Repair those relationships for older live schemas.
DO $$
DECLARE
  appointment_column text;
  target_table text;
  target_column text;
  target_type text;
  source_type text;
  constraint_name text;
  relationship_exists boolean;
BEGIN
  FOR appointment_column, target_table, target_column, constraint_name IN
    VALUES
      ('doctor_id', 'public.users', 'id', 'appointments_doctor_id_users_id_fkey'),
      ('facility_id', 'public.facilities', 'id', 'appointments_facility_id_facilities_id_fkey'),
      ('referral_id', 'public.referrals', 'id', 'appointments_referral_id_referrals_id_fkey')
  LOOP
    IF to_regclass(target_table) IS NULL THEN
      RAISE EXCEPTION 'Required relationship target table % does not exist', target_table;
    END IF;

    SELECT format_type(a.atttypid, a.atttypmod)
      INTO source_type
      FROM pg_attribute a
     WHERE a.attrelid = 'public.appointments'::regclass
       AND a.attname = appointment_column
       AND NOT a.attisdropped;

    SELECT format_type(a.atttypid, a.atttypmod)
      INTO target_type
      FROM pg_attribute a
     WHERE a.attrelid = target_table::regclass
       AND a.attname = target_column
       AND NOT a.attisdropped;

    IF source_type IS NULL OR target_type IS NULL THEN
      RAISE EXCEPTION 'Required relationship columns are missing: appointments.%=% and %.%=%', appointment_column, source_type, target_table, target_column, target_type;
    END IF;

    IF source_type <> 'uuid' OR target_type <> 'uuid' THEN
      RAISE EXCEPTION 'Expected UUID relationship for appointments.% -> %.%, found % -> %', appointment_column, target_table, target_column, source_type, target_type;
    END IF;

    SELECT EXISTS (
      SELECT 1
        FROM pg_constraint c
        JOIN pg_attribute child_col
          ON child_col.attrelid = c.conrelid
         AND child_col.attnum = c.conkey[1]
        JOIN pg_attribute parent_col
          ON parent_col.attrelid = c.confrelid
         AND parent_col.attnum = c.confkey[1]
       WHERE c.contype = 'f'
         AND c.conrelid = 'public.appointments'::regclass
         AND c.confrelid = target_table::regclass
         AND array_length(c.conkey, 1) = 1
         AND array_length(c.confkey, 1) = 1
         AND child_col.attname = appointment_column
         AND parent_col.attname = target_column
    ) INTO relationship_exists;

    IF NOT relationship_exists THEN
      EXECUTE format(
        'ALTER TABLE public.appointments ADD CONSTRAINT %I FOREIGN KEY (%I) REFERENCES %s(%I) ON DELETE SET NULL',
        constraint_name, appointment_column, target_table, target_column
      );
    END IF;
  END LOOP;
END
$$;

NOTIFY pgrst, 'reload schema';

SELECT
  c.conname AS constraint_name,
  child_col.attname AS appointment_column,
  parent_table.relname AS referenced_table,
  parent_col.attname AS referenced_column
FROM pg_constraint c
JOIN pg_class child_table ON child_table.oid = c.conrelid
JOIN pg_class parent_table ON parent_table.oid = c.confrelid
JOIN pg_attribute child_col ON child_col.attrelid = c.conrelid AND child_col.attnum = c.conkey[1]
JOIN pg_attribute parent_col ON parent_col.attrelid = c.confrelid AND parent_col.attnum = c.confkey[1]
WHERE c.contype = 'f'
  AND child_table.relname = 'appointments'
  AND child_col.attname IN ('patient_id', 'doctor_id', 'facility_id', 'referral_id')
ORDER BY child_col.attname;