-- Enforce strict 4-Level Authority Hierarchy RLS & Security Rules

-- Helper function to fetch user's normalized UI/DB role
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

-- Helper function to test care access boundaries per assigned facility/patient
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

-- 1. PATIENT REGISTRATION POLICY: ONLY Level 3 (phc_worker, asha, anm) can REGISTER new patients
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "strict staff register patients" ON public.patients;
DROP POLICY IF EXISTS "four tier staff register patients" ON public.patients;
DROP POLICY IF EXISTS "level3 workers register patients" ON public.patients;

CREATE POLICY "level3 workers register patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    registered_by = auth.uid()
    AND (SELECT role::text FROM public.users WHERE id = auth.uid()) IN ('phc_worker', 'asha', 'anm')
    AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
  );

-- 2. PATIENT SELECT POLICY: Central Authority sees all; Area Head / Worker see assigned PHC patients; Patient sees self
DROP POLICY IF EXISTS "strict read permitted patients" ON public.patients;
DROP POLICY IF EXISTS "workflow users read permitted patients" ON public.patients;

CREATE POLICY "strict read permitted patients" ON public.patients FOR SELECT TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
    OR public.can_access_care_patient(id)
  );

-- 3. SUPPORT REQUESTS POLICY: Area Authority & Workers submit upward; ONLY Central Authority can approve/reject
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users create support requests" ON public.support_requests;
DROP POLICY IF EXISTS "staff insert support requests" ON public.support_requests;
DROP POLICY IF EXISTS "central authority update support requests" ON public.support_requests;

CREATE POLICY "staff insert support requests" ON public.support_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND public.current_grams_role() IN ('phc_head', 'phc_worker')
  );

CREATE POLICY "central authority update support requests" ON public.support_requests FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
  )
  WITH CHECK (
    public.current_grams_role() = 'central_authority'
  );

NOTIFY pgrst, 'reload schema';
