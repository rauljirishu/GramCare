'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { Plus, ShieldCheck, X } from 'lucide-react';

type ClinicalRecord = { id: string; record_kind: string; resource_type: string; occurred_on: string | null; source_label: string; status: string; title: string; description: string | null; created_at: string };
type Patient = { id: string; patient_code: string; name: string; age: number; gender: string; village: string | null; blood_group: string | null; verification_status: string; facilities?: { name: string }[] | null };
type HealthRecord = { id: string; recorded_at: string; systolic_bp: number | null; diastolic_bp: number | null; temperature_c: number | null; pulse_bpm: number | null; spo2: number | null; symptoms: string | null };
type Risk = { id: string; assessed_at: string; risk_score: number; risk_level: string; recommended_action?: string | null };
type Referral = { id: string; created_at: string; status: string; reason: string; referred_to_text: string | null };
type FollowUp = { id: string; scheduled_date: string; status: string; notes: string | null };

export default function PatientProfile() {
  const { id: code } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<ClinicalRecord[]>([]);
  const [vitals, setVitals] = useState<HealthRecord[]>([]);
  const [risks, setRisks] = useState<Risk[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [staff, setStaff] = useState(false);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setError('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError('Authentication required.'); return; }
    const { data: profile, error: profileError } = await supabase.from('users').select('role').eq('id', user.id).single();
    if (profileError) { setError('Unable to verify your account permissions.'); return; }
    setStaff(['phc_head', 'phc_worker'].includes(profile.role));
    const { data: found, error: patientError } = await supabase.from('patients').select('id,patient_code,name,age,gender,village,blood_group,verification_status,facilities(name)').eq('patient_code', code).single();
    if (patientError || !found) { setError('This patient record is unavailable to your account.'); return; }
    setPatient(found as Patient);
    const [timeline, health, risk, referral, followUp] = await Promise.all([
      supabase.from('clinical_records').select('id,record_kind,resource_type,occurred_on,source_label,status,title,description,created_at').eq('patient_id', found.id).order('occurred_on', { ascending: false }),
      supabase.from('health_records').select('id,recorded_at,systolic_bp,diastolic_bp,temperature_c,pulse_bpm,spo2,symptoms').eq('patient_id', found.id).order('recorded_at', { ascending: false }),
      supabase.from('risk_assessments').select('id,assessed_at,risk_score,risk_level,recommended_action').eq('patient_id', found.id).order('assessed_at', { ascending: false }),
      supabase.from('referrals').select('id,created_at,status,reason,referred_to_text').eq('patient_id', found.id).order('created_at', { ascending: false }),
      supabase.from('follow_ups').select('id,scheduled_date,status,notes').eq('patient_id', found.id).order('scheduled_date', { ascending: false })
    ]);
    if (timeline.error || health.error || risk.error || referral.error || followUp.error) setError('Patient loaded, but some history records could not be retrieved.');
    setRecords((timeline.data || []) as ClinicalRecord[]);
    setVitals((health.data || []) as HealthRecord[]);
    setRisks((risk.data || []) as Risk[]);
    setReferrals((referral.data || []) as Referral[]);
    setFollowUps((followUp.data || []) as FollowUp[]);
  }

  useEffect(() => { load(); }, [code]);

  async function addRecord(event: React.FormEvent) {
    event.preventDefault();
    if (!patient || !title.trim()) return;
    setSaving(true); setError('');
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('facility_id').eq('id', user?.id || '').single();
    const { error: saveError } = await supabase.from('clinical_records').insert({ patient_id: patient.id, facility_id: profile?.facility_id || null, practitioner_id: user?.id, record_kind: 'current', resource_type: 'encounter', occurred_on: date || null, date_precision: date ? 'exact' : 'unknown', source_type: 'phc_entered', source_label: 'GramCare clinical entry', status: 'pending_verification', title: title.trim(), description: description.trim() || null, structured_data: {} });
    setSaving(false);
    if (saveError) { setError(`Unable to save history: ${saveError.message}`); return; }
    setTitle(''); setDescription(''); setDate(''); setShowForm(false); await load();
  }

  return <DashboardShell>
    <Link href="/patients" className="text-sm font-bold text-blue-700">Back to patients</Link>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700">{error}</p>}
    {patient && <>
      <header className="mt-4 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Authorised patient record</p><h1 className="mt-2 text-3xl font-black">{patient.name}</h1><p className="mt-1 text-sm text-slate-600">{patient.patient_code} · {patient.age} years · {patient.gender}</p></div><div className="flex flex-wrap gap-2">{staff && <Link href={`/assessment?patient=${patient.id}`} className="primary-btn">Record vitals</Link>}{staff && <Link href="/referrals" className="secondary-btn">Create referral</Link>}{staff && <button onClick={() => setShowForm(true)} className="secondary-btn"><Plus className="h-4 w-4" />Add history</button>}</div></header>
      <div className="mt-5 grid gap-4 sm:grid-cols-3"><div className="card p-4"><p className="text-xs font-bold uppercase text-slate-500">Village</p><p className="mt-2 font-bold">{patient.village || 'Not recorded'}</p></div><div className="card p-4"><p className="text-xs font-bold uppercase text-slate-500">Blood group</p><p className="mt-2 font-bold">{patient.blood_group || 'Not recorded'}</p></div><div className="card p-4"><p className="text-xs font-bold uppercase text-slate-500">Verification</p><p className="mt-2 font-bold capitalize">{patient.verification_status}</p></div></div>
      <section className="card mt-6 p-5"><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /><h2 className="font-black">Medical history</h2></div>{records.length ? <div className="mt-5 space-y-4">{records.map(record => <article className="border-l-2 border-blue-200 pl-4" key={record.id}><div className="flex flex-wrap justify-between gap-2"><h3 className="font-bold">{record.title}</h3><span className="text-xs text-slate-500">{record.occurred_on || record.created_at.slice(0, 10)}</span></div><p className="mt-1 text-sm text-slate-600">{record.description || record.source_label} · {record.status.replaceAll('_', ' ')}</p></article>)}</div> : <p className="mt-4 text-sm text-slate-500">No clinical history has been recorded for this authorised patient.</p>}</section>
      <section className="mt-6 grid gap-4 lg:grid-cols-2"><div className="card p-5"><h2 className="font-black">Vitals and AI risk</h2>{vitals.length ? <div className="mt-4 space-y-3">{vitals.map(item => <article className="rounded-lg bg-slate-50 p-3 text-sm" key={item.id}><p className="font-bold">{item.recorded_at.slice(0, 10)} · BP {item.systolic_bp ?? '-'} / {item.diastolic_bp ?? '-'} · SpO2 {item.spo2 ?? '-'}%</p><p className="mt-1 text-slate-600">Temp {item.temperature_c ?? '-'}°C · Pulse {item.pulse_bpm ?? '-'} · {item.symptoms || 'No symptoms recorded'}</p></article>)}</div> : <p className="mt-4 text-sm text-slate-500">No vitals recorded yet.</p>}{risks.length > 0 && <div className="mt-4 border-t pt-4">{risks.map(item => <article key={item.id}><p className="font-bold capitalize">Risk: {item.risk_level} · {item.risk_score}/100</p><p className="text-xs text-slate-500">Assessed {item.assessed_at.slice(0, 10)} · Clinical decision support, not a diagnosis.</p></article>)}</div>}</div><div className="card p-5"><h2 className="font-black">Referrals and follow-up</h2>{referrals.length ? <div className="mt-4 space-y-3">{referrals.map(item => <article className="rounded-lg bg-slate-50 p-3 text-sm" key={item.id}><p className="font-bold capitalize">{item.status.replaceAll('_', ' ')}</p><p className="text-slate-600">{item.reason} · {item.referred_to_text || 'Receiving facility pending'}</p></article>)}</div> : <p className="mt-4 text-sm text-slate-500">No referrals recorded yet.</p>}{followUps.length > 0 && <div className="mt-4 border-t pt-4">{followUps.map(item => <p className="text-sm" key={item.id}><b>{item.scheduled_date}</b> · <span className="capitalize">{item.status}</span> · {item.notes || 'Care follow-up'}</p>)}</div>}</div></section>
    </>}
    {showForm && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><form onSubmit={addRecord} className="card w-full max-w-lg p-6"><div className="flex items-center justify-between"><h2 className="text-xl font-black">Add clinical history</h2><button type="button" onClick={() => setShowForm(false)}><X className="h-5 w-5" /></button></div><label className="mt-5 block text-sm font-bold">Title<input required value={title} onChange={event => setTitle(event.target.value)} className="input mt-1" /></label><label className="mt-4 block text-sm font-bold">Date<input type="date" value={date} onChange={event => setDate(event.target.value)} className="input mt-1" /></label><label className="mt-4 block text-sm font-bold">Details<textarea value={description} onChange={event => setDescription(event.target.value)} className="input mt-1 min-h-24" /></label><button disabled={saving} className="primary-btn mt-5">{saving ? 'Saving...' : 'Save history'}</button></form></div>}
  </DashboardShell>;
}
