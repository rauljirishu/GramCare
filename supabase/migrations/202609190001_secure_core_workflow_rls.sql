-- Final least-privilege policies for the live care workflow.
-- Earlier migrations created broad authenticated policies; these are removed here.
ALTER TYPE public.follow_up_status ADD VALUE IF NOT EXISTS 'rescheduled';
ALTER TYPE public.follow_up_status ADD VALUE IF NOT EXISTS 'due';

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "staff see permitted patients" ON public.patients;
DROP POLICY IF EXISTS "field staff register patients" ON public.patients;
DROP POLICY IF EXISTS "registrars update their patients" ON public.patients;
DROP POLICY IF EXISTS "authenticated staff see patients" ON public.patients;
DROP POLICY IF EXISTS "authenticated staff insert patients" ON public.patients;
DROP POLICY IF EXISTS "authenticated staff update patients" ON public.patients;
DROP POLICY IF EXISTS "authenticated staff delete patients" ON public.patients;
DROP POLICY IF EXISTS "patients_select" ON public.patients;
DROP POLICY IF EXISTS "patients_insert" ON public.patients;
DROP POLICY IF EXISTS "patients_update" ON public.patients;
DROP POLICY IF EXISTS "patients_delete" ON public.patients;
DROP POLICY IF EXISTS "authorised users read permitted patients" ON public.patients;
DROP POLICY IF EXISTS "authorised PHC staff register patients" ON public.patients;
DROP POLICY IF EXISTS "authorised PHC staff update patients" ON public.patients;
CREATE POLICY "workflow users read permitted patients" ON public.patients FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(id));
CREATE POLICY "workflow staff register patients" ON public.patients FOR INSERT TO authenticated
  WITH CHECK (
    registered_by = auth.uid()
    AND public.current_grams_role() IN ('phc_head','phc_worker')
    AND registered_phc_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
  );
CREATE POLICY "workflow staff update patients" ON public.patients FOR UPDATE TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_manage_patient(id))
  WITH CHECK (public.current_grams_role() = 'central_authority' OR public.can_manage_patient(id));

DROP POLICY IF EXISTS "staff see permitted records" ON public.health_records;
DROP POLICY IF EXISTS "authorized staff create records" ON public.health_records;
DROP POLICY IF EXISTS "authenticated staff see records" ON public.health_records;
DROP POLICY IF EXISTS "authenticated staff insert records" ON public.health_records;
DROP POLICY IF EXISTS "authenticated staff update records" ON public.health_records;
DROP POLICY IF EXISTS "records_select" ON public.health_records;
DROP POLICY IF EXISTS "records_insert" ON public.health_records;
DROP POLICY IF EXISTS "records_update" ON public.health_records;
DROP POLICY IF EXISTS "authorised users see care records" ON public.health_records;
DROP POLICY IF EXISTS "authorised clinicians create care records" ON public.health_records;
CREATE POLICY "workflow users read health records" ON public.health_records FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians create health records" ON public.health_records FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians update health records" ON public.health_records FOR UPDATE TO authenticated
  USING (public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id))
  WITH CHECK (recorded_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));

DROP POLICY IF EXISTS "staff see permitted risk" ON public.risk_assessments;
DROP POLICY IF EXISTS "authenticated staff see risk" ON public.risk_assessments;
DROP POLICY IF EXISTS "authenticated staff insert risk" ON public.risk_assessments;
DROP POLICY IF EXISTS "authenticated staff update risk" ON public.risk_assessments;
DROP POLICY IF EXISTS "risk_select" ON public.risk_assessments;
DROP POLICY IF EXISTS "risk_insert" ON public.risk_assessments;
DROP POLICY IF EXISTS "risk_update" ON public.risk_assessments;
CREATE POLICY "workflow users read risk assessments" ON public.risk_assessments FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians create risk assessments" ON public.risk_assessments FOR INSERT TO authenticated
  WITH CHECK (public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));
CREATE POLICY "workflow doctors update risk assessments" ON public.risk_assessments FOR UPDATE TO authenticated
  USING (public.current_grams_role() IN ('phc_head','doctor') AND public.can_access_care_patient(patient_id))
  WITH CHECK (public.current_grams_role() IN ('phc_head','doctor') AND public.can_access_care_patient(patient_id));

DROP POLICY IF EXISTS "staff see permitted referrals" ON public.referrals;
DROP POLICY IF EXISTS "authorized staff create referrals" ON public.referrals;
DROP POLICY IF EXISTS "doctors update assigned referrals" ON public.referrals;
DROP POLICY IF EXISTS "authenticated staff see referrals" ON public.referrals;
DROP POLICY IF EXISTS "authenticated staff insert referrals" ON public.referrals;
DROP POLICY IF EXISTS "authenticated staff update referrals" ON public.referrals;
DROP POLICY IF EXISTS "referrals_select" ON public.referrals;
DROP POLICY IF EXISTS "referrals_insert" ON public.referrals;
DROP POLICY IF EXISTS "referrals_update" ON public.referrals;
DROP POLICY IF EXISTS "authorised users see referrals" ON public.referrals;
DROP POLICY IF EXISTS "clinicians create referrals" ON public.referrals;
DROP POLICY IF EXISTS "referral participants update referrals" ON public.referrals;
CREATE POLICY "workflow users read referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians create referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referred_by = auth.uid() AND public.current_grams_role() IN ('phc_head','doctor') AND public.can_access_care_patient(patient_id));
CREATE POLICY "workflow participants update referrals" ON public.referrals FOR UPDATE TO authenticated
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

DROP POLICY IF EXISTS "staff see permitted followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authorized staff update followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authorized staff create followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authenticated staff see followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authenticated staff insert followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authenticated staff update followups" ON public.follow_ups;
DROP POLICY IF EXISTS "followups_select" ON public.follow_ups;
DROP POLICY IF EXISTS "followups_insert" ON public.follow_ups;
DROP POLICY IF EXISTS "followups_update" ON public.follow_ups;
DROP POLICY IF EXISTS "authorised users see followups" ON public.follow_ups;
DROP POLICY IF EXISTS "clinicians manage followups" ON public.follow_ups;
CREATE POLICY "workflow users read followups" ON public.follow_ups FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));
CREATE POLICY "workflow staff create followups" ON public.follow_ups FOR INSERT TO authenticated
  WITH CHECK (updated_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor','hospital') AND public.can_access_care_patient(patient_id));
CREATE POLICY "workflow staff update followups" ON public.follow_ups FOR UPDATE TO authenticated
  USING (public.current_grams_role() IN ('phc_head','phc_worker','doctor','hospital') AND public.can_access_care_patient(patient_id))
  WITH CHECK (updated_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor','hospital') AND public.can_access_care_patient(patient_id));

DROP POLICY IF EXISTS "authorised users read permitted clinical records" ON public.clinical_records;
DROP POLICY IF EXISTS "staff create clinical records" ON public.clinical_records;
DROP POLICY IF EXISTS "staff update clinical records" ON public.clinical_records;
CREATE POLICY "workflow users read clinical records" ON public.clinical_records FOR SELECT TO authenticated
  USING (public.current_grams_role() = 'central_authority' OR public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians create clinical records" ON public.clinical_records FOR INSERT TO authenticated
  WITH CHECK (practitioner_id = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));
CREATE POLICY "workflow clinicians update clinical records" ON public.clinical_records FOR UPDATE TO authenticated
  USING (public.current_grams_role() IN ('phc_head','doctor') AND public.can_access_care_patient(patient_id))
  WITH CHECK (public.current_grams_role() IN ('phc_head','doctor') AND public.can_access_care_patient(patient_id));

NOTIFY pgrst, 'reload schema';
