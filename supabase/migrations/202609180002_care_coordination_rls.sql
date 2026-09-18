-- GramCare care-coordination permissions. RLS remains enabled at all times.
ALTER TYPE public.referral_status ADD VALUE IF NOT EXISTS 'sent';
ALTER TYPE public.referral_status ADD VALUE IF NOT EXISTS 'received';
ALTER TYPE public.referral_status ADD VALUE IF NOT EXISTS 'follow_up_required';

CREATE OR REPLACE FUNCTION public.can_access_care_patient(target_patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    WHERE pa.patient_id = target_patient AND pa.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.patients p JOIN public.users u ON u.id = auth.uid()
    WHERE p.id = target_patient
      AND u.role::text IN ('phc_head','phc_worker','doctor')
      AND p.registered_phc_id = u.facility_id
  ) OR EXISTS (
    SELECT 1 FROM public.referrals r JOIN public.users u ON u.id = auth.uid()
    WHERE r.patient_id = target_patient
      AND u.role::text = 'hospital'
      AND r.referred_to_facility_id = u.facility_id
  )
$$;

DROP POLICY IF EXISTS "staff see permitted records" ON public.health_records;
DROP POLICY IF EXISTS "authorized staff create records" ON public.health_records;
CREATE POLICY "authorised users see care records" ON public.health_records FOR SELECT TO authenticated
  USING (public.can_access_care_patient(patient_id));
CREATE POLICY "authorised clinicians create care records" ON public.health_records FOR INSERT TO authenticated
  WITH CHECK (recorded_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));

DROP POLICY IF EXISTS "staff see permitted referrals" ON public.referrals;
DROP POLICY IF EXISTS "authorized staff create referrals" ON public.referrals;
DROP POLICY IF EXISTS "doctors update assigned referrals" ON public.referrals;
CREATE POLICY "authorised users see referrals" ON public.referrals FOR SELECT TO authenticated
  USING (public.can_access_care_patient(patient_id));
CREATE POLICY "clinicians create referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (referred_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker','doctor') AND public.can_access_care_patient(patient_id));
CREATE POLICY "referral participants update referrals" ON public.referrals FOR UPDATE TO authenticated
  USING (referred_by = auth.uid() OR (SELECT role::text FROM public.users WHERE id = auth.uid()) = 'hospital' AND referred_to_facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid()))
  WITH CHECK (referred_by = auth.uid() OR (SELECT role::text FROM public.users WHERE id = auth.uid()) = 'hospital' AND referred_to_facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid()));

DROP POLICY IF EXISTS "staff see permitted followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authorized staff update followups" ON public.follow_ups;
DROP POLICY IF EXISTS "authorized staff create followups" ON public.follow_ups;
CREATE POLICY "authorised users see followups" ON public.follow_ups FOR SELECT TO authenticated
  USING (public.can_access_care_patient(patient_id));
CREATE POLICY "clinicians manage followups" ON public.follow_ups FOR ALL TO authenticated
  USING (public.can_access_care_patient(patient_id) AND public.current_grams_role() IN ('phc_head','phc_worker','doctor','hospital'))
  WITH CHECK (public.can_access_care_patient(patient_id) AND public.current_grams_role() IN ('phc_head','phc_worker','doctor','hospital'));

NOTIFY pgrst, 'reload schema';
