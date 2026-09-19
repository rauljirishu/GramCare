'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { updateFollowUp } from '@/lib/api/doctor';
import { supabase } from '@/lib/supabase/client';
import { CheckCircle2 } from 'lucide-react';

type FollowUp = { id: string; scheduled_date: string; status: string; notes: string | null; patients?: { name: string; patient_code: string } | null };

export default function FollowUps() {
  const [rows, setRows] = useState<FollowUp[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    const { data, error: loadError } = await supabase.from('follow_ups').select('id,scheduled_date,status,notes,patients(name,patient_code)').order('scheduled_date');
    if (loadError) setError('Unable to load authorised follow-ups.');
    else setRows((data || []) as unknown as FollowUp[]);
  }

  useEffect(() => { load(); }, []);

  async function complete(row: FollowUp) {
    setBusyId(row.id);
    setError('');
    try {
      await updateFollowUp(row.id, 'completed', row.notes || 'Completed by authorised care worker');
      await load();
    } catch (completionError) {
      setError(completionError instanceof Error ? completionError.message : 'Unable to complete follow-up.');
    } finally {
      setBusyId('');
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const due = rows.filter(row => row.scheduled_date <= today && row.status !== 'completed').length;

  return <DashboardShell>
    <p className="eyebrow">Care continuity</p>
    <h1 className="mt-2 text-3xl font-black">Follow-ups</h1>
    <p className="mt-1 text-sm text-slate-600">Upcoming, due, completed and missed follow-up care.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
      <div className="card p-5"><p className="text-xs font-bold uppercase text-slate-500">Follow-ups due today</p><p className="mt-2 text-3xl font-black">{due}</p></div>
      <div className="card p-5"><p className="text-xs font-bold uppercase text-slate-500">Upcoming follow-ups</p><p className="mt-2 text-3xl font-black">{rows.filter(row => row.scheduled_date > today && row.status !== 'completed').length}</p></div>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
    <section className="card mt-5 overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Patient</th><th className="p-4">Date</th><th className="p-4">Reason</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead>
        <tbody>{rows.map(row => <tr className="border-t" key={row.id}>
          <td className="p-4 font-bold">{row.patients?.name || 'Authorised patient'}<small className="block text-slate-500">{row.patients?.patient_code}</small></td>
          <td className="p-4">{row.scheduled_date}</td>
          <td className="p-4">{row.notes || 'Follow-up care'}</td>
          <td className="p-4"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{row.status}</span></td>
          <td className="p-4">{row.status !== 'completed' && <button disabled={busyId === row.id} onClick={() => complete(row)} className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />{busyId === row.id ? 'Saving...' : 'Complete'}</button>}</td>
        </tr>)}</tbody>
      </table>
    </section>
  </DashboardShell>;
}
