export type RiskLevel = 'low' | 'medium' | 'high';
export type ReferralStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';
export type FollowUpStatus = 'scheduled' | 'completed' | 'missed';
export interface Patient { id:string; name:string; age:number; gender:string; village:string|null; address:string|null; phone:string|null; guardian_name:string|null; created_at:string }
export interface RiskAssessment { id:string; patient_id:string; health_record_id:string|null; risk_score:number; risk_level:RiskLevel; model_version:string; assessed_at:string }
export interface HealthRecord { id:string; patient_id:string; systolic_bp:number|null; diastolic_bp:number|null; blood_sugar:number|null; weight_kg:number|null; temperature_c:number|null; pulse_bpm:number|null; spo2:number|null; symptoms:string|null; notes:string|null; recorded_at:string }
export interface Referral { id:string; patient_id:string; status:ReferralStatus; reason:string; created_at:string; referred_to_text:string|null; referred_to_facility_id:string|null; referred_to_doctor_id:string|null }
export interface FollowUp { id:string; patient_id:string; referral_id:string|null; scheduled_date:string; status:FollowUpStatus; notes:string|null }
export interface PatientRow extends Patient { latestRisk: RiskAssessment | null }
export interface DashboardStats { totalPatients:number; highRiskPatients:number; pendingReferrals:number; followUpsDue:number }
