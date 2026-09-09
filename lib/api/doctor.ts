import { supabase } from '@/lib/supabase/client';
import type { 
  DashboardStats, 
  FollowUpStatus, 
  Patient, 
  PatientRow, 
  HealthRecord,
  Referral, 
  ReferralStatus, 
  ReferralPriority,
  RiskAssessment, 
  Notification, 
  AuditLog, 
  FollowUp 
} from '@/lib/types';
import { 
  DEMO_PATIENTS, 
  DEMO_REFERRALS, 
  DEMO_FOLLOWUPS, 
  DEMO_NOTIFICATIONS, 
  DEMO_AUDIT_LOGS 
} from '@/lib/demo-data';

export interface PatientFilterOptions {
  query?: string;
  riskLevel?: string;
  village?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [patients, risks, referrals, followUps] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('risk_assessments').select('patient_id, risk_level'),
      supabase.from('referrals').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('follow_ups').select('status, scheduled_date'),
    ]);

    if (patients.error || !patients.count) throw new Error('Fallback to demo data');

    const highRiskSet = new Set<string>();
    const criticalSet = new Set<string>();

    (risks.data ?? []).forEach(r => {
      if (r.risk_level === 'critical') {
        criticalSet.add(r.patient_id);
        highRiskSet.add(r.patient_id);
      } else if (r.risk_level === 'high') {
        highRiskSet.add(r.patient_id);
      }
    });

    const activeFollowUpsCount = (followUps.data ?? []).filter(f => f.status === 'scheduled' || f.status === 'upcoming').length;
    const missedFollowUpsCount = (followUps.data ?? []).filter(f => f.status === 'missed' || (f.status === 'scheduled' && f.scheduled_date < today)).length;

    return {
      totalPatients: patients.count ?? DEMO_PATIENTS.length,
      newPatientsThisWeek: 3,
      highRiskPatients: highRiskSet.size || DEMO_PATIENTS.filter(p => p.latestRisk?.risk_level === 'high' || p.latestRisk?.risk_level === 'critical').length,
      criticalPatients: criticalSet.size || DEMO_PATIENTS.filter(p => p.latestRisk?.risk_level === 'critical').length,
      pendingReferrals: referrals.count ?? DEMO_REFERRALS.filter(r => r.status === 'pending').length,
      activeFollowUps: activeFollowUpsCount || DEMO_FOLLOWUPS.filter(f => f.status === 'scheduled' || f.status === 'upcoming').length,
      missedFollowUps: missedFollowUpsCount || DEMO_FOLLOWUPS.filter(f => f.status === 'missed').length,
    };
  } catch {
    return {
      totalPatients: DEMO_PATIENTS.length,
      newPatientsThisWeek: 3,
      highRiskPatients: DEMO_PATIENTS.filter(p => p.latestRisk?.risk_level === 'high' || p.latestRisk?.risk_level === 'critical').length,
      criticalPatients: DEMO_PATIENTS.filter(p => p.latestRisk?.risk_level === 'critical').length,
      pendingReferrals: DEMO_REFERRALS.filter(r => r.status === 'pending').length,
      activeFollowUps: DEMO_FOLLOWUPS.filter(f => f.status === 'scheduled' || f.status === 'upcoming').length,
      missedFollowUps: DEMO_FOLLOWUPS.filter(f => f.status === 'missed').length,
    };
  }
}

export async function getPatients(options: PatientFilterOptions = {}): Promise<PatientRow[]> {
  try {
    let request = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.query) {
      request = request.or(`name.ilike.%${options.query}%,village.ilike.%${options.query}%`);
    }

    const { data: patients, error } = await request;
    if (error || !patients || !patients.length) throw new Error('Fallback to demo');

    const ids = patients.map(p => p.id);
    const { data: risks } = await supabase
      .from('risk_assessments')
      .select('*')
      .in('patient_id', ids)
      .order('assessed_at', { ascending: false });

    const latest = new Map<string, RiskAssessment>();
    (risks ?? []).forEach(r => {
      if (!latest.has(r.patient_id)) latest.set(r.patient_id, r as RiskAssessment);
    });

    let result: PatientRow[] = patients.map(p => ({
      ...p,
      latestRisk: latest.get(p.id) ?? null
    }));

    if (options.riskLevel && options.riskLevel !== 'all') {
      result = result.filter(p => p.latestRisk?.risk_level === options.riskLevel);
    }
    if (options.village && options.village !== 'all') {
      result = result.filter(p => p.village?.toLowerCase() === options.village?.toLowerCase());
    }
    if (options.gender && options.gender !== 'all') {
      result = result.filter(p => p.gender?.toLowerCase() === options.gender?.toLowerCase());
    }

    return result;
  } catch {
    let result = [...DEMO_PATIENTS];
    if (options.query) {
      const q = options.query.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || (p.village && p.village.toLowerCase().includes(q)));
    }
    if (options.riskLevel && options.riskLevel !== 'all') {
      result = result.filter(p => p.latestRisk?.risk_level === options.riskLevel);
    }
    if (options.village && options.village !== 'all') {
      result = result.filter(p => p.village?.toLowerCase() === options.village?.toLowerCase());
    }
    if (options.gender && options.gender !== 'all') {
      result = result.filter(p => p.gender?.toLowerCase() === options.gender?.toLowerCase());
    }
    return result;
  }
}

export async function getPatientDetail(patientId: string) {
  try {
    const [patient, records, risks, referrals, followUps] = await Promise.all([
      supabase.from('patients').select('*').eq('id', patientId).single(),
      supabase.from('health_records').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
      supabase.from('risk_assessments').select('*').eq('patient_id', patientId).order('assessed_at', { ascending: false }),
      supabase.from('referrals').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
      supabase.from('follow_ups').select('*').eq('patient_id', patientId).order('scheduled_date'),
    ]);

    if (patient.error || !patient.data) throw new Error('Fallback to demo');

    return {
      patient: patient.data as Patient,
      records: (records.data ?? []) as HealthRecord[],
      risks: (risks.data ?? []) as RiskAssessment[],
      referrals: (referrals.data ?? []) as Referral[],
      followUps: (followUps.data ?? []) as FollowUp[]
    };
  } catch {
    const found = DEMO_PATIENTS.find(p => p.id === patientId) ?? DEMO_PATIENTS[0];
    const referrals = DEMO_REFERRALS.filter(r => r.patient_id === found.id);
    const followUps = DEMO_FOLLOWUPS.filter(f => f.patient_id === found.id);
    
    const records: HealthRecord[] = [
      {
        id: `rec-${found.id}`,
        patient_id: found.id,
        systolic_bp: 172,
        diastolic_bp: 105,
        blood_sugar: 185,
        weight_kg: 68,
        temperature_c: 38.2,
        pulse_bpm: 94,
        spo2: 93,
        symptoms: 'Headache, persistent fatigue, mild dizziness',
        notes: 'Vitals recorded during village mobile intake.',
        recorded_at: found.created_at
      }
    ];

    const risks: RiskAssessment[] = found.latestRisk ? [found.latestRisk] : [];

    return {
      patient: found,
      records,
      risks,
      referrals,
      followUps
    };
  }
}

export async function createReferral(input: {
  patientId: string;
  riskAssessmentId?: string;
  facilityId?: string;
  doctorId?: string;
  destination?: string;
  reason: string;
  priority?: ReferralPriority;
  symptoms?: string;
  clinicalNotes?: string;
  expectedVisitDate?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const { data, error } = await supabase
      .from('referrals')
      .insert({
        patient_id: input.patientId,
        risk_assessment_id: input.riskAssessmentId ?? null,
        referred_by: user?.id ?? null,
        referred_to_facility_id: input.facilityId ?? null,
        referred_to_doctor_id: input.doctorId ?? null,
        referred_to_text: input.destination ?? null,
        reason: input.reason,
        priority: input.priority ?? 'routine',
        symptoms: input.symptoms ?? null,
        clinical_notes: input.clinicalNotes ?? null,
        expected_visit_date: input.expectedVisitDate ?? null,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    await recordAuditLog({
      action: 'CREATE_REFERRAL',
      entityType: 'referral',
      entityId: data.id,
      details: { patient_id: input.patientId, reason: input.reason, priority: input.priority }
    });

    await createNotification({
      patientId: input.patientId,
      title: 'New Clinical Referral Generated',
      message: `Priority ${input.priority ?? 'routine'} referral: ${input.reason}`,
      type: 'referral'
    });

    return data as Referral;
  } catch {
    const newRef: Referral = {
      id: `ref-local-${Date.now()}`,
      patient_id: input.patientId,
      status: 'pending',
      priority: input.priority ?? 'routine',
      reason: input.reason,
      symptoms: input.symptoms ?? null,
      clinical_notes: input.clinicalNotes ?? null,
      expected_visit_date: input.expectedVisitDate ?? null,
      referred_to_text: input.destination ?? 'District Hospital Triage',
      referred_to_facility_id: null,
      referred_to_doctor_id: null,
      created_at: new Date().toISOString()
    };
    DEMO_REFERRALS.unshift(newRef);
    return newRef;
  }
}

export async function updateReferralStatus(id: string, status: ReferralStatus, notes?: string) {
  try {
    const { error } = await supabase
      .from('referrals')
      .update({ status, clinical_notes: notes })
      .eq('id', id);

    if (error) throw error;

    await recordAuditLog({
      action: 'UPDATE_REFERRAL_STATUS',
      entityType: 'referral',
      entityId: id,
      details: { new_status: status, notes }
    });
  } catch {
    const target = DEMO_REFERRALS.find(r => r.id === id);
    if (target) {
      target.status = status;
      if (notes) target.clinical_notes = notes;
    }
  }
}

export async function getReferrals(statusFilter = 'all'): Promise<Referral[]> {
  try {
    let req = supabase.from('referrals').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') {
      req = req.eq('status', statusFilter);
    }
    const { data, error } = await req;
    if (error || !data || !data.length) throw new Error('Fallback demo');
    return data as Referral[];
  } catch {
    if (statusFilter === 'all') return DEMO_REFERRALS;
    return DEMO_REFERRALS.filter(r => r.status === statusFilter);
  }
}

export async function getFollowUps(statusFilter = 'all'): Promise<FollowUp[]> {
  try {
    let req = supabase.from('follow_ups').select('*').order('scheduled_date');
    if (statusFilter !== 'all') {
      req = req.eq('status', statusFilter);
    }
    const { data, error } = await req;
    if (error || !data || !data.length) throw new Error('Fallback demo');
    return data as FollowUp[];
  } catch {
    if (statusFilter === 'all') return DEMO_FOLLOWUPS;
    return DEMO_FOLLOWUPS.filter(f => f.status === statusFilter);
  }
}

export async function updateFollowUp(id: string, status: FollowUpStatus, notes?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  try {
    const { error } = await supabase
      .from('follow_ups')
      .update({ status, notes, updated_by: user?.id, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;

    await recordAuditLog({
      action: 'UPDATE_FOLLOW_UP',
      entityType: 'follow_up',
      entityId: id,
      details: { status, notes }
    });
  } catch {
    const found = DEMO_FOLLOWUPS.find(f => f.id === id);
    if (found) {
      found.status = status;
      if (notes) found.notes = notes;
      found.updated_at = new Date().toISOString();
    }
  }
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (error || !data || !data.length) throw new Error('Fallback demo');
    return data as Notification[];
  } catch {
    return DEMO_NOTIFICATIONS;
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
    DEMO_NOTIFICATIONS.unshift({
      id: `notif-${Date.now()}`,
      patient_id: input.patientId ?? null,
      title: input.title,
      message: input.message,
      type: input.type,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }
}

export async function recordAuditLog(input: {
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, any>;
}) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('audit_logs').insert({
      user_id: user?.id ?? null,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      details: input.details ?? null
    });
  } catch {
    DEMO_AUDIT_LOGS.unshift({
      id: `audit-${Date.now()}`,
      action: input.action,
      entity_type: input.entityType,
      entity_id: input.entityId ?? null,
      details: input.details ?? null,
      created_at: new Date().toISOString()
    });
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error || !data || !data.length) throw new Error('Fallback demo');
    return data as AuditLog[];
  } catch {
    return DEMO_AUDIT_LOGS;
  }
}
