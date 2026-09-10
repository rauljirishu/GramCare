-- Additive patient workflow metadata for the SIH 2026 demo.
-- Demo updates are scoped to is_demo = true and never modify user records.

ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS location_accuracy double precision;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS location_captured_at timestamptz;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS assigned_worker text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS last_visit_date date;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS next_follow_up_date date;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS referral_status text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS referred_hospital text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS notes text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS symptoms text;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS risk_score numeric(5,2);
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS risk_level public.risk_level;

UPDATE public.patients SET
  latitude = CASE patient_code WHEN 'GC-DEMO-001' THEN 22.3072 WHEN 'GC-DEMO-002' THEN 22.3456 WHEN 'GC-DEMO-003' THEN 22.2890 WHEN 'GC-DEMO-004' THEN 22.3200 WHEN 'GC-DEMO-005' THEN 22.2764 WHEN 'GC-DEMO-006' THEN 22.3611 END,
  longitude = CASE patient_code WHEN 'GC-DEMO-001' THEN 73.1812 WHEN 'GC-DEMO-002' THEN 73.2100 WHEN 'GC-DEMO-003' THEN 73.1450 WHEN 'GC-DEMO-004' THEN 73.2500 WHEN 'GC-DEMO-005' THEN 73.1642 WHEN 'GC-DEMO-006' THEN 73.2268 END,
  location_accuracy = CASE patient_code WHEN 'GC-DEMO-001' THEN 18 WHEN 'GC-DEMO-002' THEN 24 WHEN 'GC-DEMO-003' THEN 31 WHEN 'GC-DEMO-004' THEN 16 WHEN 'GC-DEMO-005' THEN 28 WHEN 'GC-DEMO-006' THEN 22 END,
  location_captured_at = created_at,
  assigned_worker = CASE patient_code WHEN 'GC-DEMO-001' THEN 'Kiranben Solanki (ASHA)' WHEN 'GC-DEMO-002' THEN 'Rekhaben Parmar (ANM)' WHEN 'GC-DEMO-003' THEN 'Mitesh Rathod (ASHA)' WHEN 'GC-DEMO-004' THEN 'Farida Sheikh (ANM)' WHEN 'GC-DEMO-005' THEN 'Jignesh Patel (ASHA)' WHEN 'GC-DEMO-006' THEN 'Hiralben Joshi (ANM)' END,
  last_visit_date = created_at::date,
  next_follow_up_date = CASE patient_code WHEN 'GC-DEMO-001' THEN CURRENT_DATE + 14 WHEN 'GC-DEMO-002' THEN CURRENT_DATE + 7 WHEN 'GC-DEMO-003' THEN CURRENT_DATE + 3 WHEN 'GC-DEMO-004' THEN CURRENT_DATE + 1 WHEN 'GC-DEMO-005' THEN CURRENT_DATE + 5 WHEN 'GC-DEMO-006' THEN CURRENT_DATE + 2 END,
  referral_status = CASE patient_code WHEN 'GC-DEMO-004' THEN 'pending' WHEN 'GC-DEMO-006' THEN 'accepted' ELSE 'none' END,
  referred_hospital = CASE patient_code WHEN 'GC-DEMO-004' THEN 'District Sub-Divisional Hospital Chandpur' WHEN 'GC-DEMO-006' THEN 'Community Health Centre Sundarpur' ELSE NULL END,
  symptoms = CASE patient_code WHEN 'GC-DEMO-001' THEN 'No new symptoms' WHEN 'GC-DEMO-002' THEN 'Increased thirst, occasional dizziness' WHEN 'GC-DEMO-003' THEN 'Headache, frequent urination' WHEN 'GC-DEMO-004' THEN 'Severe headache, breathlessness' WHEN 'GC-DEMO-005' THEN 'Poor appetite, fatigue' WHEN 'GC-DEMO-006' THEN 'Breathlessness, pedal swelling' END,
  notes = 'Fictional SIH 2026 demo record. Not a real patient.'
WHERE is_demo = true;

UPDATE public.patients SET
  name = 'Aarav Sharma', age = 8, gender = 'male', existing_conditions = ARRAY['Underweight', 'Nutritional anaemia'],
  symptoms = 'Poor appetite, tiredness, slow weight gain',
  child_health = '{"birth_weight_kg": 2.4, "immunization_status": "pending", "growth_milestone_notes": "Needs nutrition counselling and growth monitoring"}'::jsonb,
  referral_status = 'none', referred_hospital = NULL, assigned_worker = 'Jignesh Patel (ASHA)'
WHERE is_demo = true AND patient_code = 'GC-DEMO-005';

NOTIFY pgrst, 'reload schema';