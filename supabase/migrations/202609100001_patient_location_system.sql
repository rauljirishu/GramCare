-- Patient & facility location system
-- Adds GPS coordinates, location source tracking, and facility geo fields

-- Patient location fields
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS location_source text;

-- Add check constraint for location_source if not exists
DO $$ BEGIN
  ALTER TABLE public.patients ADD CONSTRAINT patients_location_source_check
    CHECK (location_source IS NULL OR location_source IN ('GPS', 'Manual', 'Existing Record'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Facility geo fields
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS latitude double precision;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS longitude double precision;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS district text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS state text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS pincode text;
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS referral_available boolean DEFAULT true;

-- Seed demo facility coordinates (fictional Grampur district demo data only)
UPDATE public.facilities SET
  latitude = 22.3072, longitude = 73.1812,
  district = 'Grampur', state = 'Gujarat', pincode = '390001', referral_available = true
WHERE id = 'a1000000-0000-0000-0000-000000000001';

UPDATE public.facilities SET
  latitude = 22.3456, longitude = 73.2100,
  district = 'Grampur', state = 'Gujarat', pincode = '390002', referral_available = true
WHERE id = 'a1000000-0000-0000-0000-000000000002';

UPDATE public.facilities SET
  latitude = 22.2890, longitude = 73.1450,
  district = 'Grampur', state = 'Gujarat', pincode = '390003', referral_available = true
WHERE id = 'a1000000-0000-0000-0000-000000000003';

UPDATE public.facilities SET
  latitude = 22.3200, longitude = 73.2500,
  district = 'Grampur', state = 'Gujarat', pincode = '390004', referral_available = true
WHERE id = 'a1000000-0000-0000-0000-000000000004';

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
