-- Operational support workflow: PHCs can request help from central authority.
-- RLS limits requests to the originating facility and central authority.
CREATE TABLE IF NOT EXISTS public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requested_by uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
  facility_id uuid NOT NULL REFERENCES public.facilities(id) ON DELETE RESTRICT,
  request_type text NOT NULL CHECK (request_type IN ('staffing','medicine','equipment','kit','health_camp','outbreak_support','other')),
  title text NOT NULL CHECK (char_length(trim(title)) BETWEEN 3 AND 160),
  details text NOT NULL CHECK (char_length(trim(details)) BETWEEN 3 AND 4000),
  area text,
  priority text NOT NULL DEFAULT 'normal' CHECK (priority IN ('normal','high','urgent')),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','under_review','approved','in_progress','fulfilled','rejected')),
  requested_for date,
  resolved_at timestamptz,
  resolved_by uuid REFERENCES public.users(id),
  resolution_note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS support_requests_facility_status_idx
  ON public.support_requests(facility_id, status, created_at DESC);

ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "requesters and central read support requests" ON public.support_requests;
CREATE POLICY "requesters and central read support requests"
  ON public.support_requests FOR SELECT TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
    OR (
      facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
      AND public.current_grams_role() IN ('phc_head','phc_worker')
    )
  );

DROP POLICY IF EXISTS "phc staff create support requests" ON public.support_requests;
CREATE POLICY "phc staff create support requests"
  ON public.support_requests FOR INSERT TO authenticated
  WITH CHECK (
    requested_by = auth.uid()
    AND facility_id = (SELECT facility_id FROM public.users WHERE id = auth.uid())
    AND public.current_grams_role() IN ('phc_head','phc_worker')
  );

DROP POLICY IF EXISTS "central or requester update support requests" ON public.support_requests;
CREATE POLICY "central or requester update support requests"
  ON public.support_requests FOR UPDATE TO authenticated
  USING (
    public.current_grams_role() = 'central_authority'
    OR (requested_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker'))
  )
  WITH CHECK (
    public.current_grams_role() = 'central_authority'
    OR (requested_by = auth.uid() AND public.current_grams_role() IN ('phc_head','phc_worker'))
  );

CREATE OR REPLACE FUNCTION public.touch_support_request()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS support_requests_updated_at ON public.support_requests;
CREATE TRIGGER support_requests_updated_at
  BEFORE UPDATE ON public.support_requests
  FOR EACH ROW EXECUTE FUNCTION public.touch_support_request();

NOTIFY pgrst, 'reload schema';