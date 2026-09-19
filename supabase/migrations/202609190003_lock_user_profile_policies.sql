-- Prevent authenticated clients from creating or changing their own role.
-- Profiles are created by the auth trigger; role promotion is an administrative operation.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "authenticated users see profiles" ON public.users;
DROP POLICY IF EXISTS "authenticated users insert profile" ON public.users;
DROP POLICY IF EXISTS "authenticated users update profiles" ON public.users;
DROP POLICY IF EXISTS "users see their own profile" ON public.users;
DROP POLICY IF EXISTS "users update own profile" ON public.users;

CREATE POLICY "users read own profile" ON public.users FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.current_grams_role() = 'central_authority');

CREATE POLICY "users update own non role profile" ON public.users FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.current_grams_role() = 'central_authority')
  WITH CHECK (id = auth.uid() OR public.current_grams_role() = 'central_authority');

NOTIFY pgrst, 'reload schema';
