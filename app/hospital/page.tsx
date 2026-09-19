'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { createFollowUp, updateReferralStatus } from '@/lib/api/doctor';
import type { ReferralStatus } from '@/lib/types';

type HospitalReferral = { id: string; patient_id: string; reason: string; status: ReferralStatus; referred_to_text: string | null; clinical_notes: string | null; treatment_summary: string | null; patient?: { name: string; patient_code: string } };
const nextStatus: Partial<Record<ReferralStatus, ReferralStatus>> = { pending: 'accepted', accepted: 'in_transit', in_transit: 'arrived', arrived: 'treatment_started', treatment_started: 'completed' };

export default function HospitalPage() {
  const [items, setItems] = useState<HospitalReferral[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [busyId, setBusyId] = useState('');
  const [treatment, setTreatment] = useState<Record<string, string>>({});

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.from('referrals').select('id,patient_id,reason,status,referred_to_text,clinical_notes,treatment_summary').order('created_at', { ascending: false });
    if (error) { setNotice(`Unable to load hospital referrals: ${error.message}`); setLoading(false); return; }
    const referrals = (data || []) as HospitalReferral[];
    const ids = [...new Set(referrals.map(item => item.patient_id))];
    const { data: patients } = ids.length ? await supabase.from('patients').select('id,name,patient_code').in('id', ids) : { data: [] };
    const patientMap = new Map((patients || []).map(patient => [patient.id, { name: patient.name, patient_code: patient.patient_code }]));
    setItems(referrals.map(item => ({ ...item, patient: patientMap.get(item.patient_id) })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function advance(item: HospitalReferral) {
    const status = nextStatus[item.status];
    if (!status) return;
    setBusyId(item.id); setNotice('');
    try {
      await updateReferralStatus(item.id, status, { treatmentSummary: treatment[item.id] || undefined, notes: `Hospital status updated to ${status.replaceAll('_', ' ')}` });
      if (status === 'completed') {
        const date = new Date(); date.setDate(date.getDate() + 7);
        await createFollowUp({ patientId: item.patient_id, referralId: item.id, scheduledDate: date.toISOString().slice(0, 10), notes: 'Post-treatment follow-up from receiving hospital' });
      }
      setNotice(status === 'completed' ? 'Treatment completed and follow-up scheduled.' : `Referral marked ${status.replaceAll('_', ' ')}.`);
      await load();
    } catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to update the referral.'); }
    finally { setBusyId(''); }
  }

  return <DashboardShell>
    <p className="eyebrow">Receiving facility</p>
    <h1 className="mt-2 text-3xl font-black">Hospital referral queue</h1>
    <p className="mt-1 text-sm text-slate-600">Only referrals authorised for this hospital facility are shown.</p>
    {notice && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{notice}</p>}
    <section className="card mt-6 overflow-x-auto">{loading ? <p className="p-8 text-center text-sm text-slate-500">Loading authorised referrals...</p> : items.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">No incoming referrals are available.</p> : <table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Patient</th><th className="p-4">Reason</th><th className="p-4">Status</th><th className="p-4">Treatment/status note</th><th className="p-4">Action</th></tr></thead><tbody>{items.map(item => <tr className="border-t" key={item.id}><td className="p-4 font-bold">{item.patient?.name || 'Authorised patient'}<small className="block text-slate-500">{item.patient?.patient_code}</small></td><td className="p-4">{item.reason}</td><td className="p-4 capitalize">{item.status.replaceAll('_', ' ')}</td><td className="p-4"><textarea value={treatment[item.id] ?? item.treatment_summary ?? ''} onChange={event => setTreatment(previous => ({ ...previous, [item.id]: event.target.value }))} className="input min-w-56" placeholder="Treatment or transport update" /></td><td className="p-4">{nextStatus[item.status] && <button disabled={busyId === item.id} onClick={() => advance(item)} className="text-xs font-bold text-blue-700 disabled:opacity-50">{busyId === item.id ? 'Saving...' : `Mark ${nextStatus[item.status]?.replaceAll('_', ' ')}`}</button>}</td></tr>)}</tbody></table>}</section>
  </DashboardShell>;
}
