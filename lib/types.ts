export type UserRole = 'patient' | 'asha' | 'anm' | 'doctor' | 'medical_officer' | 'hospital' | 'admin';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type ReferralStatus = 
  | 'pending' 
  | 'accepted' 
  | 'in_transit' 
  | 'arrived' 
  | 'treatment_started' 
  | 'completed' 
  | 'cancelled' 
  | 'rejected';

export type FollowUpStatus = 'upcoming' | 'scheduled' | 'completed' | 'missed';
export type ReferralPriority = 'routine' | 'priority' | 'urgent';
export type SyncStatus = 'pending' | 'synced' | 'failed';

export interface SyncMetadata {
  local_id?: string;
  server_id?: string;
  sync_status?: SyncStatus;
  sync_attempts?: number;
  last_sync_error?: string | null;
  updated_at?: string;
}

export interface WomensHealthInfo {
  pregnancy_status?: boolean;
  expected_delivery_date?: string | null;
  anc_visits_count?: number;
  high_risk_pregnancy_indicators?: string[];
  postnatal_care_notes?: string | null;
}

export interface ChildHealthInfo {
  birth_weight_kg?: number | null;
  immunization_status?: 'up_to_date' | 'pending' | 'overdue';
  growth_milestone_notes?: string | null;
}

export interface LifestyleRiskInfo {
  tobacco?: boolean;
  alcohol?: boolean;
  nutrition?: 'normal' | 'underweight' | 'malnourished' | 'anemic';
}

export interface Patient extends SyncMetadata {
  id: string;
  patient_code?: string | null;
  is_demo?: boolean;
  name: string;
  age: number;
  gender: string;
  village: string | null;
  address: string | null;
  phone: string | null;
  guardian_name: string | null;
  emergency_contact?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_relation?: string | null;
  emergency_contact_phone?: string | null;
  blood_group?: string | null;
  rh_factor?: string | null;
  gram_panchayat?: string | null;
  block?: string | null;
  district?: string | null;
  state?: string | null;
  pincode?: string | null;
  phc_assigned?: string | null;
  village_id?: string | null;
  dob?: string | null;
  preferred_language?: string | null;
  marital_status?: string | null;
  occupation?: string | null;
  existing_conditions?: string[] | null;
  allergies?: string[] | null;
  current_medications?: string[] | null;
  family_history?: string | null;
  lifestyle_risk?: LifestyleRiskInfo | null;
  womens_health?: WomensHealthInfo | null;
  child_health?: ChildHealthInfo | null;
  registered_by?: string;
  created_at: string;
}

export interface HealthRecord extends SyncMetadata {
  id: string;
  patient_id: string;
  recorded_by?: string;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  blood_sugar: number | null;
  weight_kg: number | null;
  height_cm?: number | null;
  bmi?: number | null;
  temperature_c: number | null;
  pulse_bpm: number | null;
  spo2: number | null;
  respiratory_rate?: number | null;
  hemoglobin?: number | null;
  symptoms: string | null;
  notes: string | null;
  source_device?: string | null;
  recorded_at: string;
}

export interface RiskAssessment extends SyncMetadata {
  id: string;
  patient_id: string;
  health_record_id: string | null;
  risk_score: number;
  risk_level: RiskLevel;
  model_version: string;
  warning_signals?: string[];
  recommended_action?: string;
  contributing_factors?: string[];
  priority?: string;
  assessed_at: string;
  override_reason?: string | null;
  overridden_by?: string | null;
}

export interface Referral extends SyncMetadata {
  id: string;
  patient_id: string;
  risk_assessment_id?: string | null;
  referred_by?: string;
  status: ReferralStatus;
  priority?: ReferralPriority;
  reason: string;
  symptoms?: string | null;
  clinical_notes?: string | null;
  expected_visit_date?: string | null;
  receiving_hospital_name?: string | null;
  treatment_summary?: string | null;
  rejection_reason?: string | null;
  ambulance_assigned?: string | null;
  created_at: string;
  referred_to_text: string | null;
  referred_to_facility_id: string | null;
  referred_to_doctor_id: string | null;
  patient?: Patient;
}

export interface ReferralEvent {
  id: string;
  referral_id: string;
  status: ReferralStatus;
  changed_by?: string | null;
  notes?: string | null;
  ambulance_info?: Record<string, any> | null;
  created_at: string;
}

export interface Visit {
  id: string;
  patient_id: string;
  recorded_by?: string | null;
  location?: string | null;
  chief_complaint?: string | null;
  symptoms?: string | null;
  observations?: string | null;
  vitals?: Record<string, any> | null;
  assessment?: string | null;
  treatment?: string | null;
  prescription?: string | null;
  advice?: string | null;
  follow_up_date?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface FollowUp extends SyncMetadata {
  id: string;
  patient_id: string;
  referral_id: string | null;
  scheduled_date: string;
  status: FollowUpStatus;
  notes: string | null;
  updated_by?: string | null;
  updated_at?: string;
  patient?: Patient;
}

export interface Notification {
  id: string;
  user_id?: string | null;
  patient_id?: string | null;
  title: string;
  message: string;
  type: 'high_risk' | 'referral' | 'follow_up' | 'system';
  is_read: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  details?: Record<string, any> | null;
  created_at: string;
}

export interface PatientRow extends Patient {
  latestRisk: RiskAssessment | null;
  recordsCount?: number;
  referralsCount?: number;
}

export interface DashboardStats {
  totalPatients: number;
  newPatientsThisWeek: number;
  highRiskPatients: number;
  criticalPatients: number;
  pendingReferrals: number;
  activeFollowUps: number;
  missedFollowUps: number;
}

export interface HospitalStats {
  incomingReferrals: number;
  urgentReferrals: number;
  acceptedReferrals: number;
  inTransitPatients: number;
  arrivedPatients: number;
  treatmentStarted: number;
  completedReferrals: number;
}

export interface SyncQueueItem {
  id: string;
  entityType: 'patient' | 'health_record' | 'risk_assessment' | 'referral' | 'follow_up' | 'visit';
  payload: any;
  createdAt: string;
  syncStatus: SyncStatus;
  attempts: number;
  lastError?: string | null;
}

export interface Facility {
  id: string;
  name: string;
  code?: string | null;
  village?: string | null;
  address?: string | null;
  facility_type?: string | null;
  services?: string[] | null;
  status?: string | null;
  created_at?: string;
}

export interface DoctorUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string | null;
  email?: string | null;
  facility_id?: string | null;
  specialization?: string | null;
  designation?: string | null;
  department?: string | null;
  availability?: string | null;
  status?: string | null;
  facility?: Facility | null;
  created_at?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id?: string | null;
  facility_id?: string | null;
  referral_id?: string | null;
  appointment_date: string;
  purpose: string;
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  clinical_notes?: string | null;
  created_at: string;
  patient?: Patient;
  doctor?: DoctorUser;
  facility?: Facility;
}
