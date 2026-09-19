-- Secure four-tier access model.
-- Public signup always creates a patient. Staff roles are assigned by an administrator.

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, role, phone, email)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', 'New patient'),
    'patient'::public.user_role,
    new.phone,
    new.email
  )
  ON CONFLICT (id) DO UPDATE SET
    name = excluded.name,
    email = excluded.email;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Never allow a non-central account to promote itself or another account.
CREATE OR REPLACE FUNCTION public.prevent_role_self_change() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND public.current_grams_role() <> 'central_authority' THEN
    RAISE EXCEPTION 'Only Central Authority can change account roles';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_user_role_changes ON public.users;
CREATE TRIGGER protect_user_role_changes
BEFORE UPDATE ON public.users
FOR EACH ROW EXECUTE FUNCTION public.prevent_role_self_change();

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "users read own profile" ON public.users;
DROP POLICY IF EXISTS "users update own non role profile" ON public.users;
DROP POLICY IF EXISTS "authenticated users see profiles" ON public.users;
DROP POLICY IF EXISTS "authenticated users insert profile" ON public.users;
DROP POLICY IF EXISTS "authenticated users update profiles" ON public.users;

CREATE POLICY "four tier users read profiles" ON public.users FOR SELECT TO authenticated
USING (id = auth.uid() OR public.current_grams_role() = 'central_authority');
CREATE POLICY "four tier users update profile" ON public.users FOR UPDATE TO authenticated
USING (id = auth.uid() OR public.current_grams_role() = 'central_authority')
WITH CHECK (id = auth.uid() OR public.current_grams_role() = 'central_authority');

-- Reassert the four care scopes explicitly. Central sees all; PHC roles see only
-- records attached to their facility; patients see only their patient account.
CREATE OR REPLACE FUNCTION public.can_access_care_patient(target_patient uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.current_grams_role() = 'central_authority' OR EXISTS (
    SELECT 1 FROM public.patient_accounts pa
    WHERE pa.patient_id = target_patient AND pa.user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM public.patients p
    JOIN public.users u ON u.id = auth.uid()
    WHERE p.id = target_patient
      AND u.role::text IN ('phc_head','phc_worker')
      AND p.registered_phc_id = u.facility_id
  ) OR EXISTS (
    SELECT 1 FROM public.referrals r
    JOIN public.users u ON u.id = auth.uid()
    WHERE r.patient_id = target_patient
      AND (
        (u.role::text = 'doctor' AND r.referred_to_doctor_id = auth.uid())
        OR (u.role::text = 'hospital' AND r.referred_to_facility_id = u.facility_id)
      )
  )
$$;

DROP POLICY IF EXISTS "workflow staff register patients" ON public.patients;
CREATE POLICY "four tier staff register patients" ON public.patients FOR INSERT TO authenticated
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

DROP POLICY IF EXISTS "workflow clinicians create referrals" ON public.referrals;
CREATE POLICY "four tier staff create referrals" ON public.referrals FOR INSERT TO authenticated
WITH CHECK (
  referred_by = auth.uid()
  AND public.current_grams_role() IN ('central_authority','phc_head','phc_worker','doctor')
  AND public.can_access_care_patient(patient_id)
);

NOTIFY pgrst, 'reload schema';
