import { supabase } from '@/lib/supabase/client';
import type { DashboardStats, FollowUpStatus, Patient, PatientRow, Referral, RiskAssessment, Notification } from '@/lib/types';

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [patients, risks, referrals, followUps] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('risk_assessments').select('patient_id').eq('risk_level', 'high'),
      supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('follow_ups').select('*', { count: 'exact', head: true }).eq('status', 'scheduled').lte('scheduled_date', today),
    ]);

    return {
      totalPatients: patients.count ?? 0,
      highRiskPatients: risks.data ? new Set(risks.data.map(r => r.patient_id)).size : 0,
      pendingReferrals: referrals.count ?? 0,
      followUpsDue: followUps.count ?? 0
    };
  } catch {
    return { totalPatients: 0, highRiskPatients: 0, pendingReferrals: 0, followUpsDue: 0 };
  }
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

export async function getPatientDetail(patientId: string) {
  const [patient, records, risks, referrals, followUps] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('health_records').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
    supabase.from('risk_assessments').select('*').eq('patient_id', patientId).order('assessed_at', { ascending: false }),
    supabase.from('referrals').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
    supabase.from('follow_ups').select('*').eq('patient_id', patientId).order('scheduled_date'),
  ]);
  if (patient.error) throw patient.error;
  return {
    patient: patient.data as Patient,
    records: records.data ?? [],
    risks: risks.data ?? [],
    referrals: referrals.data ?? [],
    followUps: followUps.data ?? []
  };
}

export async function createReferral(input: {
  patientId: string;
  riskAssessmentId?: string;
  facilityId?: string;
  doctorId?: string;
  destination?: string;
  reason: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in again.');
  const { data, error } = await supabase
    .from('referrals')
    .insert({
      patient_id: input.patientId,
      risk_assessment_id: input.riskAssessmentId ?? null,
      referred_by: user.id,
      referred_to_facility_id: input.facilityId ?? null,
      referred_to_doctor_id: input.doctorId ?? null,
      referred_to_text: input.destination ?? null,
      reason: input.reason
    })
    .select()
    .single();

  if (error) throw error;

  await createNotification({
    patientId: input.patientId,
    title: 'New Clinical Referral',
    message: `Patient referral generated: ${input.reason}`,
    type: 'referral'
  });

  return data as Referral;
}

export async function updateFollowUp(id: string, status: FollowUpStatus, notes: string) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Please sign in again.');
  const { error } = await supabase.from('follow_ups').update({ status, notes, updated_by: user.id }).eq('id', id);
  if (error) throw error;
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false }).limit(20);
    if (error) return [];
    return (data as Notification[]) ?? [];
  } catch {
    return [];
  }
}

export async function createNotification(input: {
  userId?: string;
  patientId?: string;
  title: string;
  message: string;
  type: 'high_risk' | 'referral' | 'follow_up' | 'system';
}) {
  try {
    await supabase.from('notifications').insert({
      user_id: input.userId ?? null,
      patient_id: input.patientId ?? null,
      title: input.title,
      message: input.message,
      type: input.type,
      is_read: false
    });
  } catch {
    // Fallback
  }
}
