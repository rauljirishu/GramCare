'use client';

import React, { useState, useEffect } from 'react';
import { syncEngine } from '@/lib/offline/sync-engine';
import { predictOfflineRisk, type PredictionResult } from '@/lib/ai/risk-predictor';
import { Activity, X, Sparkles } from 'lucide-react';
import type { Patient } from '@/lib/types';

interface ModalProps {
  patients?: Patient[];
  patientId?: string;
  selectedPatientId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function VitalsRecordModal({ patients = [], patientId: propsPatientId, selectedPatientId, onClose, onSuccess }: ModalProps) {
  const [patientId, setPatientId] = useState(selectedPatientId || propsPatientId || (patients[0]?.id ?? ''));
  const [systolicBp, setSystolicBp] = useState<number | ''>('');
  const [diastolicBp, setDiastolicBp] = useState<number | ''>('');
  const [bloodSugar, setBloodSugar] = useState<number | ''>('');
  const [temperatureC, setTemperatureC] = useState<number | ''>('');
  const [pulseBpm, setPulseBpm] = useState<number | ''>('');
  const [spo2, setSpo2] = useState<number | ''>('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [prediction, setPrediction] = useState<PredictionResult | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const res = predictOfflineRisk({
      systolicBp: systolicBp !== '' ? Number(systolicBp) : null,
      diastolicBp: diastolicBp !== '' ? Number(diastolicBp) : null,
      bloodSugar: bloodSugar !== '' ? Number(bloodSugar) : null,
      temperatureC: temperatureC !== '' ? Number(temperatureC) : null,
      pulseBpm: pulseBpm !== '' ? Number(pulseBpm) : null,
      spo2: spo2 !== '' ? Number(spo2) : null,
      symptoms
    });
    setPrediction(res);
  }, [systolicBp, diastolicBp, bloodSugar, temperatureC, pulseBpm, spo2, symptoms]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId) return;

    setBusy(true);
    try {
      await syncEngine.createVitalsAndRiskOffline({
        patientId,
        systolicBp: systolicBp !== '' ? Number(systolicBp) : null,
        diastolicBp: diastolicBp !== '' ? Number(diastolicBp) : null,
        bloodSugar: bloodSugar !== '' ? Number(bloodSugar) : null,
        temperatureC: temperatureC !== '' ? Number(temperatureC) : null,
        pulseBpm: pulseBpm !== '' ? Number(pulseBpm) : null,
        spo2: spo2 !== '' ? Number(spo2) : null,
        symptoms,
        notes
      });

      onSuccess();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const getBadgeStyle = (level?: string) => {
    if (level === 'high') return 'bg-rose-600 text-white border-rose-700 shadow-md';
    if (level === 'medium') return 'bg-amber-500 text-white border-amber-600 shadow-md';
    return 'bg-emerald-600 text-white border-emerald-700 shadow-md';
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 sm:p-8 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-rose-600 font-bold">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-xl font-black text-slate-900">Record Vitals & Symptoms</h2>
              <p className="text-xs text-slate-500">Offline AI Risk Classification & Triage</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 grid place-items-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700">Select Patient *</label>
            <select
              required
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
              className="input mt-1 bg-white font-bold text-slate-800"
            >
              {patients.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.age}y, {p.village || 'No Village'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700">Systolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={systolicBp}
                onChange={e => setSystolicBp(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Diastolic BP (mmHg)</label>
              <input
                type="number"
                placeholder="e.g. 80"
                value={diastolicBp}
                onChange={e => setDiastolicBp(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Blood Sugar (mg/dL)</label>
              <input
                type="number"
                placeholder="e.g. 110"
                value={bloodSugar}
                onChange={e => setBloodSugar(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">SpO2 Oxygen (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                placeholder="e.g. 98"
                value={spo2}
                onChange={e => setSpo2(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Temperature (°C)</label>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 37.0"
                value={temperatureC}
                onChange={e => setTemperatureC(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700">Pulse (BPM)</label>
              <input
                type="number"
                placeholder="e.g. 72"
                value={pulseBpm}
                onChange={e => setPulseBpm(e.target.value ? Number(e.target.value) : '')}
                className="input mt-1"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Symptoms Observed / Reported</label>
            <input
              type="text"
              placeholder="e.g. chest pain, dizziness, severe cough, fever"
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              className="input mt-1"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700">Clinical Notes</label>
            <textarea
              rows={2}
              placeholder="Additional observations..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
              className="input mt-1 resize-none"
            />
          </div>

          {prediction && (
            <div className="rounded-2xl border-2 border-slate-200 bg-slate-50 p-4 shadow-sm transition-all duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-black uppercase text-slate-700">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  <span>Offline AI Risk Prediction</span>
                </div>
                
                <span className={`rounded-full px-3 py-1 text-xs font-black uppercase tracking-wider ${getBadgeStyle(prediction.riskLevel)}`}>
                  {prediction.riskLevel} Risk ({prediction.riskScore}/100)
                </span>
              </div>

              <div className="mt-3">
                <p className="text-xs font-bold text-slate-800">Detected Signals:</p>
                <ul className="mt-1 space-y-1">
                  {prediction.warningSignals.map((sig, idx) => (
                    <li key={idx} className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                      <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      <span>{sig}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-3 border-t border-slate-200 pt-2 text-xs font-bold text-slate-800">
                Action: <span className="text-blue-700 font-normal">{prediction.recommendedAction}</span>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button type="button" onClick={onClose} className="secondary-btn text-xs py-2.5">
              Cancel
            </button>
            <button disabled={busy} type="submit" className="primary-btn text-xs py-2.5">
              {busy ? 'Evaluating & Saving…' : 'Save Record (Offline AI Score Calculated)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
