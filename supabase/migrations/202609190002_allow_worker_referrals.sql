-- Field workers may initiate a referral for a patient they are authorised to access.
DROP POLICY IF EXISTS "workflow clinicians create referrals" ON public.referrals;
CREATE POLICY "workflow clinicians create referrals" ON public.referrals FOR INSERT TO authenticated
  WITH CHECK (
    referred_by = auth.uid()
    AND public.current_grams_role() IN ('phc_head','phc_worker','doctor')
    AND public.can_access_care_patient(patient_id)
  );

NOTIFY pgrst, 'reload schema';
