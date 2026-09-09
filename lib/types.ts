export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ReferralStatus = 'pending' | 'accepted' | 'in_transit' | 'arrived' | 'completed' | 'cancelled';
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

export interface Patient extends SyncMetadata {
  id: string;
  name: string;
  age: number;
  gender: string;
  village: string | null;
  address: string | null;
  phone: string | null;
  guardian_name: string | null;
  emergency_contact?: string | null;
  blood_group?: string | null;
  existing_conditions?: string[] | null;
  allergies?: string[] | null;
  current_medications?: string[] | null;
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
  temperature_c: number | null;
  pulse_bpm: number | null;
  spo2: number | null;
  symptoms: string | null;
  notes: string | null;
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
  created_at: string;
  referred_to_text: string | null;
  referred_to_facility_id: string | null;
  referred_to_doctor_id: string | null;
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

export interface SyncQueueItem {
  id: string;
  entityType: 'patient' | 'health_record' | 'risk_assessment' | 'referral' | 'follow_up';
  payload: any;
  createdAt: string;
  syncStatus: SyncStatus;
  attempts: number;
  lastError?: string | null;
}
