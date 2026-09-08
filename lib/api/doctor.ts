import { supabase } from '@/lib/supabase/client';
import type { DashboardStats, FollowUpStatus, Patient, PatientRow, Referral, RiskAssessment } from '@/lib/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  const [patients, risks, referrals, followUps] = await Promise.all([
    supabase.from('patients').select('*', { count: 'exact', head: true }),
    supabase.from('risk_assessments').select('patient_id').eq('risk_level', 'high'),
    supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').lte('scheduled_date', today),
  ]);
  if (patients.error || risks.error || referrals.error || followUps.error) throw new Error('Unable to load dashboard data.');
  return { totalPatients: patients.count ?? 0, highRiskPatients: new Set(risks.data.map(r => r.patient_id)).size, pendingReferrals: referrals.count ?? 0, followUpsDue: followUps.count ?? 0 };
}

export async function getPatients(query = '', highRiskOnly = false): Promise<PatientRow[]> {
  let request = supabase.from('patients').select('id,name,age,gender,village,address,phone,guardian_name,created_at').order('created_at', { ascending: false });
  if (query) request = request.or(`name.ilike.%${query}%,village.ilike.%${query}%`);
  const { data: patients, error } = await request;
  if (error) throw error;
  const ids = (patients ?? []).map(p => p.id);
  if (!ids.length) return [];
  let riskQuery = supabase.from('risk_assessments').select('*').in('patient_id', ids).order('assessed_at', { ascending: false });
  if (highRiskOnly) riskQuery = riskQuery.eq('risk_level', 'high');
  const { data: risks, error: riskError } = await riskQuery;
  if (riskError) throw riskError;
  const latest = new Map<string, RiskAssessment>();
  (risks ?? []).forEach(r => { if (!latest.has(r.patient_id)) latest.set(r.patient_id, r as RiskAssessment); });
  return (patients ?? []).map(p => ({ ...p, latestRisk: latest.get(p.id) ?? null })).filter(p => !highRiskOnly || p.latestRisk);
}

export async function getPatientDetail(patientId:string) {
  const [patient, records, risks, referrals, followUps] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('health_records').select('*').eq('patient_id', patientId).order('recorded_at', { ascending:false }),
    supabase.from('risk_assessments').select('*').eq('patient_id', patientId).order('assessed_at', { ascending:false }),
    supabase.from('referrals').select('*').eq('patient_id', patientId).order('created_at', { ascending:false }),
    supabase.from('follow_ups').select('*').eq('patient_id', patientId).order('scheduled_date'),
  ]);
  if (patient.error) throw patient.error;
  return { patient: patient.data as Patient, records: records.data ?? [], risks: risks.data ?? [], referrals: referrals.data ?? [], followUps: followUps.data ?? [] };
}

export async function createReferral(input: {patientId:string; riskAssessmentId?:string; facilityId?:string; doctorId?:string; destination?:string; reason:string}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in again.');
  const { data, error } = await supabase.from('referrals').insert({ patient_id:input.patientId, risk_assessment_id:input.riskAssessmentId ?? null, referred_by:user.id, referred_to_facility_id:input.facilityId ?? null, referred_to_doctor_id:input.doctorId ?? null, referred_to_text:input.destination ?? null, reason:input.reason }).select().single();
  if (error) throw error; return data as Referral;
}

export async function updateFollowUp(id:string, status:FollowUpStatus, notes:string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in again.');
  const { error } = await supabase.from('follow_ups').update({ status, notes, updated_by:user.id }).eq('id', id);
  if (error) throw error;
}
