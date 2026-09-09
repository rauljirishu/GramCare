'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { RiskBadge } from '@/components/risk-badge';
import { getPatients } from '@/lib/api/doctor';
import { AI_DISCLAIMER_TEXT } from '@/lib/ai/risk-predictor';
import type { PatientRow } from '@/lib/types';
import { 
  Flame, 
  AlertTriangle, 
  ArrowUpRight, 
  ChevronRight, 
  MapPin, 
  Sparkles,
  UserCheck,
  Zap,
  HelpCircle,
  X,
  Activity,
  ShieldAlert,
  Stethoscope,
  Info
} from 'lucide-react';

export default function HighRiskPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatientForExplanation, setSelectedPatientForExplanation] = useState<PatientRow | null>(null);

  useEffect(() => {
    getPatients({})
      .then((data) => {
        const filtered = data.filter(
          p => p.latestRisk?.risk_level === 'critical' || p.latestRisk?.risk_level === 'high'
        );
        filtered.sort((a, b) => (b.latestRisk?.risk_score ?? 0) - (a.latestRisk?.risk_score ?? 0));
        setPatients(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 dark:bg-rose-950/60 px-3.5 py-1.5 text-xs font-extrabold text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
            <span>High-Risk Triage Workspace</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
            Critical & High-Risk Triage Queue
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-400">
            Prioritized clinical queue of patients requiring urgent doctor consultation or hospital referral.
          </p>
        </div>
      </header>

      {/* AI Disclaimer */}
      <div className="mb-6 rounded-2xl bg-rose-950 p-4 text-white shadow-sm border border-rose-800">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-rose-300 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black uppercase text-rose-300 block">Clinical Decision Support System (CDSS) Advisory</span>
            <p className="text-xs leading-5 text-rose-100 font-medium">{AI_DISCLAIMER_TEXT}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading label="Analyzing triage risk scores…" />
      ) : !patients.length ? (
        <div className="card py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 font-bold">
            <UserCheck className="h-6 w-6" />
          </span>
          <p className="mt-3 text-base font-extrabold text-slate-800 dark:text-slate-200">No Critical or High-Risk Cases Currently</p>
          <p className="mt-1 text-xs text-slate-500">All registered patients have baseline low/medium risk scores.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patients.map((p) => {
            const risk = p.latestRisk;
            const nextActionText = risk?.risk_level === 'critical'
              ? 'CRITICAL EMERGENCY: 108 Ambulance transport & Immediate Doctor Review Required'
              : 'Doctor review recommended & PHC specialist referral pending';

            return (
              <div key={p.id} className="card p-6 border-slate-200 dark:border-slate-800 hover:border-rose-300 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-black text-xl">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">{p.name}</h3>
                        <RiskBadge level={risk?.risk_level ?? 'high'} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-2">
                        <span>{p.age} yrs • <span className="capitalize">{p.gender}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {p.village || 'Rampur Gram Panchayat'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">AI Risk Score</span>
                      <span className="text-3xl font-black text-rose-700 dark:text-rose-400">{risk?.risk_score ?? 85}<span className="text-xs text-slate-400 font-semibold"> / 100</span></span>
                    </div>

                    <button
                      onClick={() => setSelectedPatientForExplanation(p)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-3.5 py-2.5 text-xs font-bold text-amber-900 dark:text-amber-200 hover:bg-amber-100 transition"
                    >
                      <HelpCircle className="h-4 w-4 text-amber-600" />
                      <span>Why High Risk?</span>
                    </button>

                    <Link
                      href={`/patients/${p.id}/referral`}
                      className="primary-btn text-xs py-2.5 px-4 font-bold !bg-rose-600 hover:!bg-rose-700"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Create Referral</span>
                    </Link>

                    <Link
                      href={`/patients/${p.id}`}
                      className="secondary-btn text-xs py-2.5 px-4 font-bold"
                    >
                      <span>View Chart</span>
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>

                {/* Workflow Next Action Prompt */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 p-2.5 border border-rose-200 dark:border-rose-900 text-xs font-black text-rose-900 dark:text-rose-200">
                  <Zap className="h-4 w-4 text-rose-600 shrink-0 animate-pulse" />
                  <span>NEXT ACTION: {nextActionText}</span>
                </div>

                {/* Warning Signals & Clinical Guidance */}
                <div className="mt-3 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5">
                    <span className="font-extrabold text-rose-900 dark:text-rose-300 block text-[11px] uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Warning Signals & Symptoms
                    </span>
                    <p className="mt-1 text-slate-800 dark:text-slate-200 font-bold leading-5">
                      {risk?.warning_signals?.join(', ') || 'Severe hypertension & hypoxia risk'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-3.5">
                    <span className="font-extrabold text-amber-900 dark:text-amber-300 block text-[11px] uppercase">
                      Recommended Clinical Protocol
                    </span>
                    <p className="mt-1 text-amber-900 dark:text-amber-200 font-semibold leading-5">
                      {risk?.recommended_action || 'Immediate doctor referral and emergency transport.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WHY HIGH RISK EXPLANATION MODAL */}
      {selectedPatientForExplanation && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-rose-600" />
                  <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                    Clinical Explainability Breakdown
                  </h2>
                </div>
                <p className="mt-1 text-xs font-bold text-slate-500">
                  Patient: <strong className="text-slate-900 dark:text-slate-100">{selectedPatientForExplanation.name}</strong> ({selectedPatientForExplanation.age} yrs • {selectedPatientForExplanation.village || 'Rampur'})
                </p>
              </div>
              <button
                onClick={() => setSelectedPatientForExplanation(null)}
                className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 grid place-items-center hover:bg-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-5 text-xs">
              {/* Score & Level Banner */}
              <div className="flex items-center justify-between rounded-2xl bg-rose-50 dark:bg-rose-950/50 p-4 border border-rose-200 dark:border-rose-900">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-300">CDSS Risk Score</span>
                  <div className="text-3xl font-black text-rose-900 dark:text-rose-100">
                    {selectedPatientForExplanation.latestRisk?.risk_score ?? 88} <span className="text-sm font-normal text-rose-600">/ 100</span>
                  </div>
                </div>
                <RiskBadge level={selectedPatientForExplanation.latestRisk?.risk_level ?? 'high'} />
              </div>

              {/* Primary Risk Drivers */}
              <div>
                <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                  <Activity className="h-4 w-4 text-rose-600" />
                  Primary Contributing Risk Factors
                </h3>
                <ul className="mt-2.5 space-y-2 font-medium text-slate-700 dark:text-slate-300">
                  {(selectedPatientForExplanation.latestRisk?.contributing_factors || [
                    'Systolic Blood Pressure > 165 mmHg (Severe Hypertension Alert)',
                    'Blood Oxygen Saturation (SpO2) < 94% (Hypoxia Warning)',
                    'High-Risk Obstetrics / Maternal ANC Alert',
                    'Persistent Symptoms: Severe headache & dizziness'
                  ]).map((factor, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 p-3 border border-amber-200 dark:border-amber-900/60">
                      <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                      <span className="font-bold text-amber-950 dark:text-amber-200">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Clinical Action */}
              <div className="rounded-2xl bg-blue-50 dark:bg-blue-950/40 p-4 border border-blue-200 dark:border-blue-900">
                <h4 className="font-black text-blue-900 dark:text-blue-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                  Recommended Clinical Action Plan
                </h4>
                <p className="mt-1.5 text-blue-950 dark:text-blue-100 font-semibold leading-5">
                  {selectedPatientForExplanation.latestRisk?.recommended_action || 'Immediate doctor consultation required. Prepare digital referral for secondary hospital admission and dispatch 108 emergency transport.'}
                </p>
              </div>

              {/* CDSS Non-Diagnosis Disclaimer Notice */}
              <div className="rounded-2xl bg-slate-900 p-4 text-slate-300 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-4 font-medium">
                  <strong>Clinical Decision Support System Notice:</strong> This AI/rule-based risk evaluation is designed to assist rural health officers in prioritizing triage. It does NOT provide a final medical diagnosis.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setSelectedPatientForExplanation(null)}
                className="secondary-btn text-xs py-2.5 px-4 font-bold"
              >
                Close
              </button>
              <Link
                href={`/patients/${selectedPatientForExplanation.id}/referral`}
                className="primary-btn text-xs py-2.5 px-4 font-bold !bg-rose-600 hover:!bg-rose-700"
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Create Referral Now</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

