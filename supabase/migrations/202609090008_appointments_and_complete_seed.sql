-- GramCare / GramSwasthya Complete Connected Demo Data Migration (SIH 2026)
-- Adds appointments table, doctors/facilities schema extensions, and seeds connected test data.

-- 1. Extend Facilities & Users Tables Safely
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS facility_type text DEFAULT 'Community Health Centre';
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS services text[] DEFAULT ARRAY['Emergency Care', 'Vitals Screening', 'General Medicine'];
ALTER TABLE public.facilities ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS specialization text DEFAULT 'General Medicine';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS availability text DEFAULT 'Mon - Sat (8 AM - 4 PM)';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS status text DEFAULT 'On Duty';

-- 2. Create Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  facility_id uuid REFERENCES public.facilities(id) ON DELETE SET NULL,
  referral_id uuid REFERENCES public.referrals(id) ON DELETE SET NULL,
  appointment_date timestamptz NOT NULL,
  purpose text NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  clinical_notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "appointments_select" ON public.appointments;
DROP POLICY IF EXISTS "appointments_insert" ON public.appointments;
DROP POLICY IF EXISTS "appointments_update" ON public.appointments;
CREATE POLICY "appointments_select" ON public.appointments FOR SELECT TO authenticated USING (true);
CREATE POLICY "appointments_insert" ON public.appointments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "appointments_update" ON public.appointments FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- 3. Seed Fictional Healthcare Facilities (4 Facilities)
INSERT INTO public.facilities (id, name, code, village, address, facility_type, services, status)
VALUES 
  (
    'a1000000-0000-0000-0000-000000000001', 'GramCare Primary Health Centre Rampur', 'PHC-RMP-01', 'Rampur',
    'Main Road, Rampur Gram Panchayat', 'Primary Health Centre',
    ARRAY['ANC Checkups', 'Vitals Screening', 'Emergency First Aid', 'Tele-Referral'], 'Active'
  ),
  (
    'a1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur', 'CHC-SND-02', 'Sundarpur',
    'CHC Complex, Sundarpur', 'Community Health Centre',
    ARRAY['24x7 Emergency', 'Oxygen Support', 'Blood Testing Lab', 'Inpatient Ward'], 'Active'
  ),
  (
    'a1000000-0000-0000-0000-000000000003', 'Sub-Divisional District Hospital Chandpur', 'SDH-CHP-03', 'Chandpur',
    'Station Road, Chandpur HQ', 'District Hospital',
    ARRAY['ICU 24x7', 'Cardiology Unit', 'Emergency Surgery', 'High Risk Obstetrics'], 'Active'
  ),
  (
    'a1000000-0000-0000-0000-000000000004', 'Regional Teaching Hospital Grampur', 'RTH-GMP-04', 'Grampur',
    'Medical Campus, Grampur City', 'Tertiary Medical College',
    ARRAY['Trauma Center', 'NICU / PICU', 'Dialysis Unit', 'Advanced Cardiology'], 'Active'
  )
ON CONFLICT (id) DO UPDATE SET 
  facility_type = EXCLUDED.facility_type, 
  services = EXCLUDED.services, 
  status = EXCLUDED.status;

-- 4. Seed Fictional Doctors (5 Doctors into public.users)
-- Note: inserting dummy auth IDs for clinical demo catalog query
INSERT INTO public.users (id, name, role, email, phone, facility_id, specialization, designation, department, availability, status)
VALUES 
  (
    'd1000000-0000-0000-0000-000000000001', 'Dr. Rajesh Sharma', 'doctor', 'dr.rajesh.sharma@gramcare.org', '+91 98765 43210',
    'a1000000-0000-0000-0000-000000000001', 'General Medicine & Triage', 'Senior Medical Officer', 'General Medicine', 'Mon - Sat (8 AM - 4 PM)', 'On Duty'
  ),
  (
    'd1000000-0000-0000-0000-000000000002', 'Dr. Ananya Sen', 'doctor', 'dr.ananya.sen@gramcare.org', '+91 98765 43211',
    'a1000000-0000-0000-0000-000000000002', 'Obstetrics & Maternal Care', 'Chief Gynecologist', 'Maternal Health', 'Mon - Fri (9 AM - 5 PM)', 'Available'
  ),
  (
    'd1000000-0000-0000-0000-000000000003', 'Dr. Vikram Malhotra', 'doctor', 'dr.vikram.malhotra@gramcare.org', '+91 98765 43212',
    'a1000000-0000-0000-0000-000000000003', 'Cardiology & Intensive Care', 'Consultant Cardiologist', 'Cardiology', '24x7 Emergency Shift', 'On Duty'
  ),
  (
    'd1000000-0000-0000-0000-000000000004', 'Dr. Meenakshi Sundaram', 'doctor', 'dr.meenakshi@gramcare.org', '+91 98765 43213',
    'a1000000-0000-0000-0000-000000000002', 'Pediatrics & Child Health', 'Pediatric Specialist', 'Pediatrics', 'Mon - Sat (9 AM - 3 PM)', 'Available'
  ),
  (
    'd1000000-0000-0000-0000-000000000005', 'Dr. Suresh Kulkarni', 'doctor', 'dr.suresh.kulkarni@gramcare.org', '+91 98765 43214',
    'a1000000-0000-0000-0000-000000000003', 'Nephrology & Surgery', 'Chief General Surgeon', 'Surgery', 'Mon - Fri (10 AM - 6 PM)', 'Available'
  )
ON CONFLICT (id) DO UPDATE SET 
  specialization = EXCLUDED.specialization,
  designation = EXCLUDED.designation,
  department = EXCLUDED.department,
  availability = EXCLUDED.availability,
  status = EXCLUDED.status;

-- 5. Seed Fictional Patients (18 Patients)
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

-- 6. Seed Health Vitals Records (10 Records)
INSERT INTO public.health_records (
  id, patient_id, systolic_bp, diastolic_bp, blood_sugar, weight_kg, temperature_c, pulse_bpm, spo2, symptoms, notes, recorded_at
) VALUES
  ('h1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 148, 94, 110, 58, 37.0, 88, 96, 'Dizziness, pedal edema', 'ANC 28 Weeks screening', NOW() - INTERVAL '15 days'),
  ('h1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 175, 105, 160, 62, 37.2, 98, 89, 'Shortness of breath, fatigue', 'COPD exacerbation watch', NOW() - INTERVAL '14 days'),
  ('h1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 165, 98, 280, 78, 36.8, 102, 94, 'Chest tightness, excessive thirst', 'Severe hyperglycemia & BP', NOW() - INTERVAL '12 days'),
  ('h1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000004', 120, 80, 95, 70, 36.6, 72, 99, 'None', 'Routine health wellness check', NOW() - INTERVAL '10 days'),
  ('h1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000005', 115, 75, 90, 54, 36.7, 76, 98, 'Mild nausea', 'Second trimester ANC checkup', NOW() - INTERVAL '9 days'),
  ('h1000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', 152, 92, 195, 66, 36.9, 84, 95, 'Bilateral leg swelling', 'Renal follow up screening', NOW() - INTERVAL '8 days'),
  ('h1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', 160, 95, 140, 68, 37.1, 92, 88, 'Orthopnea, wheezing', 'Low oxygen alert', NOW() - INTERVAL '6 days'),
  ('h1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000010', 142, 88, 240, 75, 36.7, 80, 96, 'Blurry vision, frequent urination', 'Diabetes control review', NOW() - INTERVAL '5 days'),
  ('h1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000012', 158, 102, 115, 64, 37.0, 94, 96, 'Severe headache, blurred vision', 'Preeclampsia warning signs', NOW() - INTERVAL '3 days'),
  ('h1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000018', 162, 96, 145, 76, 36.9, 110, 92, 'Acute retrosternal chest pain', 'Possible acute coronary syndrome', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET symptoms = EXCLUDED.symptoms;

-- 7. Seed AI Risk Assessments (7 Assessments)
INSERT INTO public.risk_assessments (
  id, patient_id, health_record_id, risk_score, risk_level, model_version, assessed_at
) VALUES
  ('r1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000001', 'h1000000-0000-0000-0000-000000000001', 68.5, 'high', 'v2.4', NOW() - INTERVAL '15 days'),
  ('r1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000002', 'h1000000-0000-0000-0000-000000000002', 91.0, 'critical', 'v2.4', NOW() - INTERVAL '14 days'),
  ('r1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000003', 'h1000000-0000-0000-0000-000000000003', 88.0, 'critical', 'v2.4', NOW() - INTERVAL '12 days'),
  ('r1000000-0000-0000-0000-000000000008', 'p1000000-0000-0000-0000-000000000008', 'h1000000-0000-0000-0000-000000000008', 85.0, 'critical', 'v2.4', NOW() - INTERVAL '6 days'),
  ('r1000000-0000-0000-0000-000000000010', 'p1000000-0000-0000-0000-000000000010', 'h1000000-0000-0000-0000-000000000010', 64.0, 'high', 'v2.4', NOW() - INTERVAL '5 days'),
  ('r1000000-0000-0000-0000-000000000012', 'p1000000-0000-0000-0000-000000000012', 'h1000000-0000-0000-0000-000000000012', 82.5, 'high', 'v2.4', NOW() - INTERVAL '3 days'),
  ('r1000000-0000-0000-0000-000000000018', 'p1000000-0000-0000-0000-000000000018', 'h1000000-0000-0000-0000-000000000018', 95.0, 'critical', 'v2.4', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET risk_score = EXCLUDED.risk_score;

-- 8. Seed Inter-Facility Referrals (6 Referrals)
INSERT INTO public.referrals (
  id, patient_id, risk_assessment_id, referred_to_facility_id, referred_to_doctor_id, receiving_hospital_name, reason, priority, status, created_at
) VALUES
  (
    'rf000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002', 'r1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Community Health Centre Sundarpur',
    'Severe COPD exacerbation & low SpO2 89%', 'urgent', 'pending', NOW() - INTERVAL '14 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000003', 'r1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur',
    'Severe hyperglycemia (280 mg/dL) & hypertensive crisis', 'emergency', 'accepted', NOW() - INTERVAL '12 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000008', 'r1000000-0000-0000-0000-000000000008',
    'a1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur',
    'Congestive Heart Failure exacerbation (SpO2 88%)', 'emergency', 'in_transit', NOW() - INTERVAL '6 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000012', 'r1000000-0000-0000-0000-000000000012',
    'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000002', 'Community Health Centre Sundarpur',
    'High risk ANC Preeclampsia evaluation (BP 158/102)', 'urgent', 'pending', NOW() - INTERVAL '3 days'
  ),
  (
    'rf000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000016', 'r1000000-0000-0000-0000-000000000016',
    'a1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'Community Health Centre Sundarpur',
    'Severe Hypertensive Urgency (BP 170/104)', 'urgent', 'pending', NOW() - INTERVAL '1 day'
  ),
  (
    'rf000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000018', 'r1000000-0000-0000-0000-000000000018',
    'a1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003', 'District Sub-Divisional Hospital Chandpur',
    'Suspected Acute Coronary Syndrome (Chest Pain + ECG needed)', 'emergency', 'pending', NOW() - INTERVAL '2 hours'
  )
ON CONFLICT (id) DO UPDATE SET reason = EXCLUDED.reason;

-- 9. Seed Appointments (6 Appointments)
INSERT INTO public.appointments (
  id, patient_id, doctor_id, facility_id, referral_id, appointment_date, purpose, status, clinical_notes
) VALUES
  (
    'ap000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003', 'rf000000-0000-0000-0000-000000000002', NOW() + INTERVAL '1 day',
    'Emergency Glycemic & Cardiac Evaluation', 'scheduled', 'Patient referred for severe hyperglycemia. Insulin protocol setup.'
  ),
  (
    'ap000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000012', 'd1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000002', 'rf000000-0000-0000-0000-000000000004', NOW() + INTERVAL '2 days',
    'Specialist ANC & Preeclampsia Workup', 'confirmed', 'Labetalol dosing & fetal doppler monitoring.'
  ),
  (
    'ap000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000008', 'd1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003', 'rf000000-0000-0000-0000-000000000003', NOW() + INTERVAL '4 hours',
    'Immediate ICU Consultation (CHF)', 'in_progress', '108 Ambulance en route. Oxygen administration active.'
  ),
  (
    'ap000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001', NULL, NOW() + INTERVAL '3 days',
    'Routine 28-Week Maternal Health Check', 'scheduled', 'Hemogram & BP follow-up review.'
  ),
  (
    'ap000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000018', 'd1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000003', 'rf000000-0000-0000-0000-000000000006', NOW() + INTERVAL '1 hour',
    'Emergency Chest Pain Triage & ECG', 'confirmed', '12-lead ECG & Troponin I biomarker test requested.'
  ),
  (
    'ap000000-0000-0000-0000-000000000006', 'p1000000-0000-0000-0000-000000000006', 'd1000000-0000-0000-0000-000000000005',
    'a1000000-0000-0000-0000-000000000003', NULL, NOW() + INTERVAL '5 days',
    'Renal Function & Serum Creatinine Review', 'scheduled', 'Routine outpatient nephrology visit.'
  )
ON CONFLICT (id) DO UPDATE SET purpose = EXCLUDED.purpose;

-- 10. Seed Follow-ups (6 Follow-ups)
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

-- 11. Seed Notifications (5 Notifications)
INSERT INTO public.notifications (
  id, patient_id, title, message, type, is_read, created_at
) VALUES
  (
    'n1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000018',
    'CRITICAL: Acute Chest Pain Alert', 'Patient Tarun Verma flagged for Emergency Chest Pain Triage at Rampur PHC',
    'high_risk', false, NOW() - INTERVAL '2 hours'
  ),
  (
    'n1000000-0000-0000-0000-000000000002', 'p1000000-0000-0000-0000-000000000012',
    'New Urgent Referral', 'Priority ANC Preeclampsia referral sent to Community Health Centre Sundarpur',
    'referral', false, NOW() - INTERVAL '3 days'
  ),
  (
    'n1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000008',
    'Ambulance In-Transit Notification', '108 Emergency Ambulance dispatched for patient Suresh Chand (CHF exacerbation)',
    'referral', true, NOW() - INTERVAL '6 days'
  ),
  (
    'n1000000-0000-0000-0000-000000000004', 'p1000000-0000-0000-0000-000000000003',
    'Referral Accepted by Specialist', 'Dr. Vikram Malhotra accepted referral for patient Vikram Singh',
    'referral', true, NOW() - INTERVAL '12 days'
  ),
  (
    'n1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000001',
    'ASHA Follow-up Scheduled', 'Follow-up visit due tomorrow for Sunita Devi (ANC BP Check)',
    'follow_up', false, NOW() - INTERVAL '1 day'
  )
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 12. Reload PostgREST Schema Cache
NOTIFY pgrst, 'reload schema';
