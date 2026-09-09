'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getReferrals, updateReferralStatus } from '@/lib/api/doctor';
import type { Referral, ReferralStatus } from '@/lib/types';
import { 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  Hospital, 
  Truck, 
  UserCheck, 
  XCircle, 
  ChevronRight,
  Filter,
  Plus
} from 'lucide-react';

const stages = [
  { label: '1. PHC Intake', key: 'intake' },
  { label: '2. Referral Created', key: 'pending' },
  { label: '3. Hospital Accepted', key: 'accepted' },
  { label: '4. In Transit', key: 'in_transit' },
  { label: '5. Patient Arrived', key: 'arrived' },
  { label: '6. Treatment Completed', key: 'completed' },
];

export default function ReferralsPage() {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getReferrals(filterStatus)
      .then((data) => {
        setReferrals(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterStatus]);

  const handleStatusChange = async (id: string, newStatus: ReferralStatus) => {
    setBusyId(id);
    try {
      await updateReferralStatus(id, newStatus);
      const updated = await getReferrals(filterStatus);
      setReferrals(updated);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3.5 py-1.5 text-xs font-extrabold text-violet-700">
            <ArrowUpRight className="h-4 w-4 text-violet-600" />
            <span>Digital Referral Management Portal</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Inter-Facility Referral Tracking
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Seamless referral lifecycle management from PHC to District Hospitals.
          </p>
        </div>

        <Link
          href="/patients"
          className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>New Patient Referral</span>
        </Link>
      </header>

      {/* Referral Lifecycle Diagram / Stepper Banner */}
      <div className="mb-8 rounded-2xl bg-white border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-4">
          Digital Referral Lifecycle Progress
        </h2>
        <div className="grid gap-2 grid-cols-2 md:grid-cols-6 text-center">
          {stages.map((st, idx) => (
            <div key={st.key} className="flex flex-col items-center rounded-xl bg-slate-50 border border-slate-200 p-3">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-violet-600 text-white font-extrabold text-xs">
                {idx + 1}
              </span>
              <span className="mt-2 text-xs font-bold text-slate-800">{st.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          {[
            { label: 'All Referrals', value: 'all' },
            { label: 'Pending Review', value: 'pending' },
            { label: 'Accepted', value: 'accepted' },
            { label: 'In Transit', value: 'in_transit' },
            { label: 'Arrived', value: 'arrived' },
            { label: 'Completed', value: 'completed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`py-2 px-3.5 rounded-xl transition ${
                filterStatus === tab.value
                  ? 'bg-violet-600 text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading label="Loading referral records…" />
      ) : !referrals.length ? (
        <div className="card py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <ArrowUpRight className="h-6 w-6" />
          </span>
          <p className="mt-3 text-base font-extrabold text-slate-800">No referrals found in this filter category</p>
          <p className="mt-1 text-xs text-slate-500">Select a different tab or create a new referral from the patient chart.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {referrals.map((r) => (
            <div key={r.id} className="card p-6 border-slate-200 hover:border-violet-300 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                      r.priority === 'urgent' ? 'bg-rose-100 text-rose-800' :
                      r.priority === 'priority' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {r.priority || 'ROUTINE'} PRIORITY
                    </span>

                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                      r.status === 'pending' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                      r.status === 'accepted' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                      r.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-slate-100 text-slate-800'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <h3 className="mt-2 text-lg font-black text-slate-900">{r.reason}</h3>
                  <p className="mt-1 text-xs text-slate-600 font-semibold">
                    Referred to: <strong className="text-slate-900">{r.referred_to_text || 'District Civil Hospital'}</strong>
                  </p>
                </div>

                {/* Status Action Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {r.status === 'pending' && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleStatusChange(r.id, 'accepted')}
                      className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      {busyId === r.id ? 'Updating…' : 'Accept Referral'}
                    </button>
                  )}

                  {r.status === 'accepted' && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleStatusChange(r.id, 'in_transit')}
                      className="rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white hover:bg-amber-700 transition flex items-center gap-1.5"
                    >
                      <Truck className="h-3.5 w-3.5" />
                      <span>Mark In Transit</span>
                    </button>
                  )}

                  {(r.status === 'accepted' || r.status === 'in_transit') && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleStatusChange(r.id, 'arrived')}
                      className="rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white hover:bg-violet-700 transition flex items-center gap-1.5"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Confirm Arrival</span>
                    </button>
                  )}

                  {r.status !== 'completed' && r.status !== 'cancelled' && (
                    <button
                      disabled={busyId === r.id}
                      onClick={() => handleStatusChange(r.id, 'completed')}
                      className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}

                  <Link
                    href={`/patients/${r.patient_id}`}
                    className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition"
                  >
                    Patient Details
                  </Link>
                </div>
              </div>

              {/* Detailed Notes */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs">
                {r.symptoms && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-extrabold text-slate-900 block text-[11px] uppercase">Symptoms Reported</span>
                    <p className="mt-1 text-slate-600 font-medium">{r.symptoms}</p>
                  </div>
                )}
                {r.clinical_notes && (
                  <div className="rounded-xl bg-slate-50 p-3">
                    <span className="font-extrabold text-slate-900 block text-[11px] uppercase">Clinical Notes</span>
                    <p className="mt-1 text-slate-600 font-medium">{r.clinical_notes}</p>
                  </div>
                )}
              </div>

              <div className="mt-3 text-[11px] font-semibold text-slate-400">
                Created on: {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
