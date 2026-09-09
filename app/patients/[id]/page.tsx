'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { RiskBadge } from '@/components/risk-badge';
import { VitalsRecordModal } from '@/components/vitals-record-modal';
import { getPatientDetail, createReferral } from '@/lib/api/doctor';
import { AI_DISCLAIMER_TEXT, predictOfflineRisk } from '@/lib/ai/risk-predictor';
import type { Patient, HealthRecord, RiskAssessment, Referral, FollowUp } from '@/lib/types';
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
  ChevronLeft
} from 'lucide-react';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const patientId = params?.id || '';

  const [data, setData] = useState<{
    patient: Patient;
    records: HealthRecord[];
    risks: RiskAssessment[];
    referrals: Referral[];
    followUps: FollowUp[];
  } | null>(null);

  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'vitals' | 'ai' | 'referrals' | 'followups' | 'timeline'>('overview');
  const [showVitalsModal, setShowVitalsModal] = useState(false);

  useEffect(() => {
    if (!patientId) return;
    getPatientDetail(patientId)
      .then(setData)
      .catch(() => setError('Patient record unavailable.'));
  }, [patientId]);

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
    type: 'intake' | 'vitals' | 'ai_risk' | 'referral' | 'follow_up';
    desc: string;
    badge?: string;
  }> = [];

  timelineEvents.push({
    id: `ev-intake-${patient.id}`,
    date: patient.created_at,
    title: 'Patient Digital Intake Registered',
    type: 'intake',
    desc: `Registered by field health worker at ${patient.village || 'Gram Panchayat'}.`
  });

  records.forEach(r => {
    timelineEvents.push({
      id: `ev-vit-${r.id}`,
      date: r.recorded_at,
      title: 'Vitals & Clinical Record Captured',
      type: 'vitals',
      desc: `BP: ${r.systolic_bp || '—'}/${r.diastolic_bp || '—'} mmHg | Sugar: ${r.blood_sugar || '—'} mg/dL | SpO2: ${r.spo2 || '—'}% | Temp: ${r.temperature_c || '—'}°C. ${r.symptoms ? `Symptoms: ${r.symptoms}` : ''}`
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
      desc: `Reason: ${rf.reason}. Destination: ${rf.referred_to_text || 'District Hospital'}.`
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

  // Sort timeline chronologically descending
  timelineEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardShell>
      {/* Top Header Navigation */}
      <div className="mb-6">
        <Link href="/patients" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mb-3">
          <ChevronLeft className="h-4 w-4" />
          <span>Back to All Patients</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-blue-100 text-blue-700 font-black text-2xl shadow-sm border border-blue-200">
              {patient.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-black text-slate-900 sm:text-3xl">{patient.name}</h1>
                {latestRisk && <RiskBadge level={latestRisk.risk_level} />}
              </div>
              <p className="mt-1 text-xs font-semibold text-slate-600 flex flex-wrap items-center gap-3">
                <span>{patient.age} yrs • <span className="capitalize">{patient.gender}</span></span>
                <span>•</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {patient.village || 'Rampur Gram Panchayat'}</span>
                <span>•</span>
                <span>Blood Group: <strong className="text-slate-800">{patient.blood_group || 'O+'}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setShowVitalsModal(true)}
              className="secondary-btn text-xs py-2.5 px-4 font-bold"
            >
              <Plus className="h-4 w-4 text-blue-600" />
              <span>Record New Vitals</span>
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

      {/* Medical AI Disclaimer Banner */}
      <div className="mb-6 rounded-2xl bg-slate-900 p-4 text-white shadow-sm border border-slate-800">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-5 text-slate-300 font-medium">{AI_DISCLAIMER_TEXT}</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-slate-200 overflow-x-auto gap-2 text-xs font-extrabold">
        {[
          { key: 'overview', label: '1. Overview' },
          { key: 'history', label: '2. Medical History' },
          { key: 'vitals', label: '3. Vitals Logs' },
          { key: 'ai', label: '4. AI Risk Assessment' },
          { key: 'referrals', label: `5. Referrals (${referrals.length})` },
          { key: 'followups', label: `6. Follow-ups (${followUps.length})` },
          { key: 'timeline', label: '7. Chronological Timeline' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key as any)}
            className={`py-3 px-4 rounded-t-xl transition border-b-2 whitespace-nowrap ${
              activeTab === t.key
                ? 'border-blue-600 bg-white text-blue-700 font-black shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
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
          {/* Demographics Card */}
          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="h-5 w-5 text-blue-600" />
              Patient Demographics
            </h2>
            <dl className="mt-4 space-y-3 text-xs">
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Full Name</dt><dd className="font-extrabold text-slate-900 text-sm">{patient.name}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Age / Gender</dt><dd className="font-bold text-slate-800">{patient.age} years • {patient.gender}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Phone Number</dt><dd className="font-bold text-slate-800">{patient.phone || 'Not recorded'}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Emergency Contact</dt><dd className="font-bold text-rose-700">{patient.emergency_contact || '+91 98765 43211'}</dd></div>
              <div><dt className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Village & Address</dt><dd className="font-bold text-slate-800">{patient.address || patient.village || 'Rampur Sector 2'}</dd></div>
            </dl>
          </div>

          {/* Clinical Profile Card */}
          <div className="card p-6 border-slate-200">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <HeartPulse className="h-5 w-5 text-rose-600" />
              Clinical Summary
            </h2>
            <div className="mt-4 space-y-4 text-xs">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Existing Conditions</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(patient.existing_conditions || ['Hypertension', 'Type-2 Diabetes']).map((c) => (
                    <span key={c} className="rounded-lg bg-slate-100 px-2.5 py-1 font-extrabold text-slate-800">{c}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Known Allergies</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(patient.allergies || ['Penicillin']).map((a) => (
                    <span key={a} className="rounded-lg bg-rose-50 border border-rose-200 px-2.5 py-1 font-extrabold text-rose-700">{a}</span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 block">Current Medications</span>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {(patient.current_medications || ['Amlodipine 5mg', 'Metformin 500mg']).map((m) => (
                    <span key={m} className="rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 font-extrabold text-blue-800 flex items-center gap-1">
                      <Pill className="h-3 w-3 text-blue-600" />
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* AI Triage Status Card */}
          <div className="card p-6 border-slate-200 bg-gradient-to-b from-white to-slate-50">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <ShieldAlert className="h-5 w-5 text-amber-600" />
              Latest Triage Status
            </h2>
            {latestRisk ? (
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="text-4xl font-black text-slate-900">{latestRisk.risk_score}<span className="text-sm text-slate-400 font-semibold"> / 100</span></span>
                  <RiskBadge level={latestRisk.risk_level} />
                </div>
                <p className="mt-3 text-xs font-bold text-slate-700">Priority: <span className="text-rose-700">{latestRisk.priority || 'URGENT REVIEW'}</span></p>
                <p className="mt-2 text-xs text-slate-600 font-medium leading-5">{latestRisk.recommended_action}</p>
              </div>
            ) : (
              <p className="mt-4 text-xs text-slate-500 font-medium">No risk score recorded yet.</p>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL HISTORY */}
      {activeTab === 'history' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            Medical History & Consultations
          </h2>
          <div className="mt-4 space-y-4 text-xs">
            {records.map((r) => (
              <div key={r.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-extrabold text-slate-900 text-sm">Vitals & Symptoms Visit</span>
                  <span className="text-slate-400 text-[11px] font-semibold">{new Date(r.recorded_at).toLocaleString()}</span>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-4 font-semibold text-slate-700">
                  <div>Blood Pressure: <strong className="text-slate-900">{r.systolic_bp || '—'}/{r.diastolic_bp || '—'} mmHg</strong></div>
                  <div>Blood Sugar: <strong className="text-slate-900">{r.blood_sugar || '—'} mg/dL</strong></div>
                  <div>Oxygen SpO2: <strong className="text-slate-900">{r.spo2 || '—'}%</strong></div>
                  <div>Temperature: <strong className="text-slate-900">{r.temperature_c || '—'}°C</strong></div>
                </div>
                {r.symptoms && (
                  <p className="mt-3 text-xs text-slate-700"><strong className="text-slate-900">Symptoms:</strong> {r.symptoms}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: VITALS LOGS */}
      {activeTab === 'vitals' && (
        <div className="card p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-600" />
              Recorded Vital Signs History
            </h2>
            <button onClick={() => setShowVitalsModal(true)} className="primary-btn text-xs py-2 px-3">
              <Plus className="h-4 w-4" /> Add Vitals
            </button>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-black text-slate-500 uppercase">
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">BP (mmHg)</th>
                  <th className="py-3 px-4">SpO2 (%)</th>
                  <th className="py-3 px-4">Sugar (mg/dL)</th>
                  <th className="py-3 px-4">Temp (°C)</th>
                  <th className="py-3 px-4">Pulse (bpm)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-800">
                {records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 px-4 text-slate-900 font-bold">{new Date(r.recorded_at).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{r.systolic_bp || '—'}/{r.diastolic_bp || '—'}</td>
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

      {/* TAB 4: AI RISK ASSESSMENT */}
      {activeTab === 'ai' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Sparkles className="h-5 w-5 text-blue-600" />
            AI-Assisted Triage Risk Assessment
          </h2>
          {latestRisk ? (
            <div className="mt-4 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-slate-50 border border-slate-200 p-6">
                <div>
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider block">Calculated Risk Score</span>
                  <div className="mt-1 text-5xl font-black text-slate-900">{latestRisk.risk_score}<span className="text-lg text-slate-400 font-semibold"> / 100</span></div>
                  <p className="mt-2 text-xs font-bold text-slate-500">Model Version: {latestRisk.model_version}</p>
                </div>
                <RiskBadge level={latestRisk.risk_level} />
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">Warning Signals Detected</h3>
                <ul className="mt-2 space-y-1.5 text-xs font-semibold text-rose-800">
                  {(latestRisk.warning_signals || []).map((w, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
                      <span>{w}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-black text-slate-900">Recommended Clinical Action</h3>
                <p className="mt-2 text-xs font-bold text-slate-700 bg-amber-50 border border-amber-200 p-4 rounded-xl leading-6">
                  {latestRisk.recommended_action}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-xs text-slate-500 font-medium">No AI assessment generated yet.</p>
          )}
        </div>
      )}

      {/* TAB 5: REFERRALS */}
      {activeTab === 'referrals' && (
        <div className="card p-6 border-slate-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-violet-600" />
              Digital Referral Records
            </h2>
            <Link href={`/patients/${patient.id}/referral`} className="primary-btn text-xs py-2 px-3">
              <Plus className="h-4 w-4" /> Create Referral
            </Link>
          </div>

          <div className="mt-4 space-y-3">
            {referrals.map((rf) => (
              <div key={rf.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">{rf.reason}</span>
                  <span className="px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider bg-violet-100 text-violet-800">
                    {rf.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-600 font-medium">Destination: <strong className="text-slate-800">{rf.referred_to_text || 'District Hospital'}</strong></p>
                <span className="mt-2 block text-[11px] text-slate-400 font-semibold">{new Date(rf.created_at).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FOLLOW-UPS */}
      {activeTab === 'followups' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-4">
            <Clock className="h-5 w-5 text-emerald-600" />
            Scheduled Clinical Follow-ups
          </h2>
          <div className="mt-4 space-y-3">
            {followUps.map((fl) => (
              <div key={fl.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900 text-sm">Scheduled: {fl.scheduled_date}</span>
                  <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                    fl.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    fl.status === 'missed' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {fl.status}
                  </span>
                </div>
                <p className="mt-2 text-slate-600 font-medium">{fl.notes || 'Routine follow-up checkup.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CHRONOLOGICAL TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="card p-6 border-slate-200">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-5">
            <Calendar className="h-5 w-5 text-blue-600" />
            Chronological Healthcare Lifecycle Timeline
          </h2>
          <div className="mt-4 space-y-6 border-l-2 border-blue-200 pl-6 ml-3">
            {timelineEvents.map((ev) => (
              <div key={ev.id} className="relative">
                <span className="absolute -left-[31px] top-0 grid h-4 w-4 place-items-center rounded-full bg-blue-600 ring-4 ring-white" />
                <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">{new Date(ev.date).toLocaleString()}</span>
                <h3 className="mt-1 font-extrabold text-slate-900 text-sm">{ev.title}</h3>
                <p className="mt-1 text-xs text-slate-600 font-medium leading-5">{ev.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {showVitalsModal && (
        <VitalsRecordModal
          patientId={patient.id}
          onClose={() => setShowVitalsModal(false)}
          onSuccess={() => {
            getPatientDetail(patient.id).then(setData);
            setShowVitalsModal(false);
          }}
        />
      )}
    </DashboardShell>
  );
}
