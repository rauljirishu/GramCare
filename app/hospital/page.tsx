'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { RiskBadge } from '@/components/risk-badge';
import { getHospitalReferrals, updateReferralStatus } from '@/lib/api/doctor';
import type { Referral, ReferralStatus } from '@/lib/types';
import { useTranslation } from '@/lib/i18n/use-translation';
import { 
  Building2, 
  CheckCircle2, 
  XCircle, 
  Ambulance, 
  Clock, 
  Stethoscope, 
  AlertTriangle, 
  Search, 
  Filter, 
  UserCheck, 
  Sparkles,
  ArrowRight,
  ShieldAlert,
  FileText
} from 'lucide-react';

export default function HospitalDashboardPage() {
  const { t } = useTranslation();
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReferral, setSelectedReferral] = useState<Referral | null>(null);
  const [actionType, setActionType] = useState<'accept' | 'reject' | 'transit' | 'arrived' | 'treatment' | 'complete' | null>(null);
  
  // Modal Form state
  const [noteInput, setNoteInput] = useState('');
  const [ambulanceInput, setAmbulanceInput] = useState('108-MH-45-8890');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    const data = await getHospitalReferrals();
    setReferrals(data);
    setLoading(false);
  }

  async function handleExecuteAction() {
    if (!selectedReferral || !actionType) return;
    setBusy(true);

    let newStatus: ReferralStatus = selectedReferral.status;
    if (actionType === 'accept') newStatus = 'accepted';
    if (actionType === 'reject') newStatus = 'rejected';
    if (actionType === 'transit') newStatus = 'in_transit';
    if (actionType === 'arrived') newStatus = 'arrived';
    if (actionType === 'treatment') newStatus = 'treatment_started';
    if (actionType === 'complete') newStatus = 'completed';

    await updateReferralStatus(selectedReferral.id, newStatus, {
      notes: noteInput,
      ambulance: actionType === 'transit' ? ambulanceInput : undefined,
      rejectionReason: actionType === 'reject' ? noteInput : undefined,
      treatmentSummary: actionType === 'complete' ? noteInput : undefined
    });

    setBusy(false);
    setSelectedReferral(null);
    setActionType(null);
    setNoteInput('');
    await loadData();
  }

  const filtered = referrals.filter(r => {
    const pName = r.patient?.name || '';
    const village = r.patient?.village || '';
    const matchesSearch = pName.toLowerCase().includes(search.toLowerCase()) || village.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const incomingCount = referrals.filter(r => r.status === 'pending').length;
  const urgentCount = referrals.filter(r => r.priority === 'urgent' || r.status === 'pending').length;
  const acceptedCount = referrals.filter(r => r.status === 'accepted').length;
  const transitCount = referrals.filter(r => r.status === 'in_transit').length;
  const arrivedCount = referrals.filter(r => r.status === 'arrived').length;
  const treatmentCount = referrals.filter(r => r.status === 'treatment_started').length;
  const completedCount = referrals.filter(r => r.status === 'completed').length;

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-7 w-7 text-blue-600" />
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 sm:text-3xl">
                {t('hospitalPortal')}
              </h1>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
              District & Secondary Referral Hospital triage center — real-time intake and treatment lifecycle.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-4 py-1.5 text-xs font-black text-emerald-700 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Hospital Intake Online
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
          <StatCard title="Incoming" count={incomingCount} icon={<Clock className="h-5 w-5 text-amber-500" />} color="bg-amber-50 border-amber-200 text-amber-900" />
          <StatCard title="Urgent" count={urgentCount} icon={<AlertTriangle className="h-5 w-5 text-rose-600" />} color="bg-rose-50 border-rose-200 text-rose-900" />
          <StatCard title="Accepted" count={acceptedCount} icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />} color="bg-blue-50 border-blue-200 text-blue-900" />
          <StatCard title="In Transit" count={transitCount} icon={<Ambulance className="h-5 w-5 text-indigo-600" />} color="bg-indigo-50 border-indigo-200 text-indigo-900" />
          <StatCard title="Arrived" count={arrivedCount} icon={<UserCheck className="h-5 w-5 text-violet-600" />} color="bg-violet-50 border-violet-200 text-violet-900" />
          <StatCard title="In Treatment" count={treatmentCount} icon={<Stethoscope className="h-5 w-5 text-emerald-600" />} color="bg-emerald-50 border-emerald-200 text-emerald-900" />
          <StatCard title="Completed" count={completedCount} icon={<CheckCircle2 className="h-5 w-5 text-slate-600" />} color="bg-slate-100 border-slate-200 text-slate-900" />
        </div>

        {/* Filter Controls Bar */}
        <div className="card p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search patient name or village…"
              className="input pl-10 py-2 text-xs"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-slate-400 shrink-0" />
            {[
              { id: 'all', label: 'All Referrals' },
              { id: 'pending', label: 'Pending' },
              { id: 'accepted', label: 'Accepted' },
              { id: 'in_transit', label: 'In Transit' },
              { id: 'arrived', label: 'Arrived' },
              { id: 'treatment_started', label: 'In Treatment' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Referral List */}
        {loading ? (
          <Loading label="Loading hospital referral queue..." />
        ) : filtered.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-slate-300" />
            <h3 className="mt-4 text-lg font-black text-slate-800 dark:text-slate-200">No Referrals Found</h3>
            <p className="mt-1 text-sm text-slate-500">There are no referrals matching your filter criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(ref => (
              <div key={ref.id} className="card p-5 hover:border-blue-300 transition-all border-slate-200 dark:border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-black text-lg text-slate-900 dark:text-slate-100">
                        {ref.patient?.name || 'Patient'}
                      </span>
                      <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {ref.patient?.age} yrs • {ref.patient?.gender}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        📍 {ref.patient?.village || 'Rampur'} PHC Network
                      </span>
                      <StatusBadge status={ref.status} />
                    </div>

                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                      <strong>Referral Reason:</strong> {ref.reason}
                    </p>

                    {ref.clinical_notes && (
                      <p className="text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <strong>Clinical Notes:</strong> {ref.clinical_notes}
                      </p>
                    )}

                    {ref.ambulance_assigned && (
                      <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                        <Ambulance className="h-4 w-4" />
                        <span>Transport Assigned: {ref.ambulance_assigned}</span>
                      </p>
                    )}
                  </div>

                  {/* Action Buttons depending on status */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {ref.status === 'pending' && (
                      <>
                        <button
                          onClick={() => { setSelectedReferral(ref); setActionType('accept'); }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-blue-700 transition"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => { setSelectedReferral(ref); setActionType('reject'); }}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-extrabold text-rose-700 hover:bg-rose-100 transition"
                        >
                          <XCircle className="h-4 w-4" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {ref.status === 'accepted' && (
                      <button
                        onClick={() => { setSelectedReferral(ref); setActionType('transit'); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-indigo-700 transition"
                      >
                        <Ambulance className="h-4 w-4" />
                        <span>Dispatch Ambulance</span>
                      </button>
                    )}

                    {(ref.status === 'accepted' || ref.status === 'in_transit') && (
                      <button
                        onClick={() => { setSelectedReferral(ref); setActionType('arrived'); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-violet-700 transition"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Mark Arrived</span>
                      </button>
                    )}

                    {ref.status === 'arrived' && (
                      <button
                        onClick={() => { setSelectedReferral(ref); setActionType('treatment'); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-extrabold text-white hover:bg-emerald-700 transition"
                      >
                        <Stethoscope className="h-4 w-4" />
                        <span>Start Treatment</span>
                      </button>
                    )}

                    {ref.status === 'treatment_started' && (
                      <button
                        onClick={() => { setSelectedReferral(ref); setActionType('complete'); }}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-extrabold transition"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Complete & Discharge</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Hospital Action Modal */}
        {selectedReferral && actionType && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md card p-6 shadow-2xl border-slate-200">
              <h3 className="text-xl font-black text-slate-900 capitalize">
                {actionType === 'accept' && 'Accept Referral'}
                {actionType === 'reject' && 'Reject Referral'}
                {actionType === 'transit' && 'Assign Ambulance / In Transit'}
                {actionType === 'arrived' && 'Mark Patient Arrived'}
                {actionType === 'treatment' && 'Start Clinical Treatment'}
                {actionType === 'complete' && 'Complete & Discharge'}
              </h3>
              <p className="mt-1 text-xs text-slate-600">
                Updating status for <strong>{selectedReferral.patient?.name}</strong>.
              </p>

              {actionType === 'transit' && (
                <label className="mt-4 block text-xs font-extrabold text-slate-800">
                  Ambulance / Vehicle Unit Number
                  <input
                    type="text"
                    value={ambulanceInput}
                    onChange={e => setAmbulanceInput(e.target.value)}
                    className="input mt-1 text-xs"
                    placeholder="e.g. 108 Ambulance MH-45-8890"
                  />
                </label>
              )}

              <label className="mt-4 block text-xs font-extrabold text-slate-800">
                {actionType === 'reject' ? 'Rejection Reason (Required)' : actionType === 'complete' ? 'Discharge Summary' : 'Hospital Clinical Notes (Optional)'}
                <textarea
                  required={actionType === 'reject'}
                  value={noteInput}
                  onChange={e => setNoteInput(e.target.value)}
                  rows={3}
                  className="input mt-1 text-xs"
                  placeholder="Enter details..."
                />
              </label>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedReferral(null); setActionType(null); }}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleExecuteAction}
                  className="primary-btn px-4 py-2 text-xs font-bold"
                >
                  {busy ? 'Saving...' : 'Confirm Status Change'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}

function StatCard({ title, count, icon, color }: { title: string; count: number; icon: React.ReactNode; color: string }) {
  return (
    <div className={`rounded-2xl p-4 border ${color} transition shadow-sm`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold tracking-wide uppercase opacity-80">{title}</span>
        {icon}
      </div>
      <p className="mt-2 text-2xl font-black">{count}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ReferralStatus }) {
  const map: Record<ReferralStatus, { label: string; style: string }> = {
    pending: { label: 'Pending', style: 'bg-amber-100 text-amber-800 border-amber-300' },
    accepted: { label: 'Accepted', style: 'bg-blue-100 text-blue-800 border-blue-300' },
    in_transit: { label: 'In Transit (108)', style: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    arrived: { label: 'Arrived', style: 'bg-violet-100 text-violet-800 border-violet-300' },
    treatment_started: { label: 'In Treatment', style: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
    completed: { label: 'Completed', style: 'bg-slate-200 text-slate-800 border-slate-400' },
    cancelled: { label: 'Cancelled', style: 'bg-slate-100 text-slate-600 border-slate-300' },
    rejected: { label: 'Rejected', style: 'bg-rose-100 text-rose-800 border-rose-300' }
  };
  const conf = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${conf.style}`}>
      {conf.label}
    </span>
  );
}
