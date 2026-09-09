-- GramCare SIH 2026 Idempotent 6 Demo Patients Seeding & Reset System (Sections 31-38)
-- Adds is_demo and patient_code columns, inserts 6 distinct demo patients with connected records,
-- and creates an RPC reset function for demo data.

-- 1. Extend Patients Table with is_demo and patient_code
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS is_demo boolean NOT NULL DEFAULT false;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS patient_code text;

-- Create Index for fast demo/real patient filtering
CREATE INDEX IF NOT EXISTS idx_patients_is_demo ON public.patients(is_demo);
CREATE INDEX IF NOT EXISTS idx_patients_patient_code ON public.patients(patient_code);

-- 2. Insert 6 Fictional Demo Patients (Idempotent)
INSERT INTO public.patients (
  id, patient_code, is_demo, name, age, gender, village, gram_panchayat, block, district, address, phone,
  guardian_name, emergency_contact, blood_group, existing_conditions, allergies, current_medications, phc_assigned, created_at
) VALUES
  (
    'd0000000-0000-0000-0000-000000000001', 'GC-DEMO-001', true, 'Ramesh Patel', 42, 'male', 'Rampur', 'Rampur GP', 'Block East', 'Grampur',
    'House 12, Demo Lane, Rampur', '+91 99999 00001', 'Suresh Patel', '+91 99999 00002', 'O+',
    ARRAY['Routine Monitoring'], ARRAY[]::text[], ARRAY[]::text[], 'GramCare PHC Rampur', NOW() - INTERVAL '10 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000002', 'GC-DEMO-002', true, 'Sunita Devi', 36, 'female', 'Shivpur', 'Shivpur GP', 'Block North', 'Grampur',
    'House 45, Demo Village, Shivpur', '+91 99999 00003', 'Mahesh Devi', '+91 99999 00004', 'B+',
    ARRAY['ANC 24 Weeks', 'Mild Fatigue'], ARRAY['Penicillin'], ARRAY['Iron Folic Acid'], 'Shivpur Sub-Centre', NOW() - INTERVAL '8 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000003', 'GC-DEMO-003', true, 'Mahesh Kumar', 61, 'male', 'Lakshmipur', 'Lakshmipur GP', 'Block West', 'Grampur',
    'Plot 88, Demo Road, Lakshmipur', '+91 99999 00005', 'Anita Kumar', '+91 99999 00006', 'A+',
    ARRAY['Type 2 Diabetes', 'Hypertension Stage 2'], ARRAY['Sulfa Drugs'], ARRAY['Metformin 500mg', 'Amlodipine 5mg'], 'CHC Sundarpur', NOW() - INTERVAL '14 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000004', 'GC-DEMO-004', true, 'Anita Sharma', 58, 'female', 'Devgaon', 'Devgaon GP', 'Block South', 'Grampur',
    'House 102, Demo Ward, Devgaon', '+91 99999 00007', 'Rajan Sharma', '+91 99999 00008', 'AB+',
    ARRAY['Hypertensive Urgency', 'Severe Hyperglycemia'], ARRAY[]::text[], ARRAY['Labetalol 100mg', 'Insulin Glargine'], 'District Sub-Divisional Hospital Chandpur', NOW() - INTERVAL '3 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000005', 'GC-DEMO-005', true, 'Rajesh Singh', 29, 'male', 'Haripur', 'Haripur GP', 'Block Central', 'Grampur',
    'House 23, Demo Street, Haripur', '+91 99999 00009', 'Pooja Singh', '+91 99999 00010', 'O-',
    ARRAY['Recent Febrile Illness'], ARRAY[]::text[], ARRAY['Paracetamol 650mg'], 'GramCare PHC Rampur', NOW() - INTERVAL '2 days'
  ),
  (
    'd0000000-0000-0000-0000-000000000006', 'GC-DEMO-006', true, 'Meena Joshi', 67, 'female', 'Anandpur', 'Anandpur GP', 'Block East', 'Grampur',
    'House 77, Demo Colony, Anandpur', '+91 99999 00011', 'Vinod Joshi', '+91 99999 00012', 'B-',
    ARRAY['Congestive Heart Failure', 'COPD Exacerbation'], ARRAY[]::text[], ARRAY['Furosemide 40mg', 'Salbutamol Inhaler'], 'Community Health Centre Sundarpur', NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO UPDATE SET 
  patient_code = EXCLUDED.patient_code,
  is_demo = EXCLUDED.is_demo,
  name = EXCLUDED.name,
  age = EXCLUDED.age,
  gender = EXCLUDED.gender,
  village = EXCLUDED.village;

-- 3. Seed Demo Health Records (Basic Vitals for 6 Demo Patients)
INSERT INTO public.health_records (
  id, patient_id, systolic_bp, diastolic_bp, blood_sugar, weight_kg, temperature_c, pulse_bpm, spo2, symptoms, notes, recorded_at
) VALUES
  ('dh000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 118, 78, 95, 68, 36.6, 72, 99, 'None', 'Demo 1: Stable routine vitals check', NOW() - INTERVAL '10 days'),
  ('dh000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 138, 88, 155, 56, 37.1, 84, 96, 'Mild fatigue, dizziness', 'Demo 2: ANC 24 weeks screening', NOW() - INTERVAL '8 days'),
  ('dh000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 162, 96, 245, 76, 36.8, 92, 93, 'Frequent thirst, headache', 'Demo 3: High risk chronic diabetic BP', NOW() - INTERVAL '14 days'),
  ('dh000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 178, 106, 290, 64, 37.4, 108, 89, 'Severe headache, chest distress', 'Demo 4: Critical hypoxia & BP crisis', NOW() - INTERVAL '3 days'),
  ('dh000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 132, 84, 140, 70, 38.5, 88, 97, 'Fever with chills', 'Demo 5: Moderate fever visit', NOW() - INTERVAL '2 days'),
  ('dh000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 168, 98, 180, 62, 36.9, 96, 91, 'Orthopnea, leg edema', 'Demo 6: Referred hospital CHF patient', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET symptoms = EXCLUDED.symptoms;

-- 4. Seed Demo Risk Assessments
INSERT INTO public.risk_assessments (
  id, patient_id, health_record_id, risk_score, risk_level, model_version, assessed_at
) VALUES
  ('dr000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'dh000000-0000-0000-0000-000000000001', 12.0, 'low', 'v2.4', NOW() - INTERVAL '10 days'),
  ('dr000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'dh000000-0000-0000-0000-000000000002', 48.0, 'medium', 'v2.4', NOW() - INTERVAL '8 days'),
  ('dr000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 78.0, 'high', 'v2.4', NOW() - INTERVAL '14 days'),
  ('dr000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'dh000000-0000-0000-0000-000000000004', 94.0, 'critical', 'v2.4', NOW() - INTERVAL '3 days'),
  ('dr000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'dh000000-0000-0000-0000-000000000005', 42.0, 'medium', 'v2.4', NOW() - INTERVAL '2 days'),
  ('dr000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'dh000000-0000-0000-0000-000000000006', 86.0, 'high', 'v2.4', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET risk_score = EXCLUDED.risk_score;

-- 5. Seed Demo Referrals
INSERT INTO public.referrals (
  id, patient_id, risk_assessment_id, referred_to_facility_id, receiving_hospital_name, reason, priority, status, created_at
) VALUES
  (
    'dref0000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'dr000000-0000-0000-0000-000000000004',
    'a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur',
    'Demo Critical: Hypertensive Urgency (BP 178/106) & Hypoxia (SpO2 89%)', 'emergency', 'pending', NOW() - INTERVAL '3 days'
  ),
  (
    'dref0000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'dr000000-0000-0000-0000-000000000006',
    'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur',
    'Demo Referred: CHF Exacerbation & Oxygen Support', 'urgent', 'accepted', NOW() - INTERVAL '5 days'
  )
ON CONFLICT (id) DO UPDATE SET reason = EXCLUDED.reason;

-- 6. Seed Demo Follow-ups
INSERT INTO public.follow_ups (
  id, patient_id, referral_id, scheduled_date, status, notes
) VALUES
  ('df100000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', NULL, CURRENT_DATE - INTERVAL '5 days', 'missed', 'Demo 3: Overdue glycemic checkup (Missed follow-up)'),
  ('df100000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', NULL, CURRENT_DATE, 'scheduled', 'Demo 5: Follow-up Due Today for fever re-check')
ON CONFLICT (id) DO UPDATE SET notes = EXCLUDED.notes;

-- 7. Create Demo Reset Function (Safely deletes only records with is_demo = true)
CREATE OR REPLACE FUNCTION public.reset_demo_data() RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  -- Delete existing demo patient child records via CASCADE or explicit cleanup
  DELETE FROM public.patients WHERE is_demo = true;

  -- Re-insert the 6 canonical Demo Patients
  INSERT INTO public.patients (
    id, patient_code, is_demo, name, age, gender, village, gram_panchayat, block, district, address, phone,
    guardian_name, emergency_contact, blood_group, existing_conditions, allergies, current_medications, phc_assigned, created_at
  ) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'GC-DEMO-001', true, 'Ramesh Patel', 42, 'male', 'Rampur', 'Rampur GP', 'Block East', 'Grampur', 'House 12, Demo Lane, Rampur', '+91 99999 00001', 'Suresh Patel', '+91 99999 00002', 'O+', ARRAY['Routine Monitoring'], ARRAY[]::text[], ARRAY[]::text[], 'GramCare PHC Rampur', NOW() - INTERVAL '10 days'),
    ('d0000000-0000-0000-0000-000000000002', 'GC-DEMO-002', true, 'Sunita Devi', 36, 'female', 'Shivpur', 'Shivpur GP', 'Block North', 'Grampur', 'House 45, Demo Village, Shivpur', '+91 99999 00003', 'Mahesh Devi', '+91 99999 00004', 'B+', ARRAY['ANC 24 Weeks', 'Mild Fatigue'], ARRAY['Penicillin'], ARRAY['Iron Folic Acid'], 'Shivpur Sub-Centre', NOW() - INTERVAL '8 days'),
    ('d0000000-0000-0000-0000-000000000003', 'GC-DEMO-003', true, 'Mahesh Kumar', 61, 'male', 'Lakshmipur', 'Lakshmipur GP', 'Block West', 'Grampur', 'Plot 88, Demo Road, Lakshmipur', '+91 99999 00005', 'Anita Kumar', '+91 99999 00006', 'A+', ARRAY['Type 2 Diabetes', 'Hypertension Stage 2'], ARRAY['Sulfa Drugs'], ARRAY['Metformin 500mg', 'Amlodipine 5mg'], 'CHC Sundarpur', NOW() - INTERVAL '14 days'),
    ('d0000000-0000-0000-0000-000000000004', 'GC-DEMO-004', true, 'Anita Sharma', 58, 'female', 'Devgaon', 'Devgaon GP', 'Block South', 'Grampur', 'House 102, Demo Ward, Devgaon', '+91 99999 00007', 'Rajan Sharma', '+91 99999 00008', 'AB+', ARRAY['Hypertensive Urgency', 'Severe Hyperglycemia'], ARRAY[]::text[], ARRAY['Labetalol 100mg', 'Insulin Glargine'], 'District Sub-Divisional Hospital Chandpur', NOW() - INTERVAL '3 days'),
    ('d0000000-0000-0000-0000-000000000005', 'GC-DEMO-005', true, 'Rajesh Singh', 29, 'male', 'Haripur', 'Haripur GP', 'Block Central', 'Grampur', 'House 23, Demo Street, Haripur', '+91 99999 00009', 'Pooja Singh', '+91 99999 00010', 'O-', ARRAY['Recent Febrile Illness'], ARRAY[]::text[], ARRAY['Paracetamol 650mg'], 'GramCare PHC Rampur', NOW() - INTERVAL '2 days'),
    ('d0000000-0000-0000-0000-000000000006', 'GC-DEMO-006', true, 'Meena Joshi', 67, 'female', 'Anandpur', 'Anandpur GP', 'Block East', 'Grampur', 'House 77, Demo Colony, Anandpur', '+91 99999 00011', 'Vinod Joshi', '+91 99999 00012', 'B-', ARRAY['Congestive Heart Failure', 'COPD Exacerbation'], ARRAY[]::text[], ARRAY['Furosemide 40mg', 'Salbutamol Inhaler'], 'Community Health Centre Sundarpur', NOW() - INTERVAL '5 days');

  -- Re-insert demo health records
  INSERT INTO public.health_records (id, patient_id, systolic_bp, diastolic_bp, blood_sugar, weight_kg, temperature_c, pulse_bpm, spo2, symptoms, notes, recorded_at) VALUES
    ('dh000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 118, 78, 95, 68, 36.6, 72, 99, 'None', 'Demo 1: Stable routine vitals check', NOW() - INTERVAL '10 days'),
    ('dh000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 138, 88, 155, 56, 37.1, 84, 96, 'Mild fatigue, dizziness', 'Demo 2: ANC 24 weeks screening', NOW() - INTERVAL '8 days'),
    ('dh000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 162, 96, 245, 76, 36.8, 92, 93, 'Frequent thirst, headache', 'Demo 3: High risk chronic diabetic BP', NOW() - INTERVAL '14 days'),
    ('dh000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 178, 106, 290, 64, 37.4, 108, 89, 'Severe headache, chest distress', 'Demo 4: Critical hypoxia & BP crisis', NOW() - INTERVAL '3 days'),
    ('dh000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 132, 84, 140, 70, 38.5, 88, 97, 'Fever with chills', 'Demo 5: Moderate fever visit', NOW() - INTERVAL '2 days'),
    ('dh000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 168, 98, 180, 62, 36.9, 96, 91, 'Orthopnea, leg edema', 'Demo 6: Referred hospital CHF patient', NOW() - INTERVAL '5 days');

  -- Re-insert demo risk assessments
  INSERT INTO public.risk_assessments (id, patient_id, health_record_id, risk_score, risk_level, model_version, assessed_at) VALUES
    ('dr000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'dh000000-0000-0000-0000-000000000001', 12.0, 'low', 'v2.4', NOW() - INTERVAL '10 days'),
    ('dr000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'dh000000-0000-0000-0000-000000000002', 48.0, 'medium', 'v2.4', NOW() - INTERVAL '8 days'),
    ('dr000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'dh000000-0000-0000-0000-000000000003', 78.0, 'high', 'v2.4', NOW() - INTERVAL '14 days'),
    ('dr000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'dh000000-0000-0000-0000-000000000004', 94.0, 'critical', 'v2.4', NOW() - INTERVAL '3 days'),
    ('dr000000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', 'dh000000-0000-0000-0000-000000000005', 42.0, 'medium', 'v2.4', NOW() - INTERVAL '2 days'),
    ('dr000000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'dh000000-0000-0000-0000-000000000006', 86.0, 'high', 'v2.4', NOW() - INTERVAL '5 days');

  -- Re-insert demo referrals
  INSERT INTO public.referrals (id, patient_id, risk_assessment_id, referred_to_facility_id, receiving_hospital_name, reason, priority, status, created_at) VALUES
    ('dref0000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000004', 'dr000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur', 'Demo Critical: Hypertensive Urgency (BP 178/106) & Hypoxia (SpO2 89%)', 'emergency', 'pending', NOW() - INTERVAL '3 days'),
    ('dref0000-0000-0000-0000-000000000006', 'd0000000-0000-0000-0000-000000000006', 'dr000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'Demo Referred: CHF Exacerbation & Oxygen Support', 'urgent', 'accepted', NOW() - INTERVAL '5 days');

  -- Re-insert demo follow-ups
  INSERT INTO public.follow_ups (id, patient_id, referral_id, scheduled_date, status, notes) VALUES
    ('df100000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', NULL, CURRENT_DATE - INTERVAL '5 days', 'missed', 'Demo 3: Overdue glycemic checkup (Missed follow-up)'),
    ('df100000-0000-0000-0000-000000000005', 'd0000000-0000-0000-0000-000000000005', NULL, CURRENT_DATE, 'scheduled', 'Demo 5: Follow-up Due Today for fever re-check');

  RETURN jsonb_build_object('success', true, 'count', 6, 'message', 'Demo data reset successfully without affecting real patient records.');
END;
$$;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
