'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { updateReferralStatus } from '@/lib/api/doctor';
import type { ReferralStatus } from '@/lib/types';

type Referral = { id: string; reason: string; status: ReferralStatus; created_at: string; referred_to_text: string | null; clinical_notes: string | null; patients?: { name: string; patient_code: string } | null };
const nextStatus: Partial<Record<ReferralStatus, ReferralStatus>> = { pending: 'accepted', accepted: 'in_transit', in_transit: 'arrived', arrived: 'treatment_started', treatment_started: 'completed' };

export default function Referrals() {
  const [items, setItems] = useState<Referral[]>([]);
  const [notice, setNotice] = useState('');
  const [show, setShow] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [hospital, setHospital] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [busyId, setBusyId] = useState('');

  async function load() {
    const { data, error } = await supabase.from('referrals').select('id,reason,status,created_at,referred_to_text,clinical_notes,patients(name,patient_code)').order('created_at', { ascending: false });
    if (error) setNotice('Unable to load authorised referrals.');
    else setItems((data || []) as unknown as Referral[]);
  }
  useEffect(() => { load(); }, []);

  async function create(event: React.FormEvent) {
    event.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setNotice('Authentication required to create a referral.'); return; }
    const { error } = await supabase.from('referrals').insert({ patient_id: patientId, referred_by: user.id, referred_to_text: hospital, reason, clinical_notes: notes, status: 'pending' });
    if (error) { setNotice(`Unable to create referral: ${error.message}`); return; }
    setShow(false); setNotice('Referral created and awaiting the receiving facility.'); setPatientId(''); setHospital(''); setReason(''); setNotes(''); await load();
  }

  async function advance(item: Referral) {
    const status = nextStatus[item.status];
    if (!status) return;
    setBusyId(item.id); setNotice('');
    try { await updateReferralStatus(item.id, status, { notes: `Status advanced to ${status.replaceAll('_', ' ')}` }); await load(); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Unable to update referral status.'); }
    finally { setBusyId(''); }
  }

  return <DashboardShell>
    <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">Care coordination</p><h1 className="mt-2 text-3xl font-black">Referrals</h1><p className="mt-1 text-sm text-slate-600">PHC to receiving facility: accepted, in transit, arrived, treatment and completion.</p></div><button className="primary-btn" onClick={() => setShow(true)}>Create referral</button></div>
    {notice && <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm font-semibold text-blue-800">{notice}</p>}
    <section className="card mt-6 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Patient</th><th className="p-4">Receiving facility</th><th className="p-4">Reason</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{items.map(item => <tr className="border-t" key={item.id}><td className="p-4 font-bold">{item.patients?.name || 'Authorised patient'}<small className="block text-slate-500">{item.patients?.patient_code}</small></td><td className="p-4">{item.referred_to_text || 'Not specified'}</td><td className="p-4">{item.reason}</td><td className="p-4"><span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700">{item.status.replaceAll('_', ' ')}</span></td><td className="p-4">{nextStatus[item.status] && <button disabled={busyId === item.id} onClick={() => advance(item)} className="text-xs font-bold text-blue-700 disabled:opacity-50">{busyId === item.id ? 'Saving...' : `Mark ${nextStatus[item.status]?.replaceAll('_', ' ')}`}</button>}</td></tr>)}</tbody></table></section>
    {show && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><form onSubmit={create} className="card w-full max-w-lg p-6"><h2 className="text-xl font-black">Create referral</h2><p className="mt-1 text-sm text-slate-600">Use the patient ID from the authorised patient record.</p><label className="mt-4 block text-sm font-bold">Patient database ID<input required value={patientId} onChange={event => setPatientId(event.target.value)} className="input mt-1" /></label><label className="mt-3 block text-sm font-bold">Receiving facility<input required value={hospital} onChange={event => setHospital(event.target.value)} className="input mt-1" /></label><label className="mt-3 block text-sm font-bold">Reason<textarea required value={reason} onChange={event => setReason(event.target.value)} className="input mt-1" /></label><label className="mt-3 block text-sm font-bold">Clinical notes<textarea value={notes} onChange={event => setNotes(event.target.value)} className="input mt-1" /></label><div className="mt-5 flex gap-3"><button className="primary-btn">Submit referral</button><button type="button" onClick={() => setShow(false)} className="secondary-btn">Cancel</button></div></form></div>}
  </DashboardShell>;
}
