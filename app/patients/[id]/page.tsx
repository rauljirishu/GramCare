'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { RiskBadge } from '@/components/risk-badge';
import { VitalsRecordModal } from '@/components/vitals-record-modal';
import { PatientLocationSection } from '@/components/patient-location-section';
import { PatientRegistrationModal } from '@/components/patient-registration-modal';
import { 
  getPatientDetail, 
  createReferral, 
  getPatientVisits, 
  createVisit, 
  overrideRiskAssessment 
  , deletePatient
} from '@/lib/api/doctor';
import { AI_DISCLAIMER_TEXT, predictOfflineRisk } from '@/lib/ai/risk-predictor';
import type { Patient, HealthRecord, RiskAssessment, Referral, FollowUp, Visit, RiskLevel } from '@/lib/types';
import { 
  User, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  HeartPulse, 
  Activity, 
  ArrowUpRight, 
  Clock, 
  Plus, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Calendar,
  Pill,
  Thermometer,
  Zap,
  ChevronLeft,
  Baby,
  Edit3,
  ShieldCheck,
  Building2,
  Stethoscope
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id || '';
  const router = useRouter();

  const [data, setData] = useState<{
    patient: Patient;
    records: HealthRecord[];
    risks: RiskAssessment[];
    referrals: Referral[];
    followUps: FollowUp[];
  } | null>(null);

  const [visits, setVisits] = useState<Visit[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'clinical' | 'visits' | 'ai' | 'referrals' | 'timeline'>('overview');
  
  // Modals state
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // New Visit Form state
  const [visitForm, setVisitForm] = useState({
    chief_complaint: '',
    symptoms: '',
    observations: '',
    assessment: '',
    treatment: '',
    prescription: '',
    advice: '',
    follow_up_date: ''
  });

  // Override Form state
  const [overrideLevel, setOverrideLevel] = useState<RiskLevel>('medium');
  const [overrideReason, setOverrideReason] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    loadPatient();
  }, [patientId]);

  async function loadPatient() {
    try {
      const res = await getPatientDetail(patientId);
      setData(res);
      const vList = await getPatientVisits(patientId);
      setVisits(vList);
    } catch {
      setError('Patient record unavailable.');
    }
  }

  async function handleAddVisit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await createVisit({
      patient_id: patientId,
      ...visitForm
    });
    setBusy(false);
    setShowVisitModal(false);
    setVisitForm({
      chief_complaint: '',
      symptoms: '',
      observations: '',
      assessment: '',
      treatment: '',
      prescription: '',
      advice: '',
      follow_up_date: ''
    });
    await loadPatient();
  }

  async function handleRiskOverride(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.risks[0]) return;
    setBusy(true);
    await overrideRiskAssessment(data.risks[0].id, overrideLevel, overrideReason);
    setBusy(false);
    setShowOverrideModal(false);
    setOverrideReason('');
    await loadPatient();
  }

  if (error) {
    return (
      <DashboardShell>
        <div role="alert" className="card p-6 bg-rose-50 border-rose-200 text-rose-800 font-bold">
          {error}
        </div>
      </DashboardShell>
    );
  }

  if (!data) {
    return (
      <DashboardShell>
        <Loading label="Loading patient clinical chart & timeline…" />
      </DashboardShell>
    );
  }

  const { patient, records, risks, referrals, followUps } = data;
  const latestRisk = risks[0] || null;
  const latestVitals = records[0] || null;

  // Build unified chronological timeline events
  const timelineEvents: Array<{
    id: string;
    date: string;
    title: string;
    type: 'intake' | 'vitals' | 'ai_risk' | 'referral' | 'follow_up' | 'visit';
    desc: string;
    badge?: string;
  }> = [];

  timelineEvents.push({
    id: `ev-intake-${patient.id}`,
    date: patient.created_at,
    title: 'Patient Digital Intake Registered',
    type: 'intake',
    desc: `Registered by community health worker${patient.village ? ` at ${patient.village}` : ''}.`
  });

  records.forEach(r => {
    timelineEvents.push({
      id: `ev-vit-${r.id}`,
      date: r.recorded_at,
      title: 'Vitals & Clinical Measurement Recorded',
      type: 'vitals',
      desc: `BP: ${r.systolic_bp || '—'}/${r.diastolic_bp || '—'} mmHg | Sugar: ${r.blood_sugar || '—'} mg/dL | SpO2: ${r.spo2 || '—'}% | Temp: ${r.temperature_c || '—'}°C. ${r.symptoms ? `Symptoms: ${r.symptoms}` : ''}`
    });
  });

  visits.forEach(v => {
    timelineEvents.push({
      id: `ev-vis-${v.id}`,
      date: v.created_at,
      title: `Clinical Encounter Visit: ${v.chief_complaint || 'General Visit'}`,
      type: 'visit',
      desc: `Assessment: ${v.assessment || 'Under observation'}. Treatment: ${v.treatment || 'Prescribed therapy'}.`
    });
  });

  risks.forEach(rk => {
    timelineEvents.push({
      id: `ev-risk-${rk.id}`,
      date: rk.assessed_at,
      title: `AI Risk Assessment: ${rk.risk_level.toUpperCase()} RISK (${rk.risk_score}/100)`,
      type: 'ai_risk',
      desc: `Assessed priority ${rk.priority || 'REVIEW'}. Warning Signals: ${rk.warning_signals?.join(', ') || 'Normal'}`,
      badge: rk.risk_level
    });
  });

  referrals.forEach(rf => {
    timelineEvents.push({
      id: `ev-ref-${rf.id}`,
      date: rf.created_at,
      title: `Digital Referral Generated (${rf.status.toUpperCase()})`,
      type: 'referral',
      desc: `Reason: ${rf.reason}. Destination: ${rf.referred_to_text || 'Not specified'}.`
    });
  });

  followUps.forEach(fl => {
    timelineEvents.push({
      id: `ev-fol-${fl.id}`,
      date: fl.scheduled_date,
      title: `Follow-up Checkup Scheduled (${fl.status.toUpperCase()})`,
      type: 'follow_up',
      desc: fl.notes || 'Routine follow-up visit.'
    });
  });

  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-6">
        <Link href="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mb-3">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Patients</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-black text-2xl shadow-sm border border-blue-200 dark:border-blue-800">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">{patient.name}</h1>
                {latestRisk && <RiskBadge level={latestRisk.risk_level} />}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400 flex flex-wrap items-center gap-3">
                <span>{patient.age} yrs • <span className="capitalize">{patient.gender}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {[patient.village, patient.district, patient.state].filter(Boolean).join(', ') || 'Location not set'}</span>
                <span>•</span>
                <span>Blood Group: <strong className="text-slate-800 dark:text-slate-200">{patient.blood_group || 'O+'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button onClick={() => setShowEditModal(true)} className="secondary-btn text-xs py-2.5 px-4 font-bold"><Edit3 className="h-4 w-4" /><span>Edit Patient</span></button>
            <button onClick={async () => { if (window.confirm('Delete this patient record? This cannot be undone.')) { await deletePatient(patient.id); router.replace('/patients'); } }} className="secondary-btn text-xs py-2.5 px-4 font-bold text-rose-700 border-rose-200"><span>Delete</span></button>
            <button
              onClick={() => setShowVisitModal(true)}
              className="secondary-btn text-xs py-2.5 px-4 font-bold"
            >
              <Stethoscope className="h-4 w-4 text-emerald-600" />
              <span>Record Clinical Visit</span>
            </button>

            <button
              onClick={() => setShowVitalsModal(true)}
              className="secondary-btn text-xs py-2.5 px-4 font-bold"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Record Vitals</span>
            </button>

            <Link
              href={`/patients/${patient.id}/referral`}
              className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md"
            >
              <ArrowUpRight className="h-4 w-4" />
              <span>Create Referral</span>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Medical Disclaimer */}
      <div className="mb-6 rounded-2xl bg-slate-900 p-4 text-white shadow-sm border border-slate-800">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-5 text-slate-300 font-medium">{AI_DISCLAIMER_TEXT}</p>
        </div>
      </div>

      {/* 7-Tab Navigation */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 text-xs font-extrabold">
        {[
          { key: 'overview', label: '1. Identity & Overview' },
          { key: 'vitals', label: '2. Vitals & Trends' },
          { key: 'clinical', label: '3. Clinical & Medical History' },
          { key: 'visits', label: `4. Encounters & Visits (${visits.length})` },
          { key: 'ai', label: '5. AI Risk & Explainability' },
          { key: 'referrals', label: `6. Referrals (${referrals.length})` },
          { key: 'timeline', label: '7. Care Journey Timeline' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-3 px-4 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === t.key
                ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-black shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <PatientLocationSection patient={patient} onUpdated={loadPatient} showCoordinates />

          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <User className="h-5 w-5 text-blue-600" />
              Patient Identity & Demographics
            </h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">GramCare ID</dt><dd className="font-mono font-black text-blue-700 dark:text-blue-400 text-sm">{patient.id.slice(0, 8).toUpperCase()}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Full Name</dt><dd className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{patient.name}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Age / Gender</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.age} years • {patient.gender}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Mobile Phone</dt><dd className="font-bold text-slate-800 dark:text-slate-200">{patient.phone || 'Not recorded'}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Emergency Contact</dt><dd className="font-bold text-rose-700 dark:text-rose-400">{patient.emergency_contact || patient.emergency_contact_phone || 'Not recorded'}</dd></div>
            </dl>
          </div>

          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              Clinical Baseline Summary
            </h2>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Blood Group & Rh</span>
                <span className="mt-1 inline-block font-black text-slate-900 dark:text-slate-100 text-sm">{patient.blood_group || 'O+'} (Rh Positive)</span>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Existing Conditions</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(patient.existing_conditions || ['Hypertension', 'Type-2 Diabetes']).map((c) => (
                    <span key={c} className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 font-extrabold text-slate-800 dark:text-slate-200">{c}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Known Allergies</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(patient.allergies || ['Penicillin']).map((a) => (
                    <span key={a} className="rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2.5 py-1 font-extrabold text-rose-700 dark:text-rose-300">{a}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6 border-slate-200 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Triage & Recommendation
            </h2>
            {latestRisk ? (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-slate-900 dark:text-slate-100">{latestRisk.risk_score}<span className="text-sm text-slate-400 font-semibold"> / 100</span></span>
                  <RiskBadge level={latestRisk.risk_level} />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-300">Recommended Action:</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium leading-5">{latestRisk.recommended_action}</p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500 font-medium">No risk score recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: VITALS & TRENDS */}
      {activeTab === 'vitals' && (
        <div className="card p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Vitals Measurements History & Trend Log
            </h2>
            <button onClick={() => setShowVitalsModal(true)} className="primary-btn text-xs py-2 px-3">
              <Plus className="h-4 w-4" /> Add Vitals
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] font-black text-slate-500 uppercase">
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Blood Pressure</th>
                  <th className="py-3 px-4">SpO2 Oxygen</th>
                  <th className="py-3 px-4">Blood Sugar</th>
                  <th className="py-3 px-4">Temperature</th>
                  <th className="py-3 px-4">Pulse Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-semibold text-slate-800 dark:text-slate-200">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 font-bold">{new Date(r.recorded_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4 font-black text-slate-900 dark:text-slate-100">{r.systolic_bp || '—'}/{r.diastolic_bp || '—'} mmHg</td>
                    <td className="py-3 px-4">{r.spo2 ? `${r.spo2}%` : '—'}</td>
                    <td className="py-3 px-4">{r.blood_sugar ? `${r.blood_sugar} mg/dL` : '—'}</td>
                    <td className="py-3 px-4">{r.temperature_c ? `${r.temperature_c}°C` : '—'}</td>
                    <td className="py-3 px-4">{r.pulse_bpm ? `${r.pulse_bpm} bpm` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CLINICAL & MEDICAL HISTORY */}
      {activeTab === 'clinical' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <FileText className="h-5 w-5 text-blue-600" />
              Medical History & Prescriptions
            </h2>
            <div className="mt-4 space-y-3 text-xs">
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">Family Medical History:</strong>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Hypertension in maternal history, Diabetes mellitus Type-2.</p>
              </div>
              <div>
                <strong className="text-slate-900 dark:text-slate-100 block">Lifestyle & Risk Factors:</strong>
                <p className="mt-1 text-slate-600 dark:text-slate-400">Non-smoker, mild nutritional anemia risk.</p>
              </div>
            </div>
          </div>

          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Baby className="h-5 w-5 text-rose-600" />
              Maternal & Child Health Information
            </h2>
            <div className="mt-4 space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <p><strong>Pregnancy Status:</strong> High-risk ANC monitoring active</p>
              <p><strong>ANC Visits Completed:</strong> 3 visits recorded</p>
              <p><strong>Expected Delivery Date (EDD):</strong> 15 Oct 2026</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ENCOUNTERS & VISITS */}
      {activeTab === 'visits' && (
        <div className="card p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-emerald-600" />
              Clinical Encounters & Doctor Visits
            </h2>
            <button onClick={() => setShowVisitModal(true)} className="primary-btn text-xs py-2 px-3">
              <Plus className="h-4 w-4" /> Log Visit
            </button>
          </div>

          <div className="mt-4 space-y-4">
            {visits.map(v => (
              <div key={v.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 bg-white dark:bg-slate-900">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span className="font-black text-slate-900 dark:text-slate-100 text-sm">{v.chief_complaint || 'Clinical Visit'}</span>
                  <span className="text-xs font-bold text-slate-400">{new Date(v.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-3 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                  <p><strong>Location:</strong> {v.location || 'PHC Clinic'}</p>
                  <p><strong>Assessment:</strong> {v.assessment || 'Normal'}</p>
                  <p><strong>Prescription:</strong> {v.prescription || 'N/A'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI RISK & EXPLAINABILITY */}
      {activeTab === 'ai' && (
        <div className="card p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              Explainable AI Risk Scoring Breakdown
            </h2>
            <button onClick={() => setShowOverrideModal(true)} className="secondary-btn text-xs py-2 px-3">
              <Edit3 className="h-4 w-4" /> Doctor Risk Override
            </button>
          </div>

          {latestRisk ? (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Score & Level</span>
                  <div className="mt-1 text-5xl font-black text-slate-900 dark:text-slate-100">{latestRisk.risk_score}<span className="text-lg text-slate-400 font-semibold"> / 100</span></div>
                  <p className="mt-2 text-xs font-bold text-slate-500">Model Version: {latestRisk.model_version}</p>
                </div>
                <RiskBadge level={latestRisk.risk_level} />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">Why is this patient high-risk? (Contributing Factors)</h3>
                <ul className="mt-2 space-y-2 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  {(latestRisk.contributing_factors || ['Hypertension stage 2', 'High-risk obstetrics']).map((f, i) => (
                    <li key={i} className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-900 text-amber-950 dark:text-amber-200">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500">No risk assessment recorded.</p>
          )}
        </div>
      )}

      {/* TAB 6: REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <ArrowUpRight className="h-5 w-5 text-violet-600" />
            Digital Referrals History
          </h2>
          <div className="mt-4 space-y-4">
            {referrals.map(rf => (
              <div key={rf.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">Status: <strong className="uppercase text-violet-700">{rf.status}</strong></span>
                  <span className="text-xs text-slate-400">{new Date(rf.created_at).toLocaleDateString()}</span>
                </div>
                <p className="mt-2 text-xs text-slate-700 dark:text-slate-300"><strong>Reason:</strong> {rf.reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
            <Clock className="h-5 w-5 text-blue-600" />
            Chronological Patient Care Journey Timeline
          </h2>
          <div className="mt-6 relative border-l-2 border-slate-200 dark:border-slate-800 pl-6 space-y-6 ml-3">
            {timelineEvents.map((ev) => (
              <div key={ev.id} className="relative">
                <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 bg-blue-600" />
                <span className="text-[11px] font-extrabold text-slate-400 block">{new Date(ev.date).toLocaleString()}</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 mt-0.5">{ev.title}</h4>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-5">{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vitals Record Modal */}
      {showEditModal && (
        <PatientRegistrationModal
          patient={patient}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => { setShowEditModal(false); loadPatient(); }}
        />
      )}

      {showVitalsModal && (
        <VitalsRecordModal
          patients={[patient]}
          selectedPatientId={patient.id}
          onClose={() => setShowVitalsModal(false)}
          onSuccess={loadPatient}
        />
      )}

      {/* New Visit Modal */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleAddVisit} className="w-full max-w-lg card p-6 shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-black text-slate-900">Record Clinical Visit</h3>
            <p className="mt-1 text-xs text-slate-600">Create a clinical encounter record for {patient.name}.</p>
            
            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                Chief Complaint
                <input required value={visitForm.chief_complaint} onChange={e => setVisitForm({...visitForm, chief_complaint: e.target.value})} className="input mt-1 text-xs" placeholder="e.g. Routine ANC checkup" />
              </label>
              <label className="block text-xs font-bold text-slate-800">
                Symptoms
                <input value={visitForm.symptoms} onChange={e => setVisitForm({...visitForm, symptoms: e.target.value})} className="input mt-1 text-xs" placeholder="e.g. Mild headache" />
              </label>
              <label className="block text-xs font-bold text-slate-800">
                Clinical Assessment
                <input value={visitForm.assessment} onChange={e => setVisitForm({...visitForm, assessment: e.target.value})} className="input mt-1 text-xs" placeholder="e.g. Hypertension Stage 1" />
              </label>
              <label className="block text-xs font-bold text-slate-800">
                Prescription & Advice
                <textarea value={visitForm.prescription} onChange={e => setVisitForm({...visitForm, prescription: e.target.value})} rows={2} className="input mt-1 text-xs" placeholder="e.g. Methyldopa 250mg BD" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowVisitModal(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold">Cancel</button>
              <button type="submit" disabled={busy} className="primary-btn px-4 py-2 text-xs font-bold">{busy ? 'Saving...' : 'Save Visit Record'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Risk Override Modal */}
      {showOverrideModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <form onSubmit={handleRiskOverride} className="w-full max-w-md card p-6 shadow-2xl border-slate-200">
            <h3 className="text-xl font-black text-slate-900">Doctor Risk Level Override</h3>
            <p className="mt-1 text-xs text-slate-600">Reclassify AI clinical triage score with clinical reasoning.</p>

            <div className="mt-4 space-y-3">
              <label className="block text-xs font-bold text-slate-800">
                New Risk Level
                <select value={overrideLevel} onChange={e => setOverrideLevel(e.target.value as any)} className="input mt-1 text-xs">
                  <option value="low">Low Risk</option>
                  <option value="medium">Medium Risk</option>
                  <option value="high">High Risk</option>
                  <option value="critical">Critical Emergency</option>
                </select>
              </label>
              <label className="block text-xs font-bold text-slate-800">
                Clinical Override Reason (Required)
                <textarea required value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={3} className="input mt-1 text-xs" placeholder="State clinical justification..." />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowOverrideModal(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold">Cancel</button>
              <button type="submit" disabled={busy} className="primary-btn px-4 py-2 text-xs font-bold">{busy ? 'Saving...' : 'Confirm Override'}</button>
            </div>
          </form>
        </div>
      )}
    </DashboardShell>
  );
}
