-- Enforce strict four-tier role-based access control and data privacy policies.
-- 1. Central Authority: full authorised access across all PHCs, patients, referrals, follow-ups, workers, and vitals.
-- 2. Area / PHC Head: access strictly scoped to their assigned PHC/facility and related records.
-- 3. PHC Worker / ASHA / ANM: access strictly scoped to their assigned PHC; can register patients, record vitals, create referrals, complete follow-ups.
-- 4. Patient: read-only access restricted strictly to their own linked patient record, referrals, and follow-ups.

CREATE OR REPLACE FUNCTION public.current_grams_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT coalesce(
    (
      CASE (SELECT role::text FROM public.users WHERE id = auth.uid())
        WHEN 'admin' THEN 'central_authority'
        WHEN 'medical_officer' THEN 'central_authority'
        WHEN 'asha' THEN 'phc_worker'
        WHEN 'anm' THEN 'phc_worker'
        ELSE (SELECT role::text FROM public.users WHERE id = auth.uid())
      END
    ),
    'patient'
  );
$$;

CREATE OR REPLACE FUNCTION public.can_access_care_patient(target_patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.current_grams_role() = 'central_authority' OR EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    WHERE pa.patient_id = target_patient AND pa.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = auth.uid()
    WHERE p.id = target_patient
      AND u.role::text IN ('phc_head','phc_worker','asha','anm')
      AND p.registered_phc_id = u.facility_id
  ) OR EXISTS (
    SELECT 1 FROM public.referrals r
    JOIN public.users u ON u.id = auth.uid()
    WHERE r.patient_id = target_patient
      AND (
        (u.role::text = 'doctor' AND r.referred_to_doctor_id = auth.uid())
        OR (u.role::text = 'hospital' AND r.referred_to_facility_id = u.facility_id)
        OR (r.referred_by = auth.uid())
      )
  );
$$;

-- Users / Workers profiles policy:
-- Central sees all; PHC roles see workers in their facility; users see self.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "four tier users read profiles" ON public.users;
DROP POLICY IF EXISTS "strict four tier users read profiles" ON public.users;

CREATE POLICY "strict four tier users read profiles" ON public.users FOR SELECT TO authenticated
USING (
  id = auth.uid()
  OR public.current_grams_role() = 'central_authority'
  OR (
    public.current_grams_role() IN ('phc_head', 'phc_worker')
    AND facility_id IS NOT NULL
    AND facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
  )
);

-- Patients table policies:
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow users read permitted patients" ON public.patients;
DROP POLICY IF EXISTS "four tier staff register patients" ON public.patients;
DROP POLICY IF EXISTS "workflow staff update patients" ON public.patients;
DROP POLICY IF EXISTS "strict read permitted patients" ON public.patients;
DROP POLICY IF EXISTS "strict staff register patients" ON public.patients;
DROP POLICY IF EXISTS "strict staff update patients" ON public.patients;

CREATE POLICY "strict read permitted patients" ON public.patients FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(id));

CREATE POLICY "strict staff register patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    registered_by = auth.uid()
    AND (
      public.current_grams_role() = 'central_authority'
      OR (
        public.current_grams_role() IN ('phc_head','phc_worker')
        AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
      )
    )
  );

CREATE POLICY "strict staff update patients" ON public.patients FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
    OR (
      public.current_grams_role() IN ('phc_head','phc_worker')
      AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    public.current_grams_role() = 'central_authority'
    OR (
      public.current_grams_role() IN ('phc_head','phc_worker')
      AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
    )
  );

-- Health Records (Vitals) policies:
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow users read health records" ON public.health_records;
DROP POLICY IF EXISTS "workflow clinicians create health records" ON public.health_records;
DROP POLICY IF EXISTS "workflow clinicians update health records" ON public.health_records;
DROP POLICY IF EXISTS "strict read health records" ON public.health_records;
DROP POLICY IF EXISTS "strict staff create health records" ON public.health_records;
DROP POLICY IF EXISTS "strict staff update health records" ON public.health_records;

CREATE POLICY "strict read health records" ON public.health_records FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));

CREATE POLICY "strict staff create health records" ON public.health_records FOR INSERT TO authenticated
  WITH CHECK (
    recorded_by = auth.uid()
    AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor')
    AND public.can_access_care_patient(patient_id)
  );

CREATE POLICY "strict staff update health records" ON public.health_records FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor')
    AND public.can_access_care_patient(patient_id)
  )
  WITH CHECK (
    recorded_by = auth.uid()
    AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor')
    AND public.can_access_care_patient(patient_id)
  );

-- Referrals policies (Read-only for patient):
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow users read referrals" ON public.referrals;
DROP POLICY IF EXISTS "workflow clinicians create referrals" ON public.referrals;
DROP POLICY IF EXISTS "four tier staff create referrals" ON public.referrals;
DROP POLICY IF EXISTS "workflow participants update referrals" ON public.referrals;
DROP POLICY IF EXISTS "strict read referrals" ON public.referrals;
DROP POLICY IF EXISTS "strict staff create referrals" ON public.referrals;
DROP POLICY IF EXISTS "strict staff update referrals" ON public.referrals;

CREATE POLICY "strict read referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));

CREATE POLICY "strict staff create referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    referred_by = auth.uid()
    AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor')
    AND public.can_access_care_patient(patient_id)
  );

CREATE POLICY "strict staff update referrals" ON public.referrals FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
    OR referred_by = auth.uid()
    OR referred_to_doctor_id = auth.uid()
    OR (public.current_grams_role() = 'hospital' AND referred_to_facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid()))
  )
  WITH CHECK (
    public.current_grams_role() = 'central_authority'
    OR referred_by = auth.uid()
    OR referred_to_doctor_id = auth.uid()
    OR (public.current_grams_role() = 'hospital' AND referred_to_facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid()))
  );

-- Follow-ups policies (Read-only for patient):
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "workflow users read followups" ON public.follow_ups;
DROP POLICY IF EXISTS "workflow staff create followups" ON public.follow_ups;
DROP POLICY IF EXISTS "workflow staff update followups" ON public.follow_ups;
DROP POLICY IF EXISTS "strict read followups" ON public.follow_ups;
DROP POLICY IF EXISTS "strict staff create followups" ON public.follow_ups;
DROP POLICY IF EXISTS "strict staff update followups" ON public.follow_ups;

CREATE POLICY "strict read followups" ON public.follow_ups FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));

CREATE POLICY "strict staff create followups" ON public.follow_ups FOR INSERT TO authenticated
  WITH CHECK (
    updated_by = auth.uid()
    AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor','hospital')
    AND public.can_access_care_patient(patient_id)
  );

CREATE POLICY "strict staff update followups" ON public.follow_ups FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor','hospital')
    AND public.can_access_care_patient(patient_id)
  )
  WITH CHECK (
    updated_by = auth.uid()
    AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor','hospital')
    AND public.can_access_care_patient(patient_id)
  );

NOTIFY pgrst, 'reload schema';
