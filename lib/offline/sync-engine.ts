import { supabase } from '@/lib/supabase/client';
import type { Patient, HealthRecord, RiskAssessment, SyncQueueItem } from '@/lib/types';
import { predictOfflineRisk } from '@/lib/ai/risk-predictor';

const SYNC_QUEUE_KEY = 'gramcare_offline_sync_queue';
const LOCAL_PATIENTS_KEY = 'gramcare_offline_patients';
const LOCAL_RECORDS_KEY = 'gramcare_offline_records';

export type NetworkStatusListener = (isOnline: boolean, pendingCount: number) => void;

class GramCareSyncEngine {
  private listeners: NetworkStatusListener[] = [];
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange());
      window.addEventListener('offline', () => this.handleNetworkChange());
    }
  }

  public isOnline(): boolean {
    if (typeof window === 'undefined') return true;
    return navigator.onLine;
  }

  public subscribe(listener: NetworkStatusListener): () => void {
    this.listeners.push(listener);
    listener(this.isOnline(), this.getPendingCount());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    const online = this.isOnline();
    const count = this.getPendingCount();
    this.listeners.forEach(l => l(online, count));
  }

  private handleNetworkChange() {
    this.notify();
    if (this.isOnline()) {
      this.processQueue();
    }
  }

  public getQueue(): SyncQueueItem[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(SYNC_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveQueue(queue: SyncQueueItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    this.notify();
  }

  public getPendingCount(): number {
    return this.getQueue().filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed').length;
  }

  public getLocalPatients(): Patient[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_PATIENTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalPatients(patients: Patient[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_PATIENTS_KEY, JSON.stringify(patients));
  }

  public getLocalRecords(): HealthRecord[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(LOCAL_RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveLocalRecords(records: HealthRecord[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(LOCAL_RECORDS_KEY, JSON.stringify(records));
  }

  public async createPatientOffline(input: {
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
    riskLevel?: Patient['risk_level'];
    riskScore?: number;
  }): Promise<Patient> {
    const localId = `loc_pat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const patient: Patient = {
      id: localId,
      local_id: localId,
      name: input.name.trim(),
      age: Number(input.age),
      gender: input.gender,
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
      referral_status: (input.referralStatus as Patient['referral_status']) || null,
      referred_hospital: input.referredHospital?.trim() || null,
      notes: input.notes?.trim() || null,
      symptoms: input.symptoms?.trim() || null,
      risk_level: input.riskLevel ?? null,
      risk_score: input.riskScore ?? null,
      sync_status: 'pending',
      sync_attempts: 0,
      created_at: now
    };

    const patients = this.getLocalPatients();
    patients.unshift(patient);
    this.saveLocalPatients(patients);

    const queue = this.getQueue();
    queue.push({
      id: localId,
      entityType: 'patient',
      payload: patient,
      createdAt: now,
      syncStatus: 'pending',
      attempts: 0
    });
    this.saveQueue(queue);

    if (this.isOnline()) {
      this.processQueue();
    }

    return patient;
  }

  public async createVitalsAndRiskOffline(input: {
    patientId: string;
    systolicBp?: number | null;
    diastolicBp?: number | null;
    bloodSugar?: number | null;
    temperatureC?: number | null;
    pulseBpm?: number | null;
    spo2?: number | null;
    symptoms?: string | null;
    notes?: string | null;
  }): Promise<{ record: HealthRecord; risk: RiskAssessment }> {
    const localRecordId = `loc_rec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const localRiskId = `loc_risk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const prediction = predictOfflineRisk({
      systolicBp: input.systolicBp,
      diastolicBp: input.diastolicBp,
      bloodSugar: input.bloodSugar,
      temperatureC: input.temperatureC,
      pulseBpm: input.pulseBpm,
      spo2: input.spo2,
      symptoms: input.symptoms
    });

    const record: HealthRecord = {
      id: localRecordId,
      local_id: localRecordId,
      patient_id: input.patientId,
      systolic_bp: input.systolicBp ?? null,
      diastolic_bp: input.diastolicBp ?? null,
      blood_sugar: input.bloodSugar ?? null,
      temperature_c: input.temperatureC ?? null,
      pulse_bpm: input.pulseBpm ?? null,
      spo2: input.spo2 ?? null,
      weight_kg: null,
      symptoms: input.symptoms?.trim() || null,
      notes: input.notes?.trim() || null,
      sync_status: 'pending',
      sync_attempts: 0,
      recorded_at: now
    };

    const risk: RiskAssessment = {
      id: localRiskId,
      local_id: localRiskId,
      patient_id: input.patientId,
      health_record_id: localRecordId,
      risk_score: prediction.riskScore,
      risk_level: prediction.riskLevel,
      model_version: prediction.modelVersion,
      warning_signals: prediction.warningSignals,
      recommended_action: prediction.recommendedAction,
      sync_status: 'pending',
      sync_attempts: 0,
      assessed_at: now
    };

    const records = this.getLocalRecords();
    records.unshift(record);
    this.saveLocalRecords(records);

    const queue = this.getQueue();
    queue.push({
      id: localRecordId,
      entityType: 'health_record',
      payload: record,
      createdAt: now,
      syncStatus: 'pending',
      attempts: 0
    });
    queue.push({
      id: localRiskId,
      entityType: 'risk_assessment',
      payload: risk,
      createdAt: now,
      syncStatus: 'pending',
      attempts: 0
    });
    this.saveQueue(queue);

    if (this.isOnline()) {
      this.processQueue();
    }

    return { record, risk };
  }

  public async processQueue() {
    if (this.isSyncing || !this.isOnline()) return;
    this.isSyncing = true;

    try {
      const queue = this.getQueue();
      const pendingItems = queue.filter(item => item.syncStatus === 'pending' || item.syncStatus === 'failed');

      if (!pendingItems.length) {
        this.isSyncing = false;
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();

      for (const item of pendingItems) {
        try {
          item.attempts += 1;

          if (item.entityType === 'patient') {
            const patientData = { ...item.payload };
            delete patientData.local_id;
            delete patientData.sync_status;
            delete patientData.sync_attempts;

            let serverId = item.payload.server_id;
            if (!serverId && !patientData.id.startsWith('loc_')) {
              serverId = patientData.id;
            }

            if (user) {
              patientData.registered_by = user.id;
            }

            if (patientData.id.startsWith('loc_')) {
              delete patientData.id;
            }

            const { data, error } = await supabase
              .from('patients')
              .insert(patientData)
              .select()
              .single();

            if (error) throw error;

            item.syncStatus = 'synced';
            item.payload.server_id = data.id;
            item.payload.sync_status = 'synced';

            const localPatients = this.getLocalPatients();
            const idx = localPatients.findIndex(p => p.id === item.id || p.local_id === item.id);
            if (idx !== -1) {
              localPatients[idx].id = data.id;
              localPatients[idx].server_id = data.id;
              localPatients[idx].sync_status = 'synced';
              this.saveLocalPatients(localPatients);
            }
          } 
          else if (item.entityType === 'health_record') {
            const recordData = { ...item.payload };
            delete recordData.local_id;
            delete recordData.sync_status;
            delete recordData.sync_attempts;

            if (user) {
              recordData.recorded_by = user.id;
            }

            if (recordData.patient_id.startsWith('loc_')) {
              const localPatients = this.getLocalPatients();
              const pat = localPatients.find(p => p.id === recordData.patient_id || p.local_id === recordData.patient_id);
              if (pat?.server_id) {
                recordData.patient_id = pat.server_id;
              }
            }

            if (recordData.id.startsWith('loc_')) {
              delete recordData.id;
            }

            const { data, error } = await supabase
              .from('health_records')
              .insert(recordData)
              .select()
              .single();

            if (error) throw error;

            item.syncStatus = 'synced';
            item.payload.server_id = data.id;
            item.payload.sync_status = 'synced';
          }
          else if (item.entityType === 'risk_assessment') {
            const riskData = { ...item.payload };
            delete riskData.local_id;
            delete riskData.sync_status;
            delete riskData.sync_attempts;
            delete riskData.warning_signals;
            delete riskData.recommended_action;

            if (riskData.patient_id.startsWith('loc_')) {
              const localPatients = this.getLocalPatients();
              const pat = localPatients.find(p => p.id === riskData.patient_id || p.local_id === riskData.patient_id);
              if (pat?.server_id) riskData.patient_id = pat.server_id;
            }

            if (riskData.id.startsWith('loc_')) {
              delete riskData.id;
            }

            const { data, error } = await supabase
              .from('risk_assessments')
              .insert(riskData)
              .select()
              .single();

            if (error) throw error;

            item.syncStatus = 'synced';
            item.payload.server_id = data.id;
            item.payload.sync_status = 'synced';
          }

        } catch (err: any) {
          item.syncStatus = 'failed';
          item.lastError = err?.message || 'Synchronization failed';
        }
      }

      this.saveQueue(queue);
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }
}

export const syncEngine = new GramCareSyncEngine();
