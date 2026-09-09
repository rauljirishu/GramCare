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
  UserCheck
} from 'lucide-react';

export default function HighRiskPage() {
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3.5 py-1.5 text-xs font-extrabold text-rose-800">
            <Flame className="h-4 w-4 text-rose-600 animate-pulse" />
            <span>High-Risk Triage Workspace</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Critical & High-Risk Triage Queue
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Prioritized clinical queue of patients requiring urgent doctor consultation or hospital referral.
          </p>
        </div>
      </header>

      {/* AI Disclaimer */}
      <div className="mb-6 rounded-2xl bg-rose-950 p-4 text-white shadow-sm border border-rose-800">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-rose-300 shrink-0 mt-0.5" />
          <p className="text-xs leading-5 text-rose-100 font-medium">{AI_DISCLAIMER_TEXT}</p>
        </div>
      </div>

      {loading ? (
        <Loading label="Analyzing triage risk scores…" />
      ) : !patients.length ? (
        <div className="card py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 font-bold">
            <UserCheck className="h-6 w-6" />
          </span>
          <p className="mt-3 text-base font-extrabold text-slate-800">No Critical or High-Risk Cases Currently</p>
          <p className="mt-1 text-xs text-slate-500">All registered patients have baseline low/medium risk scores.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {patients.map((p) => {
            const risk = p.latestRisk;
            return (
              <div key={p.id} className="card p-6 border-slate-200 hover:border-rose-300 transition">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-4">
                    <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-100 text-rose-700 font-black text-xl">
                      {p.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-black text-slate-900">{p.name}</h3>
                        <RiskBadge level={risk?.risk_level ?? 'high'} />
                      </div>
                      <p className="mt-1 text-xs text-slate-600 font-semibold flex items-center gap-2">
                        <span>{p.age} yrs • <span className="capitalize">{p.gender}</span></span>
                        <span>•</span>
                        <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {p.village || 'Rampur Gram Panchayat'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-[10px] font-black uppercase text-slate-400 block">AI Risk Score</span>
                      <span className="text-3xl font-black text-rose-700">{risk?.risk_score ?? 85}<span className="text-xs text-slate-400 font-semibold"> / 100</span></span>
                    </div>

                    <Link
                      href={`/patients/${p.id}/referral`}
                      className="primary-btn text-xs py-2.5 px-4 font-bold !bg-rose-600 hover:!bg-rose-700"
                    >
                      <ArrowUpRight className="h-4 w-4" />
                      <span>Create Emergency Referral</span>
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

                {/* Warning Signals & Clinical Guidance */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-xl bg-rose-50 border border-rose-100 p-3.5">
                    <span className="font-extrabold text-rose-900 block text-[11px] uppercase flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                      Warning Signals & Symptoms
                    </span>
                    <p className="mt-1 text-rose-800 font-bold leading-5">
                      {risk?.warning_signals?.join(', ') || 'Severe hypertension & hypoxia risk'}
                    </p>
                  </div>

                  <div className="rounded-xl bg-amber-50 border border-amber-100 p-3.5">
                    <span className="font-extrabold text-amber-900 block text-[11px] uppercase">
                      Recommended Action
                    </span>
                    <p className="mt-1 text-amber-900 font-semibold leading-5">
                      {risk?.recommended_action || 'Immediate doctor referral and emergency transport.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardShell>
  );
}
