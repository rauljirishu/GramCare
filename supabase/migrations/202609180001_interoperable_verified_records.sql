-- GramSwasthya: verified, longitudinal and interoperability-ready patient records.
-- This migration is additive. It does not delete production data.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'central_authority';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'phc_head';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'phc_worker';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'patient';

ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS area text,
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'active';

ALTER TABLE public.patients
  ADD COLUMN IF NOT EXISTS patient_code text,
  ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS registered_phc_id uuid REFERENCES public.facilities(id),
  ADD COLUMN IF NOT EXISTS verification_status text NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending','verified','rejected')),
  ADD COLUMN IF NOT EXISTS verified_by uuid REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS emergency_contact text,
  ADD COLUMN IF NOT EXISTS date_of_birth date,
  ADD COLUMN IF NOT EXISTS blood_group text,
  ADD COLUMN IF NOT EXISTS current_medications text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS previous_major_illnesses text[] NOT NULL DEFAULT '{}';
CREATE UNIQUE INDEX IF NOT EXISTS patients_patient_code_key ON public.patients(patient_code) WHERE patient_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.patient_accounts (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  patient_id uuid NOT NULL UNIQUE REFERENCES public.patients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.clinical_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  facility_id uuid REFERENCES public.facilities(id),
  practitioner_id uuid NOT NULL REFERENCES public.users(id),
  record_kind text NOT NULL CHECK (record_kind IN ('historical','current')),
  resource_type text NOT NULL CHECK (resource_type IN ('encounter','condition','observation','medication','procedure','maternal_care','follow_up')),
  occurred_on date,
  date_precision text NOT NULL DEFAULT 'exact' CHECK (date_precision IN ('exact','approximate','unknown')),
  source_type text NOT NULL CHECK (source_type IN ('phc_entered','patient_provided','document_based')),
  source_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending_verification' CHECK (status IN ('pending_verification','verified','rejected')),
  title text NOT NULL,
  description text,
  structured_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  attachment_path text,
  verified_by uuid REFERENCES public.users(id),
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS clinical_records_patient_date_idx ON public.clinical_records(patient_id, occurred_on DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.correction_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES public.users(id),
  field_name text NOT NULL,
  original_value jsonb,
  requested_value jsonb NOT NULL,
  reason text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  reviewed_by uuid REFERENCES public.users(id),
  reviewed_at timestamptz,
  decision_note text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.record_audit_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  clinical_record_id uuid REFERENCES public.clinical_records(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES public.users(id),
  action text NOT NULL,
  original_value jsonb,
  new_value jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.current_grams_role() RETURNS text
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role::text FROM public.users WHERE id = auth.uid()
$$;
CREATE OR REPLACE FUNCTION public.can_view_verified_patient(target_patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.patient_accounts pa WHERE pa.patient_id = target_patient AND pa.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM public.patients p JOIN public.users u ON u.facility_id = p.registered_phc_id WHERE p.id = target_patient AND u.id = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker'))
$$;
CREATE OR REPLACE FUNCTION public.can_manage_patient(target_patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.patients p JOIN public.users u ON u.facility_id = p.registered_phc_id WHERE p.id = target_patient AND u.id = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker'))
$$;

ALTER TABLE public.patient_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.correction_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.record_audit_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "patients see their own account link" ON public.patient_accounts FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.current_grams_role() IN ('phc_head','phc_worker'));
CREATE POLICY "authorised staff maintain account links" ON public.patient_accounts FOR ALL TO authenticated USING (public.current_grams_role() IN ('phc_head','phc_worker')) WITH CHECK (public.current_grams_role() IN ('phc_head','phc_worker'));
CREATE POLICY "authorised users read permitted clinical records" ON public.clinical_records FOR SELECT TO authenticated USING (public.can_view_verified_patient(patient_id));
CREATE POLICY "staff create clinical records" ON public.clinical_records FOR INSERT TO authenticated WITH CHECK (practitioner_id = auth.uid() AND public.can_manage_patient(patient_id));
CREATE POLICY "staff update clinical records" ON public.clinical_records FOR UPDATE TO authenticated USING (public.can_manage_patient(patient_id)) WITH CHECK (public.can_manage_patient(patient_id));
CREATE POLICY "patients create correction requests only for themselves" ON public.correction_requests FOR INSERT TO authenticated WITH CHECK (requested_by = auth.uid() AND EXISTS (SELECT 1 FROM public.patient_accounts pa WHERE pa.patient_id = correction_requests.patient_id AND pa.user_id = auth.uid()));
CREATE POLICY "users see permitted correction requests" ON public.correction_requests FOR SELECT TO authenticated USING (requested_by = auth.uid() OR public.can_manage_patient(patient_id));
CREATE POLICY "staff review correction requests" ON public.correction_requests FOR UPDATE TO authenticated USING (public.can_manage_patient(patient_id)) WITH CHECK (public.can_manage_patient(patient_id));
CREATE POLICY "authorised users read audit history" ON public.record_audit_history FOR SELECT TO authenticated USING (public.can_view_verified_patient(patient_id));

-- Replace legacy patient rules that only understood the original asha/doctor/admin
-- roles.  RLS stays enabled; these policies are deliberately scoped to the PHC
-- assignment or the patient's own account.
DROP POLICY IF EXISTS "staff see permitted patients" ON public.patients;
DROP POLICY IF EXISTS "field staff register patients" ON public.patients;
DROP POLICY IF EXISTS "registrars update their patients" ON public.patients;
CREATE POLICY "authorised users read permitted patients" ON public.patients FOR SELECT TO authenticated
  USING (public.can_view_verified_patient(id) OR public.current_grams_role() = 'central_authority');
CREATE POLICY "authorised PHC staff register patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    registered_by = auth.uid()
    AND public.current_grams_role() IN ('phc_head','phc_worker')
    AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
  );
CREATE POLICY "authorised PHC staff update patients" ON public.patients FOR UPDATE TO authenticated
  USING (public.can_manage_patient(id)) WITH CHECK (public.can_manage_patient(id));

-- Patients may see only verified clinical information. PHC staff retain access
-- to pending history so they can verify it; no patient can write clinical data.
DROP POLICY IF EXISTS "authorised users read permitted clinical records" ON public.clinical_records;
CREATE POLICY "authorised users read permitted clinical records" ON public.clinical_records FOR SELECT TO authenticated
  USING (
    public.can_manage_patient(patient_id)
    OR (public.can_view_verified_patient(patient_id) AND status = 'verified')
  );

NOTIFY pgrst, 'reload schema';
