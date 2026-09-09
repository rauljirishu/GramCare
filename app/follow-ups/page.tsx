'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getFollowUps, updateFollowUp } from '@/lib/api/doctor';
import type { FollowUp, FollowUpStatus } from '@/lib/types';
import { 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  ChevronRight, 
  UserCheck, 
  FileText
} from 'lucide-react';

export default function FollowUpsPage() {
  const [items, setItems] = useState<FollowUp[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [modalItem, setModalItem] = useState<FollowUp | null>(null);
  const [outcomeNotes, setOutcomeNotes] = useState('');

  useEffect(() => {
    setLoading(true);
    getFollowUps(filterStatus)
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [filterStatus]);

  const handleMarkComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalItem) return;
    setBusyId(modalItem.id);
    try {
      await updateFollowUp(modalItem.id, 'completed', outcomeNotes);
      const updated = await getFollowUps(filterStatus);
      setItems(updated);
      setModalItem(null);
      setOutcomeNotes('');
    } finally {
      setBusyId(null);
    }
  };

  const missedCount = items.filter(i => i.status === 'missed').length;

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3.5 py-1.5 text-xs font-extrabold text-emerald-800">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>Clinical Continuity & Follow-Up Portal</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Scheduled Patient Follow-ups
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Track upcoming visits, scheduled checkups, and resolve missed follow-up tasks.
          </p>
        </div>
      </header>

      {missedCount > 0 && (
        <div className="mb-6 flex items-center justify-between gap-4 rounded-2xl bg-rose-50 border border-rose-200 p-4 text-rose-800">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600" />
            <span className="text-xs font-bold">
              {missedCount} Missed Follow-up{missedCount > 1 ? 's' : ''} require immediate field worker intervention.
            </span>
          </div>
          <button
            onClick={() => setFilterStatus('missed')}
            className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 transition"
          >
            View Missed
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2 text-xs font-extrabold">
          {[
            { label: 'All Follow-ups', value: 'all' },
            { label: 'Scheduled / Due', value: 'scheduled' },
            { label: 'Upcoming', value: 'upcoming' },
            { label: 'Missed', value: 'missed' },
            { label: 'Completed', value: 'completed' },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilterStatus(tab.value)}
              className={`py-2 px-3.5 rounded-xl transition ${
                filterStatus === tab.value
                  ? 'bg-emerald-600 text-white shadow-sm font-black'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loading label="Loading follow-up tasks…" />
      ) : !items.length ? (
        <div className="card py-12 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
          </span>
          <p className="mt-3 text-base font-extrabold text-slate-800">No follow-ups in this filter category</p>
          <p className="mt-1 text-xs text-slate-500">All scheduled patient checkups are up to date.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card p-6 border-slate-200 hover:border-emerald-300 transition">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                      item.status === 'completed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                      item.status === 'missed' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-blue-100 text-blue-800 border border-blue-200'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      Scheduled Date: <strong className="text-slate-900">{item.scheduled_date}</strong>
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-extrabold text-slate-800">
                    {item.notes || 'Routine post-referral or ANC follow-up checkup.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {item.status !== 'completed' && (
                    <button
                      onClick={() => {
                        setModalItem(item);
                        setOutcomeNotes(item.notes || '');
                      }}
                      className="rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-700 transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Mark Complete</span>
                    </button>
                  )}

                  <Link
                    href={`/patients/${item.patient_id}`}
                    className="rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition flex items-center gap-1"
                  >
                    <span>View Patient Chart</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              {item.updated_at && (
                <div className="mt-3 text-[11px] font-semibold text-slate-400">
                  Last Updated: {new Date(item.updated_at).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Outcome Modal */}
      {modalItem && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              Complete Follow-Up Record
            </h2>
            <p className="mt-1 text-xs text-slate-500 font-medium">Record clinical outcome notes for this patient visit.</p>

            <form onSubmit={handleMarkComplete} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Clinical Outcome & Notes *</label>
                <textarea
                  required
                  rows={3}
                  value={outcomeNotes}
                  onChange={e => setOutcomeNotes(e.target.value)}
                  placeholder="Record patient vitals improvement, medication compliance, or clinical observations..."
                  className="input mt-1 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalItem(null)}
                  className="secondary-btn text-xs py-2"
                >
                  Cancel
                </button>
                <button
                  disabled={busyId === modalItem.id}
                  type="submit"
                  className="primary-btn text-xs py-2 !bg-emerald-600 hover:!bg-emerald-700"
                >
                  {busyId === modalItem.id ? 'Saving…' : 'Save & Complete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
