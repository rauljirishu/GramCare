-- =========================================================
-- GRAMCARE APPOINTMENT RELATIONSHIP FIX
-- Fixes: appointments -> users relationship
-- =========================================================

-- 1. Make sure appointments table exists
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id uuid NOT NULL,
    doctor_id uuid,
    facility_id uuid,
    referral_id uuid,
    appointment_date timestamptz NOT NULL,
    purpose text NOT NULL,
    status text NOT NULL DEFAULT 'scheduled',
    clinical_notes text,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Add missing columns safely
ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS patient_id uuid;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS doctor_id uuid;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS facility_id uuid;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS referral_id uuid;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS appointment_date timestamptz;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS purpose text;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS status text DEFAULT 'scheduled';

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS clinical_notes text;

ALTER TABLE public.appointments
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();


-- =========================================================
-- 3. FIX PATIENT FOREIGN KEY
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'appointments'
          AND c.contype = 'f'
          AND pg_get_constraintdef(c.oid)
              ILIKE '%FOREIGN KEY (patient_id) REFERENCES public.patients(id)%'
    ) THEN

        ALTER TABLE public.appointments
        ADD CONSTRAINT appointments_patient_id_fkey
        FOREIGN KEY (patient_id)
        REFERENCES public.patients(id)
        ON DELETE CASCADE;

    END IF;
END $$;


-- =========================================================
-- 4. FIX DOCTOR -> USERS FOREIGN KEY
-- THIS IS THE MAIN FIX FOR YOUR ERROR
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'appointments'
          AND c.contype = 'f'
          AND pg_get_constraintdef(c.oid)
              ILIKE '%FOREIGN KEY (doctor_id) REFERENCES public.users(id)%'
    ) THEN

        ALTER TABLE public.appointments
        ADD CONSTRAINT appointments_doctor_id_fkey
        FOREIGN KEY (doctor_id)
        REFERENCES public.users(id)
        ON DELETE SET NULL;

    END IF;
END $$;


-- =========================================================
-- 5. FIX FACILITY FOREIGN KEY
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'appointments'
          AND c.contype = 'f'
          AND pg_get_constraintdef(c.oid)
              ILIKE '%FOREIGN KEY (facility_id) REFERENCES public.facilities(id)%'
    ) THEN

        ALTER TABLE public.appointments
        ADD CONSTRAINT appointments_facility_id_fkey
        FOREIGN KEY (facility_id)
        REFERENCES public.facilities(id)
        ON DELETE SET NULL;

    END IF;
END $$;


-- =========================================================
-- 6. FIX REFERRAL FOREIGN KEY
-- =========================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        JOIN pg_namespace n ON n.oid = t.relnamespace
        WHERE n.nspname = 'public'
          AND t.relname = 'appointments'
          AND c.contype = 'f'
          AND pg_get_constraintdef(c.oid)
              ILIKE '%FOREIGN KEY (referral_id) REFERENCES public.referrals(id)%'
    ) THEN

        ALTER TABLE public.appointments
        ADD CONSTRAINT appointments_referral_id_fkey
        FOREIGN KEY (referral_id)
        REFERENCES public.referrals(id)
        ON DELETE SET NULL;

    END IF;
END $$;


-- =========================================================
-- 7. RELOAD POSTGREST SCHEMA CACHE
-- =========================================================

NOTIFY pgrst, 'reload schema';


-- =========================================================
-- 8. VERIFY THE RELATIONSHIP
-- =========================================================

SELECT
    tc.constraint_name,
    kcu.column_name,
    ccu.table_schema AS referenced_schema,
    ccu.table_name AS referenced_table,
    ccu.column_name AS referenced_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'appointments'
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;
