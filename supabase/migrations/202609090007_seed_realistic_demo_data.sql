-- GramCare / GramSwasthya Realistic Fictional Seed Demo Data (SIH 2026)
-- Run this SQL script in your Supabase SQL Editor to populate realistic rural patient records, health vitals, AI risk assessments, referrals, and follow-ups.
-- All names, phone numbers, and addresses are strictly fictional.

-- 1. Insert Facilities
INSERT INTO public.facilities (id, name, code, village, address)
VALUES 
  ('a1000000-0000-0000-0000-000000000001', 'GramCare Primary Health Centre Rampur', 'PHC-RMP-01', 'Rampur', 'Main Road, Rampur Gram Panchayat, Block A'),
  ('a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'CHC-SND-02', 'Sundarpur', 'CHC Complex, Sundarpur'),
  ('a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur', 'SDH-CHP-03', 'Chandpur', 'Station Road, Chandpur District HQ')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 2. Insert Fictional Patients (18 Patients)
INSERT INTO public.patients (
  id, name, age, gender, village, gram_panchayat, block, district, address, phone, 
  guardian_name, emergency_contact, blood_group, existing_conditions, allergies, current_medications, created_at
) VALUES
  (
    'p1000000-0000-0000-0000-000000000001', 'Sunita Devi', 32, 'female', 'Rampur', 'Rampur GP', 'Block East', 'Grampur',
    'House 42, Near Primary School, Rampur', '+91 98000 00001', 'Ramesh Patel', '+91 98000 00002', 'O+',
    ARRAY['ANC 28 Weeks Pregnancy', 'Mild Anemia'], ARRAY['Penicillin'], ARRAY['Iron Folic Acid Tablets'], NOW() - INTERVAL '15 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000002', 'Kamla Bai', 68, 'female', 'Sundarpur', 'Sundarpur GP', 'Block North', 'Grampur',
    'House 12, West Lane, Sundarpur', '+91 98000 00003', 'Suresh Patel', '+91 98000 00004', 'B+',
    ARRAY['Hypertension', 'COPD'], ARRAY[]::text[], ARRAY['Amlodipine 5mg', 'Salbutamol Inhaler'], NOW() - INTERVAL '14 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000003', 'Vikram Singh', 54, 'male', 'Rampur', 'Rampur GP', 'Block East', 'Grampur',
    'Plot 88, Near Temple, Rampur', '+91 98000 00005', 'Anita Singh', '+91 98000 00006', 'A+',
    ARRAY['Type 2 Diabetes', 'Ischemic Heart Disease'], ARRAY['Sulfa Drugs'], ARRAY['Metformin 500mg', 'Aspirin 75mg'], NOW() - INTERVAL '12 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000004', 'Rajesh Kumar', 44, 'male', 'Chandpur', 'Chandpur GP', 'Block Central', 'Grampur',
    'House 105, East Ward, Chandpur', '+91 98000 00007', 'Priya Kumar', '+91 98000 00008', 'AB+',
    ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], NOW() - INTERVAL '10 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000005', 'Anita Verma', 28, 'female', 'Devpur', 'Devpur GP', 'Block South', 'Grampur',
    'House 19, Devpur Main Village', '+91 98000 00009', 'Mahesh Verma', '+91 98000 00010', 'O-',
    ARRAY['ANC 16 Weeks'], ARRAY[]::text[], ARRAY['Calcium Supplements', 'Folic Acid'], NOW() - INTERVAL '9 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000006', 'Gopal Das', 62, 'male', 'Kishangarh', 'Kishangarh GP', 'Block West', 'Grampur',
    'House 74, Kishangarh', '+91 98000 00011', 'Lata Das', '+91 98000 00012', 'B-',
    ARRAY['Chronic Kidney Disease Stage 2', 'Hypertension'], ARRAY[]::text[], ARRAY['Enalapril 5mg'], NOW() - INTERVAL '8 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000007', 'Meena Sharma', 49, 'female', 'Belpur', 'Belpur GP', 'Block East', 'Grampur',
    'House 53, Belpur', '+91 98000 00013', 'Dinesh Sharma', '+91 98000 00014', 'A-',
    ARRAY['Hypothyroidism'], ARRAY[]::text[], ARRAY['Levothyroxine 50mcg'], NOW() - INTERVAL '7 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000008', 'Suresh Chand', 71, 'male', 'Shivpuri', 'Shivpuri GP', 'Block North', 'Grampur',
    'House 31, Shivpuri', '+91 98000 00015', 'Ravi Chand', '+91 98000 00016', 'O+',
    ARRAY['Bronchial Asthma', 'Congestive Heart Failure'], ARRAY[]::text[], ARRAY['Furosemide 20mg', 'Deriphyllin'], NOW() - INTERVAL '6 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000009', 'Priya Yadav', 25, 'female', 'Gopalpur', 'Gopalpur GP', 'Block South', 'Grampur',
    'House 67, Gopalpur', '+91 98000 00017', 'Sunil Yadav', '+91 98000 00018', 'B+',
    ARRAY['Moderate Anemia'], ARRAY[]::text[], ARRAY['Iron Syrup'], NOW() - INTERVAL '5 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000010', 'Mohan Lal', 57, 'male', 'Rampur', 'Rampur GP', 'Block East', 'Grampur',
    'House 89, Rampur', '+91 98000 00019', 'Savita Lal', '+91 98000 00020', 'AB-',
    ARRAY['Uncontrolled Diabetes'], ARRAY[]::text[], ARRAY['Glimepiride 2mg', 'Metformin 1000mg'], NOW() - INTERVAL '5 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000011', 'Shakuntala Devi', 65, 'female', 'Sundarpur', 'Sundarpur GP', 'Block North', 'Grampur',
    'House 40, Sundarpur', '+91 98000 00021', 'Vinod Kumar', '+91 98000 00022', 'O+',
    ARRAY['Osteoarthritis'], ARRAY[]::text[], ARRAY['Paracetamol 500mg PRN'], NOW() - INTERVAL '4 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000012', 'Radha Rani', 30, 'female', 'Chandpur', 'Chandpur GP', 'Block Central', 'Grampur',
    'House 122, Chandpur', '+91 98000 00023', 'Krishna Kumar', '+91 98000 00024', 'A+',
    ARRAY['ANC 32 Weeks High Risk Preeclampsia Watch'], ARRAY[]::text[], ARRAY['Labetalol 100mg', 'Iron Folic Acid'], NOW() - INTERVAL '3 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000013', 'Ashok Kumar', 51, 'male', 'Devpur', 'Devpur GP', 'Block South', 'Grampur',
    'House 05, Devpur', '+91 98000 00025', 'Rekha Kumar', '+91 98000 00026', 'B+',
    ARRAY['Hypertension Grade 1'], ARRAY[]::text[], ARRAY['Telmisartan 40mg'], NOW() - INTERVAL '3 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000014', 'Kavita Patel', 29, 'female', 'Kishangarh', 'Kishangarh GP', 'Block West', 'Grampur',
    'House 94, Kishangarh', '+91 98000 00027', 'Nitin Patel', '+91 98000 00028', 'O+',
    ARRAY['Postpartum Routine Check'], ARRAY[]::text[], ARRAY['Multivitamin Syrup'], NOW() - INTERVAL '2 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000015', 'Dinesh Singh', 46, 'male', 'Belpur', 'Belpur GP', 'Block East', 'Grampur',
    'House 18, Belpur', '+91 98000 00029', 'Kamlesh Singh', '+91 98000 00030', 'A+',
    ARRAY['Acute Malarial Fever'], ARRAY[]::text[], ARRAY['Chloroquine 250mg', 'Paracetamol 650mg'], NOW() - INTERVAL '2 days'
  ),
  (
    'p1000000-0000-0000-0000-000000000016', 'Savitri Bai', 40, 'female', 'Shivpuri', 'Shivpuri GP', 'Block North', 'Grampur',
    'House 51, Shivpuri', '+91 98000 00031', 'Babu Lal', '+91 98000 00032', 'AB+',
    ARRAY['Severe Hypertension'], ARRAY[]::text[], ARRAY['Amlodipine 10mg'], NOW() - INTERVAL '1 day'
  ),
  (
    'p1000000-0000-0000-0000-000000000017', 'Harish Patel', 43, 'male', 'Gopalpur', 'Gopalpur GP', 'Block South', 'Grampur',
    'House 03, Gopalpur', '+91 98000 00033', 'Maya Patel', '+91 98000 00034', 'B+',
    ARRAY[]::text[], ARRAY[]::text[], ARRAY[]::text[], NOW() - INTERVAL '12 hours'
  ),
  (
    'p1000000-0000-0000-0000-000000000018', 'Tarun Verma', 36, 'male', 'Rampur', 'Rampur GP', 'Block East', 'Grampur',
    'House 77, Rampur', '+91 98000 00035', 'Sunita Verma', '+91 98000 00036', 'O+',
    ARRAY['Acute Chest Tightness'], ARRAY[]::text[], ARRAY[]::text[], NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Insert Health Vitals Records
INSERT INTO public.health_records (
  id, patient_id, systolic_bp, diastolic_bp, blood_sugar, weight_kg, temperature_c, pulse_bpm, spo2, symptoms, notes, recorded_at
) VALUES
  ('h1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 148, 94, 110, 58, 37.0, 88, 96, 'Dizziness, pedal edema', 'ANC 28 Weeks screening', NOW() - INTERVAL '15 days'),
  ('h1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 175, 105, 160, 62, 37.2, 98, 89, 'Shortness of breath, fatigue', 'COPD exacerbation watch', NOW() - INTERVAL '14 days'),
  ('h1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 165, 98, 280, 78, 36.8, 102, 94, 'Chest tightness, excessive thirst', 'Severe hyperglycemia & BP', NOW() - INTERVAL '12 days'),
  ('h1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 120, 80, 95, 70, 36.6, 72, 99, 'None', 'Routine health wellness check', NOW() - INTERVAL '10 days'),
  ('h1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', 115, 75, 90, 54, 36.7, 76, 98, 'Mild nausea', 'Second trimester ANC checkup', NOW() - INTERVAL '9 days'),
  ('h1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', 152, 92, 195, 66, 36.9, 84, 95, 'Bilateral leg swelling', 'Renal follow up screening', NOW() - INTERVAL '8 days'),
  ('h1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000007', 124, 82, 105, 59, 36.7, 74, 98, 'Mild cold', 'Routine thyroid monitoring', NOW() - INTERVAL '7 days'),
  ('h1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', 160, 95, 140, 68, 37.1, 92, 88, 'Orthopnea, wheezing', 'Low oxygen alert', NOW() - INTERVAL '6 days'),
  ('h1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000009', 118, 76, 88, 48, 36.8, 78, 97, 'Pale conjunctiva, weakness', 'Anemia screening', NOW() - INTERVAL '5 days'),
  ('h1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000010', 142, 88, 240, 75, 36.7, 80, 96, 'Blurry vision, frequent urination', 'Diabetes control review', NOW() - INTERVAL '5 days'),
  ('h1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000011', 128, 82, 102, 63, 36.6, 70, 98, 'Knee stiffness', 'Geriatric routine visit', NOW() - INTERVAL '4 days'),
  ('h1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000012', 158, 102, 115, 64, 37.0, 94, 96, 'Severe headache, blurred vision', 'Preeclampsia warning signs', NOW() - INTERVAL '3 days'),
  ('h1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000013', 138, 86, 110, 72, 36.6, 76, 98, 'Mild neck stiffness', 'Hypertension follow up', NOW() - INTERVAL '3 days'),
  ('h1000000-0000-0000-0000-000000000014', 'p1000000-0000-0000-0000-000000000014', 114, 74, 92, 52, 36.7, 72, 99, 'None', '6-week postpartum check', NOW() - INTERVAL '2 days'),
  ('h1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000015', 130, 84, 118, 65, 39.4, 104, 96, 'High fever with chills, body ache', 'Febrile illness evaluation', NOW() - INTERVAL '2 days'),
  ('h1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000016', 170, 104, 135, 69, 36.8, 86, 95, 'Occipital headache', 'Hypertensive urgency triage', NOW() - INTERVAL '1 day'),
  ('h1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000017', 122, 78, 96, 68, 36.6, 72, 98, 'None', 'Routine baseline intake', NOW() - INTERVAL '12 hours'),
  ('h1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000018', 162, 96, 145, 76, 36.9, 110, 92, 'Acute retrosternal chest pain, diaphoresis', 'Possible acute coronary syndrome', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET symptoms = EXCLUDED.symptoms;

-- 4. Insert Risk Assessments
INSERT INTO public.risk_assessments (
  id, patient_id, health_record_id, risk_score, risk_level, model_version, assessed_at
) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 68.5, 'high', 'v2.4', NOW() - INTERVAL '15 days'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'h1000000-0000-0000-0000-000000000002', 91.0, 'critical', 'v2.4', NOW() - INTERVAL '14 days'),
  ('r1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 88.0, 'critical', 'v2.4', NOW() - INTERVAL '12 days'),
  ('r1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 'h1000000-0000-0000-0000-000000000004', 12.0, 'low', 'v2.4', NOW() - INTERVAL '10 days'),
  ('r1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', 'h1000000-0000-0000-0000-000000000005', 18.0, 'low', 'v2.4', NOW() - INTERVAL '9 days'),
  ('r1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', 'h1000000-0000-0000-0000-000000000006', 58.0, 'medium', 'v2.4', NOW() - INTERVAL '8 days'),
  ('r1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000007', 'h1000000-0000-0000-0000-000000000007', 22.0, 'low', 'v2.4', NOW() - INTERVAL '7 days'),
  ('r1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', 'h1000000-0000-0000-0000-000000000008', 85.0, 'critical', 'v2.4', NOW() - INTERVAL '6 days'),
  ('r1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000009', 'h1000000-0000-0000-0000-000000000009', 42.0, 'medium', 'v2.4', NOW() - INTERVAL '5 days'),
  ('r1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000010', 'h1000000-0000-0000-0000-000000000010', 64.0, 'high', 'v2.4', NOW() - INTERVAL '5 days'),
  ('r1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000011', 'h1000000-0000-0000-0000-000000000011', 25.0, 'low', 'v2.4', NOW() - INTERVAL '4 days'),
  ('r1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000012', 'h1000000-0000-0000-0000-000000000012', 82.5, 'high', 'v2.4', NOW() - INTERVAL '3 days'),
  ('r1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000013', 'h1000000-0000-0000-0000-000000000013', 38.0, 'medium', 'v2.4', NOW() - INTERVAL '3 days'),
  ('r1000000-0000-0000-0000-000000000014', 'p1000000-0000-0000-0000-000000000014', 'h1000000-0000-0000-0000-000000000014', 15.0, 'low', 'v2.4', NOW() - INTERVAL '2 days'),
  ('r1000000-0000-0000-0000-000000000015', 'p1000000-0000-0000-0000-000000000015', 'h1000000-0000-0000-0000-000000000015', 55.0, 'medium', 'v2.4', NOW() - INTERVAL '2 days'),
  ('r1000000-0000-0000-0000-000000000016', 'p1000000-0000-0000-0000-000000000016', 'h1000000-0000-0000-0000-000000000016', 78.0, 'high', 'v2.4', NOW() - INTERVAL '1 day'),
  ('r1000000-0000-0000-0000-000000000017', 'p1000000-0000-0000-0000-000000000017', 'h1000000-0000-0000-0000-000000000017', 10.0, 'low', 'v2.4', NOW() - INTERVAL '12 hours'),
  ('r1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000018', 'h1000000-0000-0000-0000-000000000018', 95.0, 'critical', 'v2.4', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET risk_score = EXCLUDED.risk_score;

-- 5. Insert Referrals
INSERT INTO public.referrals (
  id, patient_id, risk_assessment_id, referred_to_facility_id, receiving_hospital_name, reason, priority, status, created_at
) VALUES
  (
    'rf000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'Severe COPD exacerbation & low SpO2 89%', 'urgent', 'pending', NOW() - INTERVAL '14 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'r1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur', 'Severe hyperglycemia (280 mg/dL) & hypertensive crisis', 'emergency', 'accepted', NOW() - INTERVAL '12 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000008', 'r1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur', 'Congestive Heart Failure exacerbation (SpO2 88%)', 'emergency', 'in_transit', NOW() - INTERVAL '6 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000012', 'r1000000-0000-0000-0000-000000000012',
    'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'High risk ANC Preeclampsia evaluation (BP 158/102)', 'urgent', 'pending', NOW() - INTERVAL '3 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000016', 'r1000000-0000-0000-0000-000000000016',
    'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'Severe Hypertensive Urgency (BP 170/104)', 'urgent', 'pending', NOW() - INTERVAL '1 day'
  ),
  (
    'rf000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000018', 'r1000000-0000-0000-0000-000000000018',
    'a1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur', 'Suspected Acute Coronary Syndrome (Chest Pain + ECG needed)', 'emergency', 'pending', NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO UPDATE SET reason = EXCLUDED.reason;

-- 6. Insert Follow-ups
INSERT INTO public.follow_ups (
  id, patient_id, referral_id, scheduled_date, status, notes
) VALUES
  ('f1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', NULL, CURRENT_DATE + INTERVAL '1 day', 'scheduled', 'Routine ANC BP checkup & hemogram review'),
  ('f1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'rf000000-0000-0000-0000-000000000002', CURRENT_DATE, 'scheduled', 'Post-discharge glycemic control monitoring'),
  ('f1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000006', NULL, CURRENT_DATE + INTERVAL '2 days', 'scheduled', 'Renal function and BP re-check'),
  ('f1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000010', NULL, CURRENT_DATE - INTERVAL '1 day', 'missed', 'Diabetes medication adherence check'),
  ('f1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000009', NULL, CURRENT_DATE - INTERVAL '3 days', 'completed', 'Iron syrup supplementation compliance check'),
  ('f1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000012', 'rf000000-0000-0000-0000-000000000004', CURRENT_DATE + INTERVAL '3 days', 'scheduled', 'Preeclampsia outpatient BP log review')
ON CONFLICT (id) DO UPDATE SET status = EXCLUDED.status;

-- Reload schema cache
NOTIFY pgrst, 'reload schema';
