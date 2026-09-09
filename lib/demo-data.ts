import type { PatientRow, HealthRecord, RiskAssessment, Referral, FollowUp, Notification, AuditLog } from './types';

export const DEMO_PATIENTS: PatientRow[] = [
  {
    id: 'p-101',
    name: 'Sunita Devi',
    age: 48,
    gender: 'female',
    village: 'Rampur',
    address: 'House #14, Main Gram Gali, Rampur PHC Sector 2',
    phone: '+91 98765 43210',
    guardian_name: 'Rajesh Kumar',
    emergency_contact: '+91 98765 43211 (Husband)',
    blood_group: 'B+',
    existing_conditions: ['Hypertension', 'Type-2 Diabetes'],
    allergies: ['Penicillin'],
    current_medications: ['Amlodipine 5mg', 'Metformin 500mg'],
    created_at: '2026-09-08T10:15:00Z',
    latestRisk: {
      id: 'risk-101',
      patient_id: 'p-101',
      health_record_id: 'rec-101',
      risk_score: 88,
      risk_level: 'critical',
      model_version: 'GramCare-AI-v2.1',
      priority: 'URGENT REVIEW',
      warning_signals: ['Severely elevated Blood Pressure (172/105 mmHg)', 'Low SpO2 (92%)'],
      contributing_factors: ['Hypertension history', 'High Systolic BP', 'Hypoxia risk'],
      recommended_action: 'Immediate referral to District Hospital Cardiology Unit.',
      assessed_at: '2026-09-09T08:30:00Z'
    }
  },
  {
    id: 'p-102',
    name: 'Ramesh Singh',
    age: 62,
    gender: 'male',
    village: 'Sitapur',
    address: 'Near Old Panchayat Ghar, Sitapur',
    phone: '+91 91234 56789',
    guardian_name: 'Anil Singh',
    emergency_contact: '+91 91234 56790 (Son)',
    blood_group: 'O+',
    existing_conditions: ['COPD', 'Chronic Bronchitis'],
    allergies: ['Sulfa drugs'],
    current_medications: ['Deriphyllin 150mg', 'Salbutamol Inhaler'],
    created_at: '2026-09-07T14:20:00Z',
    latestRisk: {
      id: 'risk-102',
      patient_id: 'p-102',
      health_record_id: 'rec-102',
      risk_score: 76,
      risk_level: 'high',
      model_version: 'GramCare-AI-v2.1',
      priority: 'PRIORITY TRIAGE',
      warning_signals: ['Persistent high fever (39.2°C)', 'Tachycardia (110 bpm)'],
      contributing_factors: ['COPD history', 'High temperature', 'Elevated pulse rate'],
      recommended_action: 'Schedule same-day doctor consultation & chest X-ray.',
      assessed_at: '2026-09-09T07:15:00Z'
    }
  },
  {
    id: 'p-103',
    name: 'Pooja Sharma',
    age: 26,
    gender: 'female',
    village: 'Palampur',
    address: 'Near Anganwadi Center 3, Palampur',
    phone: '+91 94111 22334',
    guardian_name: 'Vikram Sharma',
    emergency_contact: '+91 94111 22335 (Husband)',
    blood_group: 'A+',
    existing_conditions: ['Antenatal - 28 Weeks Pregnant', 'Gestational Anemia'],
    allergies: [],
    current_medications: ['Iron & Folic Acid', 'Calcium D3'],
    created_at: '2026-09-06T09:00:00Z',
    latestRisk: {
      id: 'risk-103',
      patient_id: 'p-103',
      health_record_id: 'rec-103',
      risk_score: 52,
      risk_level: 'medium',
      model_version: 'GramCare-AI-v2.1',
      priority: 'ROUTINE MONITORING',
      warning_signals: ['Mild Anemia indicator (Hb estimated low)', 'Moderate fatigue'],
      contributing_factors: ['Third trimester pregnancy', 'Borderline BP'],
      recommended_action: 'Routine ANM follow-up visit in 3 days.',
      assessed_at: '2026-09-08T16:45:00Z'
    }
  },
  {
    id: 'p-104',
    name: 'Harish Chandra',
    age: 54,
    gender: 'male',
    village: 'Rampur',
    address: 'East Tola, Rampur',
    phone: '+91 97654 32109',
    guardian_name: 'Kamla Chandra',
    emergency_contact: '+91 97654 32110 (Wife)',
    blood_group: 'AB+',
    existing_conditions: ['Mild Asthma'],
    allergies: [],
    current_medications: ['Cetirizine 10mg'],
    created_at: '2026-09-05T11:30:00Z',
    latestRisk: {
      id: 'risk-104',
      patient_id: 'p-104',
      health_record_id: 'rec-104',
      risk_score: 22,
      risk_level: 'low',
      model_version: 'GramCare-AI-v2.1',
      priority: 'ROUTINE MONITORING',
      warning_signals: [],
      contributing_factors: ['Normal vitals'],
      recommended_action: 'Standard monthly health checkup.',
      assessed_at: '2026-09-05T11:35:00Z'
    }
  },
  {
    id: 'p-105',
    name: 'Meena Kumari',
    age: 39,
    gender: 'female',
    village: 'Kalyanpur',
    address: 'Near Post Office, Kalyanpur',
    phone: '+91 99887 76655',
    guardian_name: 'Sanjay Kumar',
    emergency_contact: '+91 99887 76656',
    blood_group: 'O-',
    existing_conditions: ['Thyroid Disorder'],
    allergies: ['Aspirin'],
    current_medications: ['Thyronorm 50mcg'],
    created_at: '2026-09-04T15:10:00Z',
    latestRisk: {
      id: 'risk-105',
      patient_id: 'p-105',
      health_record_id: 'rec-105',
      risk_score: 31,
      risk_level: 'low',
      model_version: 'GramCare-AI-v2.1',
      priority: 'ROUTINE MONITORING',
      warning_signals: [],
      contributing_factors: ['Stable vitals'],
      recommended_action: 'Continue prescribed medications.',
      assessed_at: '2026-09-04T15:15:00Z'
    }
  }
];

export const DEMO_REFERRALS: Referral[] = [
  {
    id: 'ref-201',
    patient_id: 'p-101',
    risk_assessment_id: 'risk-101',
    referred_by: 'ASHA Worker Savita',
    referred_to_text: 'District Civil Hospital Triage Unit',
    referred_to_facility_id: 'fac-1',
    referred_to_doctor_id: 'doc-1',
    status: 'pending',
    priority: 'urgent',
    reason: 'Hypertensive emergency with blood pressure 172/105 mmHg & chest tightness.',
    symptoms: 'Headache, chest discomfort, shortness of breath',
    clinical_notes: 'Patient administered sublingual Nifedipine at PHC. Transport requested.',
    expected_visit_date: '2026-09-09',
    created_at: '2026-09-09T08:45:00Z'
  },
  {
    id: 'ref-202',
    patient_id: 'p-102',
    risk_assessment_id: 'risk-102',
    referred_by: 'Dr. Anita Verma (Rampur PHC)',
    referred_to_text: 'Sub-Divisional Hospital Pulmonology',
    referred_to_facility_id: 'fac-2',
    referred_to_doctor_id: 'doc-2',
    status: 'accepted',
    priority: 'priority',
    reason: 'Acute COPD exacerbation with high fever (39.2°C) unresponsive to oral antibiotics.',
    symptoms: 'Productive cough, high fever, wheezing',
    clinical_notes: 'Nebulization given at PHC. Accepted by Dr. Rao.',
    expected_visit_date: '2026-09-09',
    created_at: '2026-09-08T11:20:00Z'
  },
  {
    id: 'ref-203',
    patient_id: 'p-103',
    risk_assessment_id: 'risk-103',
    referred_by: 'ANM Rekha Rani',
    referred_to_text: 'Community Health Center OB/GYN',
    referred_to_facility_id: 'fac-3',
    referred_to_doctor_id: 'doc-3',
    status: 'completed',
    priority: 'routine',
    reason: 'Third-trimester antenatal checkup and Hb estimation.',
    symptoms: 'Fatigue, mild swelling in feet',
    clinical_notes: 'Ultrasound completed. Hb level 10.2 g/dL. Iron supplements continued.',
    expected_visit_date: '2026-09-07',
    created_at: '2026-09-06T10:00:00Z'
  }
];

export const DEMO_FOLLOWUPS: FollowUp[] = [
  {
    id: 'fol-301',
    patient_id: 'p-101',
    referral_id: 'ref-201',
    scheduled_date: '2026-09-10',
    status: 'upcoming',
    notes: 'Post-referral BP re-check and medication adherence verification.',
    updated_at: '2026-09-09T09:00:00Z'
  },
  {
    id: 'fol-302',
    patient_id: 'p-102',
    referral_id: 'ref-202',
    scheduled_date: '2026-09-09',
    status: 'scheduled',
    notes: 'Same-day clinical follow-up for chest symptom resolution.',
    updated_at: '2026-09-08T12:00:00Z'
  },
  {
    id: 'fol-303',
    patient_id: 'p-103',
    referral_id: 'ref-203',
    scheduled_date: '2026-09-05',
    status: 'missed',
    notes: 'Patient missed scheduled home visit for routine ANC monitoring. ASHA alerted.',
    updated_at: '2026-09-06T08:00:00Z'
  }
];

export const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-401',
    patient_id: 'p-101',
    title: 'CRITICAL TRIAGE ALERT',
    message: 'Sunita Devi (Rampur) assessed at CRITICAL risk score 88/100 (Hypertension 172/105 mmHg).',
    type: 'high_risk',
    is_read: false,
    created_at: '2026-09-09T08:30:00Z'
  },
  {
    id: 'notif-402',
    patient_id: 'p-102',
    title: 'Referral Status Updated',
    message: 'Referral for Ramesh Singh accepted by Sub-Divisional Hospital Pulmonology.',
    type: 'referral',
    is_read: false,
    created_at: '2026-09-08T14:15:00Z'
  },
  {
    id: 'notif-403',
    patient_id: 'p-103',
    title: 'Follow-Up Missed',
    message: 'Follow-up visit for Pooja Sharma was missed on Sep 5. Action required.',
    type: 'follow_up',
    is_read: true,
    created_at: '2026-09-06T09:00:00Z'
  }
];

export const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-501',
    user_id: 'usr-1',
    action: 'CREATE_PATIENT',
    entity_type: 'patient',
    entity_id: 'p-101',
    details: { name: 'Sunita Devi', village: 'Rampur', registered_by: 'ASHA Savita' },
    created_at: '2026-09-08T10:15:00Z'
  },
  {
    id: 'audit-502',
    user_id: 'usr-1',
    action: 'AI_RISK_ASSESSMENT',
    entity_type: 'risk_assessment',
    entity_id: 'risk-101',
    details: { risk_score: 88, risk_level: 'critical', patient_name: 'Sunita Devi' },
    created_at: '2026-09-09T08:30:00Z'
  },
  {
    id: 'audit-503',
    user_id: 'usr-2',
    action: 'CREATE_REFERRAL',
    entity_type: 'referral',
    entity_id: 'ref-201',
    details: { destination: 'District Civil Hospital', priority: 'urgent' },
    created_at: '2026-09-09T08:45:00Z'
  }
];
