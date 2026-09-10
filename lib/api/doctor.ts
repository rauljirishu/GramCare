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
  FollowUp,
  Visit,
  RiskLevel,
  Facility,
  DoctorUser,
  Appointment
} from '@/lib/types';
import { predictOfflineRisk } from '@/lib/ai/risk-predictor';

export interface PatientFilterOptions {
  query?: string;
  riskLevel?: string;
  village?: string;
  gender?: string;
  referralStatus?: string;
  syncStatus?: string;
  locationAvailability?: string;
  demoFilter?: 'all' | 'real' | 'demo';
  ageMin?: number;
  ageMax?: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [patients, risks, referrals, followUps] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('risk_assessments').select('patient_id, risk_level'),
      supabase.from('referrals').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('follow_ups').select('status, scheduled_date'),
    ]);

    if (patients.error) console.error('Supabase patients count error:', patients.error);
    if (risks.error) console.error('Supabase risks error:', risks.error);
    if (referrals.error) console.error('Supabase referrals error:', referrals.error);
    if (followUps.error) console.error('Supabase followUps error:', followUps.error);

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
      totalPatients: patients.count ?? 0,
      newPatientsThisWeek: patients.count ?? 0,
      highRiskPatients: highRiskSet.size,
      criticalPatients: criticalSet.size,
      pendingReferrals: referrals.count ?? 0,
      activeFollowUps: activeFollowUpsCount,
      missedFollowUps: missedFollowUpsCount,
    };
  } catch (err) {
    console.error('getDashboardStats failed:', err);
    return {
      totalPatients: 0,
      newPatientsThisWeek: 0,
      highRiskPatients: 0,
      criticalPatients: 0,
      pendingReferrals: 0,
      activeFollowUps: 0,
      missedFollowUps: 0,
    };
  }
}

export async function getPatients(options: PatientFilterOptions = {}): Promise<PatientRow[]> {
  try {
    let request = supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.demoFilter === 'real') {
      request = request.eq('is_demo', false);
    } else if (options.demoFilter === 'demo') {
      request = request.eq('is_demo', true);
    }

    if (options.query) {
      const q = options.query.trim();
      request = request.or(`name.ilike.%${q}%,village.ilike.%${q}%,phone.ilike.%${q}%,patient_code.ilike.%${q}%`);
    }

    const { data: patients, error } = await request;
    if (error) {
      console.error('Supabase getPatients error:', error);
      throw error;
    }

    if (!patients || patients.length === 0) {
      return [];
    }

    const ids = patients.map(p => p.id);
    const { data: risks, error: riskError } = await supabase
      .from('risk_assessments')
      .select('*')
      .in('patient_id', ids)
      .order('assessed_at', { ascending: false });

    if (riskError) console.error('Supabase risk query error:', riskError);

    const latest = new Map<string, RiskAssessment>();
    (risks ?? []).forEach(r => {
      if (!latest.has(r.patient_id)) latest.set(r.patient_id, r as RiskAssessment);
    });

    let result: PatientRow[] = patients.map(p => ({
      ...p,
      latestRisk: latest.get(p.id) ?? (p.risk_level ? {
        id: `patient-risk-${p.id}`,
        patient_id: p.id,
        health_record_id: null,
        risk_score: p.risk_score ?? 0,
        risk_level: p.risk_level,
        model_version: 'manual-intake',
        assessed_at: p.created_at
      } as RiskAssessment : null)
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
    if (options.referralStatus && options.referralStatus !== 'all') {
      result = result.filter(p => (p.referral_status || 'none') === options.referralStatus);
    }
    if (options.syncStatus && options.syncStatus !== 'all') {
      result = result.filter(p => (p.sync_status || 'synced') === options.syncStatus);
    }
    if (options.locationAvailability && options.locationAvailability !== 'all') {
      result = result.filter(p => options.locationAvailability === 'available'
        ? p.latitude != null && p.longitude != null
        : p.latitude == null || p.longitude == null);
    }

    return result;
  } catch (err) {
    console.error('getPatients failed:', err);
    return [];
  }
}

export async function createPatientDirectly(input: {
  name: string;
  age: number;
  gender: string;
  village?: string;
  address?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  locationAccuracy?: number | null;
  locationCapturedAt?: string | null;
  locationSource?: 'GPS' | 'Manual' | 'Existing Record';
  phone?: string;
  guardianName?: string;
  emergencyContact?: string;
  bloodGroup?: string;
  gramPanchayat?: string;
  phcAssigned?: string;
  allergies?: string[];
  existingConditions?: string[];
  currentMedications?: string[];
  assignedWorker?: string;
  lastVisitDate?: string;
  nextFollowUpDate?: string;
  referralStatus?: string;
  referredHospital?: string;
  notes?: string;
  symptoms?: string;
  riskLevel?: RiskLevel;
  riskScore?: number;
}): Promise<Patient> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to register a patient');
  }

  // Verify/create profile in public.users to avoid foreign key violations
  const { data: userProfile } = await supabase.from('users').select('id').eq('id', user.id).single();
  if (!userProfile) {
    await supabase.from('users').upsert({
      id: user.id,
      name: user.user_metadata?.name || 'Healthcare Staff',
      role: (user.user_metadata?.requested_role || 'asha') as any,
      email: user.email
    });
  }

  // Generate unique Patient Code for real patients
  const countRes = await supabase.from('patients').select('id', { count: 'exact', head: true }).eq('is_demo', false);
  const nextNum = (countRes.count ?? 0) + 1001;
  const patientCode = `GC-2026-${nextNum}`;

  const { data, error } = await supabase
    .from('patients')
    .insert({
      patient_code: patientCode,
      is_demo: false,
      name: input.name.trim(),
      age: Number(input.age),
      gender: input.gender as any,
      village: input.village?.trim() || null,
      address: input.address?.trim() || null,
      block: input.taluka?.trim() || null,
      district: input.district?.trim() || null,
      state: input.state?.trim() || null,
      pincode: input.pincode?.trim() || null,
      latitude: input.latitude ?? null,
      longitude: input.longitude ?? null,
      location_accuracy: input.locationAccuracy ?? null,
      location_captured_at: input.locationCapturedAt ?? null,
      location_source: input.locationSource ?? (input.latitude != null ? 'GPS' : 'Manual'),
      phone: input.phone?.trim() || null,
      guardian_name: input.guardianName?.trim() || null,
      emergency_contact: input.emergencyContact?.trim() || null,
      blood_group: input.bloodGroup?.trim() || null,
      gram_panchayat: input.gramPanchayat?.trim() || null,
      phc_assigned: input.phcAssigned?.trim() || null,
      allergies: input.allergies && input.allergies.length > 0 ? input.allergies : null,
      existing_conditions: input.existingConditions && input.existingConditions.length > 0 ? input.existingConditions : null,
      current_medications: input.currentMedications && input.currentMedications.length > 0 ? input.currentMedications : null,
      assigned_worker: input.assignedWorker?.trim() || null,
      last_visit_date: input.lastVisitDate || null,
      next_follow_up_date: input.nextFollowUpDate || null,
      referral_status: input.referralStatus || null,
      referred_hospital: input.referredHospital?.trim() || null,
      notes: input.notes?.trim() || null,
      symptoms: input.symptoms?.trim() || null,
      risk_level: input.riskLevel ?? null,
      risk_score: input.riskScore ?? null,
      registered_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase createPatientDirectly error:', error);
    throw new Error(`Failed to save patient: ${error.message}`);
  }

  await recordAuditLog({
    action: 'CREATE_PATIENT',
    entityType: 'patient',
    entityId: data.id,
    details: { name: data.name, village: data.village }
  });

  return data as Patient;
}

export async function updatePatient(patientId: string, updates: Partial<Patient>): Promise<Patient> {
  const { data, error } = await supabase
    .from('patients')
    .update(updates)
    .eq('id', patientId)
    .select()
    .single();

  if (error) {
    console.error('Supabase updatePatient error:', error);
    throw new Error(`Failed to update patient: ${error.message}`);
  }

  await recordAuditLog({
    action: 'UPDATE_PATIENT',
    entityType: 'patient',
    entityId: patientId,
    details: updates
  });

  return data as Patient;
}

export async function deletePatient(patientId: string): Promise<boolean> {
  const { error } = await supabase
    .from('patients')
    .delete()
    .eq('id', patientId);

  if (error) {
    console.error('Supabase deletePatient error:', error);
    throw new Error(`Failed to delete patient: ${error.message}`);
  }

  await recordAuditLog({
    action: 'DELETE_PATIENT',
    entityType: 'patient',
    entityId: patientId
  });

  return true;
}

export async function getPatientDetail(patientId: string) {
  if (!patientId) {
    throw new Error('Patient ID is required');
  }

  const [patient, records, risks, referrals, followUps] = await Promise.all([
    supabase.from('patients').select('*').eq('id', patientId).single(),
    supabase.from('health_records').select('*').eq('patient_id', patientId).order('recorded_at', { ascending: false }),
    supabase.from('risk_assessments').select('*').eq('patient_id', patientId).order('assessed_at', { ascending: false }),
    supabase.from('referrals').select('*').eq('patient_id', patientId).order('created_at', { ascending: false }),
    supabase.from('follow_ups').select('*').eq('patient_id', patientId).order('scheduled_date'),
  ]);

  if (patient.error || !patient.data) {
    console.error('Supabase getPatientDetail error:', patient.error);
    throw new Error(`Patient record not found for ID: ${patientId}`);
  }

  return {
    patient: patient.data as Patient,
    records: (records.data ?? []) as HealthRecord[],
    risks: (risks.data ?? []) as RiskAssessment[],
    referrals: (referrals.data ?? []) as Referral[],
    followUps: (followUps.data ?? []) as FollowUp[]
  };
}

export async function createHealthRecordAndRisk(input: {
  patientId: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  bloodSugar?: number | null;
  weightKg?: number | null;
  temperatureC?: number | null;
  pulseBpm?: number | null;
  spo2?: number | null;
  symptoms?: string | null;
  notes?: string | null;
}): Promise<{ record: HealthRecord; risk: RiskAssessment }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to record vitals');
  }

  // 1. Insert health record
  const { data: record, error: recError } = await supabase
    .from('health_records')
    .insert({
      patient_id: input.patientId,
      recorded_by: user.id,
      systolic_bp: input.systolicBp ?? null,
      diastolic_bp: input.diastolicBp ?? null,
      blood_sugar: input.bloodSugar ?? null,
      weight_kg: input.weightKg ?? null,
      temperature_c: input.temperatureC ?? null,
      pulse_bpm: input.pulseBpm ?? null,
      spo2: input.spo2 ?? null,
      symptoms: input.symptoms?.trim() || null,
      notes: input.notes?.trim() || null
    })
    .select()
    .single();

  if (recError) {
    console.error('Supabase insert health_records error:', recError);
    throw new Error(`Failed to save vitals: ${recError.message}`);
  }

  // 2. Predict & insert risk assessment
  const prediction = predictOfflineRisk({
    systolicBp: input.systolicBp,
    diastolicBp: input.diastolicBp,
    bloodSugar: input.bloodSugar,
    temperatureC: input.temperatureC,
    pulseBpm: input.pulseBpm,
    spo2: input.spo2,
    symptoms: input.symptoms
  });

  const { data: risk, error: riskError } = await supabase
    .from('risk_assessments')
    .insert({
      patient_id: input.patientId,
      health_record_id: record.id,
      risk_score: prediction.riskScore,
      risk_level: prediction.riskLevel as any,
      model_version: prediction.modelVersion
    })
    .select()
    .single();

  if (riskError) {
    console.error('Supabase insert risk_assessments error:', riskError);
    throw new Error(`Failed to save risk assessment: ${riskError.message}`);
  }

  await recordAuditLog({
    action: 'RECORD_VITALS_AND_RISK',
    entityType: 'health_record',
    entityId: record.id,
    details: { patient_id: input.patientId, risk_level: prediction.riskLevel }
  });

  if (prediction.riskLevel === 'high' || prediction.riskLevel === 'critical') {
    await createNotification({
      patientId: input.patientId,
      title: `${prediction.riskLevel.toUpperCase()} Clinical Triage Alert`,
      message: `Patient flag: ${prediction.warningSignals?.join(', ') || 'High risk vitals detected'}`,
      type: 'high_risk'
    });
  }

  return {
    record: record as HealthRecord,
    risk: {
      ...risk,
      warning_signals: prediction.warningSignals,
      recommended_action: prediction.recommendedAction
    } as RiskAssessment
  };
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
  if (!user) throw new Error('Authentication required to create referral');

  const { data, error } = await supabase
    .from('referrals')
    .insert({
      patient_id: input.patientId,
      risk_assessment_id: input.riskAssessmentId ?? null,
      referred_by: user.id,
      referred_to_facility_id: input.facilityId ?? null,
      referred_to_doctor_id: input.doctorId ?? null,
      referred_to_text: input.destination?.trim() || null,
      reason: input.reason,
      priority: input.priority ?? 'routine',
      symptoms: input.symptoms ?? null,
      clinical_notes: input.clinicalNotes ?? null,
      expected_visit_date: input.expectedVisitDate ?? null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase createReferral error:', error);
    throw new Error(`Failed to generate referral: ${error.message}`);
  }

  await recordAuditLog({
    action: 'CREATE_REFERRAL',
    entityType: 'referral',
    entityId: data.id,
    details: { patient_id: input.patientId, reason: input.reason, priority: input.priority }
  });

  await createNotification({
    patientId: input.patientId,
    title: 'New Inter-Facility Referral Created',
    message: `Priority ${input.priority ?? 'routine'} referral to ${input.destination || 'selected facility'}`,
    type: 'referral'
  });

  return data as Referral;
}

export async function getReferrals(statusFilter = 'all'): Promise<Referral[]> {
  try {
    let req = supabase.from('referrals').select('*').order('created_at', { ascending: false });
    if (statusFilter !== 'all') {
      req = req.eq('status', statusFilter);
    }
    const { data, error } = await req;
    if (error) {
      console.error('Supabase getReferrals error:', error);
      throw error;
    }
    return (data ?? []) as Referral[];
  } catch (err) {
    console.error('getReferrals failed:', err);
    return [];
  }
}

export async function getFollowUps(statusFilter = 'all'): Promise<FollowUp[]> {
  try {
    let req = supabase.from('follow_ups').select('*').order('scheduled_date');
    if (statusFilter !== 'all') {
      req = req.eq('status', statusFilter);
    }
    const { data, error } = await req;
    if (error) {
      console.error('Supabase getFollowUps error:', error);
      throw error;
    }
    return (data ?? []) as FollowUp[];
  } catch (err) {
    console.error('getFollowUps failed:', err);
    return [];
  }
}

export async function createFollowUp(input: {
  patientId: string;
  referralId?: string;
  scheduledDate: string;
  notes?: string;
}): Promise<FollowUp> {
  const { data: { user } } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('follow_ups')
    .insert({
      patient_id: input.patientId,
      referral_id: input.referralId ?? null,
      scheduled_date: input.scheduledDate,
      status: 'scheduled',
      notes: input.notes ?? null,
      updated_by: user?.id ?? null
    })
    .select()
    .single();

  if (error) {
    console.error('Supabase createFollowUp error:', error);
    throw new Error(`Failed to create follow-up task: ${error.message}`);
  }

  await recordAuditLog({
    action: 'CREATE_FOLLOW_UP',
    entityType: 'follow_up',
    entityId: data.id,
    details: { patient_id: input.patientId, scheduled_date: input.scheduledDate }
  });

  return data as FollowUp;
}

export async function updateFollowUp(id: string, status: FollowUpStatus, notes?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase
    .from('follow_ups')
    .update({ status, notes, updated_by: user?.id, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Supabase updateFollowUp error:', error);
    throw new Error(`Failed to update follow-up: ${error.message}`);
  }

  await recordAuditLog({
    action: 'UPDATE_FOLLOW_UP',
    entityType: 'follow_up',
    entityId: id,
    details: { status, notes }
  });
}

export async function getNotifications(): Promise<Notification[]> {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) {
      console.error('Supabase getNotifications error:', error);
      throw error;
    }
    return (data ?? []) as Notification[];
  } catch (err) {
    console.error('getNotifications failed:', err);
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
  } catch (err) {
    console.error('createNotification failed:', err);
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
  } catch (err) {
    console.error('recordAuditLog failed:', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) {
      console.error('Supabase getAuditLogs error:', error);
      throw error;
    }
    return (data ?? []) as AuditLog[];
  } catch (err) {
    console.error('getAuditLogs failed:', err);
    return [];
  }
}

export async function getHospitalReferrals(): Promise<Referral[]> {
  try {
    const { data, error } = await supabase
      .from('referrals')
      .select('*, patient:patients(*)')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Supabase getHospitalReferrals error:', error);
      throw error;
    }
    return (data ?? []) as Referral[];
  } catch (err) {
    console.error('getHospitalReferrals failed:', err);
    return [];
  }
}

export async function updateReferralStatus(
  referralId: string,
  status: ReferralStatus,
  details?: {
    notes?: string;
    ambulance?: string;
    rejectionReason?: string;
    treatmentSummary?: string;
  }
): Promise<boolean> {
  const updateData: Record<string, any> = { status };
  if (details?.notes) updateData.clinical_notes = details.notes;
  if (details?.ambulance) updateData.ambulance_assigned = details.ambulance;
  if (details?.rejectionReason) updateData.rejection_reason = details.rejectionReason;
  if (details?.treatmentSummary) updateData.treatment_summary = details.treatmentSummary;

  const { error } = await supabase
    .from('referrals')
    .update(updateData)
    .eq('id', referralId);

  if (error) {
    console.error('Supabase updateReferralStatus error:', error);
    throw new Error(`Failed to update referral status: ${error.message}`);
  }

  // Insert event record
  const { data: { user } } = await supabase.auth.getUser();
  await supabase.from('referral_events').insert({
    referral_id: referralId,
    status,
    changed_by: user?.id ?? null,
    notes: details?.notes || details?.rejectionReason || details?.treatmentSummary || null,
    ambulance_info: details?.ambulance ? { ambulance: details.ambulance } : null
  });

  await recordAuditLog({
    action: `REFERRAL_STATUS_${status.toUpperCase()}`,
    entityType: 'referral',
    entityId: referralId,
    details: { status, ...details }
  });

  return true;
}

export async function getPatientVisits(patientId: string): Promise<Visit[]> {
  try {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase getPatientVisits error:', error);
      throw error;
    }
    return (data ?? []) as Visit[];
  } catch (err) {
    console.error('getPatientVisits failed:', err);
    return [];
  }
}

export async function createVisit(input: {
  patient_id: string;
  location?: string;
  chief_complaint?: string;
  symptoms?: string;
  observations?: string;
  vitals?: Record<string, any>;
  assessment?: string;
  treatment?: string;
  prescription?: string;
  advice?: string;
  follow_up_date?: string;
  notes?: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  const { data, error } = await supabase.from('visits').insert({
    patient_id: input.patient_id,
    recorded_by: user?.id ?? null,
    location: input.location || 'GramCare PHC Clinic',
    chief_complaint: input.chief_complaint,
    symptoms: input.symptoms,
    observations: input.observations,
    vitals: input.vitals || null,
    assessment: input.assessment,
    treatment: input.treatment,
    prescription: input.prescription,
    advice: input.advice,
    follow_up_date: input.follow_up_date || null,
    notes: input.notes
  }).select().single();

  if (error) {
    console.error('Supabase createVisit error:', error);
    throw new Error(`Failed to save visit record: ${error.message}`);
  }

  await recordAuditLog({
    action: 'CREATE_VISIT',
    entityType: 'visit',
    entityId: data?.id,
    details: { patient_id: input.patient_id }
  });

  return data;
}

export async function overrideRiskAssessment(
  assessmentId: string,
  newRiskLevel: string,
  reason: string
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  const { error } = await supabase.from('risk_assessments').update({
    risk_level: newRiskLevel,
    override_reason: reason,
    overridden_by: user?.id ?? null
  }).eq('id', assessmentId);

  if (error) {
    console.error('Supabase overrideRiskAssessment error:', error);
    throw new Error(`Failed to override risk level: ${error.message}`);
  }

  await recordAuditLog({
    action: 'RISK_LEVEL_OVERRIDE',
    entityType: 'risk_assessment',
    entityId: assessmentId,
    details: { newRiskLevel, reason }
  });

  return true;
}

export async function getFacilities(): Promise<Facility[]> {
  try {
    const { data, error } = await supabase
      .from('facilities')
      .select('*')
      .order('name');
    if (error) {
      console.error('Supabase getFacilities error:', error);
      throw error;
    }
    return (data ?? []) as Facility[];
  } catch (err) {
    console.error('getFacilities failed:', err);
    return [];
  }
}

export async function getNearbyFacilities(
  latitude: number,
  longitude: number,
  limit = 10
): Promise<import('@/lib/location/types').NearbyFacilityResult[]> {
  const { haversineDistanceKm } = await import('@/lib/location/distance');
  const facilities = await getFacilities();

  return facilities
    .filter((f) => f.latitude != null && f.longitude != null)
    .map((f) => ({
      id: f.id,
      name: f.name,
      facility_type: f.facility_type ?? null,
      address: f.address ?? null,
      village: f.village ?? null,
      district: f.district ?? null,
      state: f.state ?? null,
      referral_available: f.referral_available ?? true,
      distanceKm: haversineDistanceKm(latitude, longitude, f.latitude!, f.longitude!),
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

export async function getDistinctVillages(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('village')
      .not('village', 'is', null)
      .order('village');
    if (error) throw error;
    const villages = new Set<string>();
    (data ?? []).forEach((row: { village: string | null }) => {
      if (row.village?.trim()) villages.add(row.village.trim());
    });
    return Array.from(villages).sort();
  } catch {
    return [];
  }
}

export async function getDoctors(): Promise<DoctorUser[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'doctor')
      .order('name');
    if (error) {
      console.error('Supabase getDoctors error:', error);
      throw error;
    }
    const doctors = (data ?? []) as DoctorUser[];
    const facilityIds = [...new Set(doctors.map(doctor => doctor.facility_id).filter(Boolean))] as string[];
    if (!facilityIds.length) return doctors;

    const { data: facilities, error: facilitiesError } = await supabase
      .from('facilities')
      .select('*')
      .in('id', facilityIds);
    if (facilitiesError) throw facilitiesError;

    const facilityById = new Map((facilities ?? []).map(facility => [facility.id, facility as Facility]));
    return doctors.map(doctor => ({
      ...doctor,
      facility: doctor.facility_id ? facilityById.get(doctor.facility_id) : undefined,
    }));
  } catch (err) {
    console.error('getDoctors failed:', err);
    return [];
  }
}

export async function getAppointments(): Promise<Appointment[]> {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('appointment_date', { ascending: true });
    if (error) {
      console.error('Supabase getAppointments error:', error);
      throw error;
    }
    return hydrateAppointments((data ?? []) as Appointment[]);
  } catch (err) {
    console.error('getAppointments failed:', err);
    return [];
  }
}

async function hydrateAppointments(appointments: Appointment[]): Promise<Appointment[]> {
  if (!appointments.length) return appointments;

  const patientIds = [...new Set(appointments.map(item => item.patient_id).filter(Boolean))];
  const doctorIds = [...new Set(appointments.map(item => item.doctor_id).filter(Boolean))] as string[];
  const facilityIds = [...new Set(appointments.map(item => item.facility_id).filter(Boolean))] as string[];

  const [patientsResult, doctorsResult, facilitiesResult] = await Promise.all([
    patientIds.length ? supabase.from('patients').select('*').in('id', patientIds) : Promise.resolve({ data: [], error: null }),
    doctorIds.length ? supabase.from('users').select('*').in('id', doctorIds) : Promise.resolve({ data: [], error: null }),
    facilityIds.length ? supabase.from('facilities').select('*').in('id', facilityIds) : Promise.resolve({ data: [], error: null }),
  ]);

  if (patientsResult.error) throw patientsResult.error;
  if (doctorsResult.error) throw doctorsResult.error;
  if (facilitiesResult.error) throw facilitiesResult.error;

  const patients = new Map((patientsResult.data ?? []).map(patient => [patient.id, patient as Patient]));
  const doctors = new Map((doctorsResult.data ?? []).map(doctor => [doctor.id, doctor as DoctorUser]));
  const facilities = new Map((facilitiesResult.data ?? []).map(facility => [facility.id, facility as Facility]));

  return appointments.map(appointment => ({
    ...appointment,
    patient: patients.get(appointment.patient_id),
    doctor: appointment.doctor_id ? doctors.get(appointment.doctor_id) : undefined,
    facility: appointment.facility_id ? facilities.get(appointment.facility_id) : undefined,
  }));
}

export async function createAppointment(input: {
  patientId: string;
  doctorId?: string;
  facilityId?: string;
  referralId?: string;
  appointmentDate: string;
  purpose: string;
  clinicalNotes?: string;
}): Promise<Appointment> {
  const payload = {
    patient_id: input.patientId,
    doctor_id: input.doctorId ?? null,
    facility_id: input.facilityId ?? null,
    referral_id: input.referralId ?? null,
    appointment_date: input.appointmentDate,
    purpose: input.purpose,
    clinical_notes: input.clinicalNotes ?? null,
    status: 'scheduled'
  };

  let insertedRow: any = null;

  const { data, error } = await supabase
    .from('appointments')
    .insert(payload)
    .select('id, patient_id, doctor_id, facility_id, referral_id, appointment_date, purpose, status, clinical_notes, created_at')
    .single();

  if (error) {
    console.error('Supabase createAppointment initial error:', error);
    // Retry with basic insert if schema cache warning occurred
    const fallbackRes = await supabase
      .from('appointments')
      .insert(payload)
      .select()
      .single();

    if (fallbackRes.error) {
      throw new Error(`Failed to schedule appointment: ${error.message}`);
    }
    insertedRow = fallbackRes.data;
  } else {
    insertedRow = data;
  }

  await recordAuditLog({
    action: 'CREATE_APPOINTMENT',
    entityType: 'appointment',
    entityId: insertedRow.id,
    details: { patient_id: input.patientId, appointment_date: input.appointmentDate }
  });

  await createNotification({
    patientId: input.patientId,
    title: 'New Clinical Appointment Scheduled',
    message: `Appointment set for ${new Date(input.appointmentDate).toLocaleString()} - ${input.purpose}`,
    type: 'referral'
  });

  const [appointment] = await hydrateAppointments([insertedRow as Appointment]);
  return appointment;
}

export async function resetDemoData(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('reset_demo_data');
    if (error) {
      console.error('Supabase reset_demo_data RPC error, executing fallback delete:', error);
      // Client-side safe deletion fallback for demo patients only
      await supabase.from('patients').delete().eq('is_demo', true);
    }

    await recordAuditLog({
      action: 'RESET_DEMO_DATA',
      entityType: 'system',
      details: { reset_by: 'admin', count: 6 }
    });

    return true;
  } catch (err) {
    console.error('resetDemoData failed:', err);
    return false;
  }
}
