'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { predictOfflineRisk, type PredictionResult } from '@/lib/ai/risk-predictor';

type PatientOption = { id: string; patient_code: string | null; name: string };

function AssessmentContent() {
  const searchParams = useSearchParams();
  const [patients, setPatients] = useState<PatientOption[]>([]);
  const [patientId, setPatientId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [history, setHistory] = useState('');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [temperature, setTemperature] = useState('');
  const [pulse, setPulse] = useState('');
  const [spo2, setSpo2] = useState('');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const requestedPatient = searchParams.get('patient');
    if (requestedPatient) setPatientId(requestedPatient);
    supabase.from('patients').select('id,patient_code,name').order('created_at', { ascending: false }).then(({ data, error }) => {
      if (error) setNotice('Unable to load authorised patients.');
      else setPatients((data || []) as PatientOption[]);
    });
  }, [searchParams]);

  function screen() {
    const next = predictOfflineRisk({
      systolicBp: Number(systolicBp) || null,
      diastolicBp: Number(diastolicBp) || null,
      temperatureC: Number(temperature) || null,
      pulseBpm: Number(pulse) || null,
      spo2: Number(spo2) || null,
      symptoms,
      existingConditions: history.split(',').map(item => item.trim()).filter(Boolean)
    });
    setResult(next);
    setNotice('AI-assisted risk screening prepared for qualified clinical review. This is not a diagnosis.');
  }

  async function save() {
    if (!patientId || !result) return;
    setSaving(true);
    setNotice('');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNotice('Authentication required.'); setSaving(false); return; }
    const { data: record, error: recordError } = await supabase.from('health_records').insert({
      patient_id: patientId,
      recorded_by: user.id,
      systolic_bp: Number(systolicBp) || null,
      diastolic_bp: Number(diastolicBp) || null,
      temperature_c: Number(temperature) || null,
      pulse_bpm: Number(pulse) || null,
      spo2: Number(spo2) || null,
      symptoms: symptoms || null,
      notes: history || null
    }).select('id').single();
    if (recordError || !record) { setNotice(recordError?.message || 'Unable to save assessment.'); setSaving(false); return; }
    const { error } = await supabase.from('risk_assessments').insert({
      patient_id: patientId,
      health_record_id: record.id,
      risk_score: result.riskScore,
      risk_level: result.riskLevel,
      model_version: result.modelVersion
    });
    setSaving(false);
    setNotice(error ? error.message : 'Assessment saved and queued for doctor review.');
  }

  return <DashboardShell><p className="eyebrow">Clinical decision support</p><h1 className="mt-2 text-3xl font-black">AI-assisted risk screening</h1><p className="mt-1 text-sm text-slate-600">Symptoms, vitals and history produce a Low, Medium or High priority for doctor review. This is not a diagnosis.</p><section className="card mt-6 p-5"><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-bold">Authorised patient<select value={patientId} onChange={event => setPatientId(event.target.value)} className="input mt-1"><option value="">Select patient</option>{patients.map(patient => <option key={patient.id} value={patient.id}>{patient.name} {patient.patient_code ? `(${patient.patient_code})` : ''}</option>)}</select></label><label className="text-sm font-bold">Symptoms<textarea value={symptoms} onChange={event => setSymptoms(event.target.value)} className="input mt-1" placeholder="Fever, cough, pain..." /></label><label className="text-sm font-bold">Existing conditions<textarea value={history} onChange={event => setHistory(event.target.value)} className="input mt-1" placeholder="Comma-separated history" /></label><label className="text-sm font-bold">Systolic BP<input type="number" value={systolicBp} onChange={event => setSystolicBp(event.target.value)} className="input mt-1" /></label><label className="text-sm font-bold">Diastolic BP<input type="number" value={diastolicBp} onChange={event => setDiastolicBp(event.target.value)} className="input mt-1" /></label><label className="text-sm font-bold">Temperature C<input type="number" step="0.1" value={temperature} onChange={event => setTemperature(event.target.value)} className="input mt-1" /></label><label className="text-sm font-bold">Pulse / minute<input type="number" value={pulse} onChange={event => setPulse(event.target.value)} className="input mt-1" /></label><label className="text-sm font-bold">SpO2 %<input type="number" value={spo2} onChange={event => setSpo2(event.target.value)} className="input mt-1" /></label></div><div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={screen} className="primary-btn">Screen risk</button><button type="button" onClick={save} disabled={!result || !patientId || saving} className="secondary-btn">{saving ? 'Saving…' : 'Save for doctor review'}</button></div></section>{result&&<section className="card mt-5 p-5"><p className="text-xs font-bold uppercase text-slate-500">AI-assisted result</p><h2 className="mt-2 text-3xl font-black capitalize">{result.riskLevel} risk · {result.riskScore}/100</h2><p className="mt-2 text-sm font-semibold text-slate-700">{result.recommendedAction}</p><p className="mt-3 text-sm text-slate-600">Reason: {[...result.warningSignals, ...result.contributingFactors].join('; ')}</p><p className="mt-3 text-xs text-slate-500">{result.disclaimer}</p></section>}{notice&&<p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{notice}</p>}</DashboardShell>;
}

export default function AssessmentPage() {
  return <Suspense fallback={<div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-semibold text-slate-600">Loading assessment...</div>}><AssessmentContent /></Suspense>;
}