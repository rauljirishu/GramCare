'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from './dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { currentRole } from '@/lib/auth';
import { CalendarDays, CheckCircle2, ClipboardList, HeartPulse, MapPin, Mic, Plus, Search, ShieldCheck, WifiOff } from 'lucide-react';

type RequestRow = { id: string; request_type: string; title: string; details: string; priority: string; status: string; created_at: string; facilities?: { name: string } | null };
const titles: Record<string, { title: string; subtitle: string; icon: typeof ClipboardList; requestType: string }> = {
  'maternal-care': { title: 'Maternal Care', subtitle: 'Pregnancy milestones, nutrition guidance and field-worker reminders.', icon: HeartPulse, requestType: 'other' },
  'health-camps': { title: 'Health Camps', subtitle: 'Request and track awareness, nutrition, sanitation and professional training camps.', icon: CalendarDays, requestType: 'health_camp' },
  outbreaks: { title: 'Outbreak Monitoring', subtitle: 'Report flu, dengue, malaria and other area situations for coordinated support.', icon: ClipboardList, requestType: 'outbreak_support' },
  resources: { title: 'Resource Requests', subtitle: 'Request medicines, equipment, kits and staffing support from central authority.', icon: ClipboardList, requestType: 'medicine' },
  workers: { title: 'Worker Management', subtitle: 'Coordinate authorised field healthcare teams.', icon: HeartPulse, requestType: 'staffing' },
  'health-education': { title: 'Health Education', subtitle: 'Short, mobile-friendly guidance that can be watched when a physical camp is missed.', icon: HeartPulse, requestType: 'other' },
  reports: { title: 'Reports', subtitle: 'Privacy-conscious aggregate reporting for authorised planning.', icon: ClipboardList, requestType: 'other' },
  map: { title: 'Nearby Healthcare Map', subtitle: 'Use device location or manual search to find PHCs, hospitals and camps.', icon: MapPin, requestType: 'other' },
};

export function ModulePage({ module }: { module: string }) {
  const data = titles[module] || titles['health-education'];
  const Icon = data.icon;
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [role, setRole] = useState('');
  const [notice, setNotice] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [requestType, setRequestType] = useState(data.requestType);
  const [priority, setPriority] = useState('normal');
  const [saving, setSaving] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [search, setSearch] = useState('');
  const [guide, setGuide] = useState<{ title: string; body: string } | null>(null);

  async function load() {
    const foundRole = await currentRole();
    setRole(foundRole || '');
    const { data: requests, error } = await supabase.from('support_requests').select('id,request_type,title,details,priority,status,created_at,facilities(name)').eq('request_type', data.requestType).order('created_at', { ascending: false });
    if (error) setNotice('Unable to load authorised requests.');
    else setRows((requests || []) as unknown as RequestRow[]);
  }

  useEffect(() => { load(); }, [module]);

  function startVoice() {
    type Recognition = { lang: string; continuous: boolean; interimResults: boolean; onresult: (event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void; onerror: () => void; onend: () => void; start: () => void };
    type RecognitionConstructor = new () => Recognition;
    const speechWindow = window as Window & { SpeechRecognition?: RecognitionConstructor; webkitSpeechRecognition?: RecognitionConstructor };
    const SpeechRecognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
    if (!SpeechRecognition) { setNotice('Voice typing is not supported in this browser. You can continue with manual entry.'); return; }
    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = event => setDetails(previous => `${previous}${previous ? ' ' : ''}${event.results[0][0].transcript}`);
    recognition.onerror = () => { setVoiceActive(false); setNotice('Voice input was not captured. Please review or enter the information manually.'); };
    recognition.onend = () => setVoiceActive(false);
    setVoiceActive(true);
    recognition.start();
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setNotice('');
    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('users').select('facility_id,role').eq('id', user?.id || '').single();
    if (!user || !profile?.facility_id || !['phc_head', 'phc_worker'].includes(profile.role)) { setNotice('Only an authorised PHC Head or PHC Worker can submit a request.'); setSaving(false); return; }
    const { error } = await supabase.from('support_requests').insert({ requested_by: user.id, facility_id: profile.facility_id, request_type: requestType, title: title.trim(), details: details.trim(), priority });
    setSaving(false);
    if (error) { setNotice(`Unable to submit request: ${error.message}`); return; }
    setTitle(''); setDetails(''); setPriority('normal'); setShowForm(false); setNotice('Request submitted to central authority for review.'); await load();
  }

  async function updateStatus(row: RequestRow, status: string) {
    const { error } = await supabase.from('support_requests').update({ status, resolution_note: status === 'rejected' ? 'Request reviewed by central authority' : null }).eq('id', row.id);
    if (error) setNotice(`Unable to update request: ${error.message}`); else { setNotice('Request status updated.'); await load(); }
  }

  const canRequest = ['worker', 'head'].includes(role) && ['resources', 'health-camps', 'outbreaks'].includes(module);
  const canReview = role === 'central';
  const isMap = module === 'map';
  const visibleRows = rows.filter(row => `${row.title} ${row.details} ${row.priority} ${row.status}`.toLowerCase().includes(search.toLowerCase()));

  return <DashboardShell>
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow">GramCare workspace</p><h1 className="mt-2 text-3xl font-black text-slate-900">{data.title}</h1><p className="mt-1 text-slate-600">{data.subtitle}</p></div>{canRequest && <button className="primary-btn" onClick={() => setShowForm(true)}><Plus className="h-4 w-4" />{module === 'resources' ? 'New resource request' : module === 'health-camps' ? 'Request a camp' : 'Report situation'}</button>}</div>
    <div className="mb-5 flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-800"><ShieldCheck className="h-4 w-4" />Requests contain PHC and requester identity; patient data remains protected by separate care RLS.</div>
    {notice && <div role="status" className="mb-5 rounded-xl bg-blue-50 p-3 text-sm font-bold text-blue-800">{notice}</div>}
    {isMap && <button className="secondary-btn mb-5" onClick={() => navigator.geolocation?.getCurrentPosition(() => setNotice('Location permission granted. Nearby care can be selected using your current location.'), () => setNotice('Location permission was denied. Search manually; GPS is optional.'))}><MapPin className="h-4 w-4" />Use my location</button>}
    {module === 'maternal-care' && <section className="card mb-5 p-5"><div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black">Voice data entry</h2><p className="text-sm text-slate-500">Speak, review, then confirm before saving.</p></div><button className="secondary-btn" onClick={startVoice}><Mic className="h-4 w-4" />{voiceActive ? 'Listening...' : 'Start voice entry'}</button></div></section>}
    {module === 'health-education' && <section className="grid gap-4 md:grid-cols-3"><article className="card p-5"><h2 className="font-black">Pregnancy nutrition</h2><p className="mt-2 text-sm text-slate-600">Short guidance for food, iron, hydration and warning signs.</p><button className="secondary-btn mt-4" onClick={() => setGuide({ title: 'Pregnancy nutrition', body: 'Choose iron-rich foods, take supplements exactly as advised by the PHC, drink safe water, and contact the PHC urgently for bleeding, severe headache, swelling, fever, or reduced fetal movement.' })}>Watch guide</button></article><article className="card p-5"><h2 className="font-black">Dengue prevention</h2><p className="mt-2 text-sm text-slate-600">Practical household prevention when a camp is missed.</p><button className="secondary-btn mt-4" onClick={() => setGuide({ title: 'Dengue prevention', body: 'Remove standing water, cover storage containers, use nets or repellents, and seek clinical advice for persistent fever, bleeding, severe abdominal pain, or unusual sleepiness.' })}>Watch guide</button></article><article className="card p-5"><h2 className="font-black">Worker training notes</h2><p className="mt-2 text-sm text-slate-600">Review key points and keep notes for the next home visit.</p><button className="secondary-btn mt-4" onClick={() => setGuide({ title: 'Worker training notes', body: 'During a home visit, confirm the patient identity, record observations and vitals, review the care plan, explain warning signs, and schedule the next follow-up before leaving.' })}>Open notes</button></article></section>}
    <section className="card mt-5 overflow-hidden"><div className="border-b border-slate-100 p-5"><div className="relative max-w-sm"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><input value={search} onChange={event => setSearch(event.target.value)} className="input py-2 text-sm" style={{ paddingLeft: '2.4rem' }} placeholder="Search requests" /></div></div>{visibleRows.length ? <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="p-4">Request</th><th className="p-4">PHC</th><th className="p-4">Priority</th><th className="p-4">Status</th><th className="p-4">Action</th></tr></thead><tbody>{visibleRows.map(row => <tr className="border-t border-slate-100" key={row.id}><td className="p-4"><b>{row.title}</b><span className="mt-1 block max-w-md text-xs text-slate-500">{row.details}</span></td><td className="p-4">{row.facilities?.name || 'Authorised PHC'}</td><td className="p-4 capitalize">{row.priority}</td><td className="p-4"><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">{row.status.replaceAll('_', ' ')}</span></td><td className="p-4">{canReview && row.status !== 'fulfilled' && <button onClick={() => updateStatus(row, row.status === 'requested' ? 'under_review' : 'fulfilled')} className="inline-flex items-center gap-1 text-xs font-bold text-blue-700"><CheckCircle2 className="h-4 w-4" />{row.status === 'requested' ? 'Review' : 'Fulfil'}</button>}</td></tr>)}</tbody></table></div> : <div className="p-8 text-center text-sm text-slate-500">{search ? 'No matching requests.' : 'No saved requests for this workspace yet.'}</div>}</section>
    {guide && <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4"><section role="dialog" aria-modal="true" className="card w-full max-w-lg p-6"><div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Health guidance</p><h2 className="mt-2 text-xl font-black">{guide.title}</h2></div><button aria-label="Close guide" onClick={() => setGuide(null)} className="text-sm font-bold text-slate-500">Close</button></div><p className="mt-5 text-sm leading-7 text-slate-700">{guide.body}</p><button className="primary-btn mt-6" onClick={() => setGuide(null)}>Done</button></section></div>}
    {showForm && <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4"><form onSubmit={submit} className="card mx-auto my-10 w-full max-w-xl p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="text-xl font-black">Request central support</h2><p className="mt-1 text-sm text-slate-600">Include the affected area, quantity and timing.</p></div><button type="button" onClick={() => setShowForm(false)} className="text-sm font-bold text-slate-500">Close</button></div><div className="mt-5 grid gap-4"><label className="text-sm font-bold">Request type<select value={requestType} onChange={event => setRequestType(event.target.value)} className="input mt-1"><option value="staffing">Staffing</option><option value="medicine">Medicines</option><option value="equipment">Equipment</option><option value="kit">Kits and supplies</option><option value="health_camp">Health camp</option><option value="outbreak_support">Outbreak support</option><option value="other">Other</option></select></label><label className="text-sm font-bold">Title<input required minLength={3} maxLength={160} value={title} onChange={event => setTitle(event.target.value)} className="input mt-1" /></label><label className="text-sm font-bold">Details<textarea required minLength={3} maxLength={4000} value={details} onChange={event => setDetails(event.target.value)} className="input mt-1 min-h-28" /><button type="button" onClick={startVoice} className="secondary-btn mt-2"><Mic className="h-4 w-4" />{voiceActive ? 'Listening...' : 'Dictate details'}</button></label><label className="text-sm font-bold">Priority<select value={priority} onChange={event => setPriority(event.target.value)} className="input mt-1"><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></label></div><button disabled={saving} className="primary-btn mt-6">{saving ? 'Submitting...' : 'Submit support request'}</button></form></div>}
    <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><WifiOff className="h-4 w-4" />Offline field entries remain local until secure synchronization is available.</p>
  </DashboardShell>;
}
