'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { currentRole } from '@/lib/auth';
import { GramRole } from '@/lib/grams-data';
import { supabase } from '@/lib/supabase/client';
import { 
  ShieldCheck, 
  Users, 
  Building2, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  Clock, 
  HeartPulse, 
  Send, 
  MessageSquare, 
  HelpCircle, 
  Pill, 
  Calendar, 
  MapPin, 
  Phone, 
  Stethoscope,
  ArrowRight,
  FileText,
  UserPlus,
  X
} from 'lucide-react';

type SupportRequest = {
  id: string;
  request_type: string;
  title: string;
  details: string;
  priority: string;
  status: string;
  resolution_note: string | null;
  created_at: string;
  facilities?: { name: string } | null;
};

type PatientTreatmentRow = {
  id: string;
  patient_code: string;
  name: string;
  age: number;
  gender: string;
  village: string | null;
  current_medications: string[] | null;
  existing_conditions: string[] | null;
  next_follow_up_date: string | null;
  notes: string | null;
};

export default function Dashboard() {
  const [role, setRole] = useState<GramRole>('central');
  const [userProfile, setUserProfile] = useState<{ id: string; name: string; role: string; facility_id: string | null } | null>(null);

  useEffect(() => {
    currentRole().then(value => {
      if (value === 'patient') {
        window.location.href = '/patient-dashboard';
      } else if (value) {
        setRole(value);
      }
    });

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        supabase.from('users').select('id,name,role,facility_id').eq('id', user.id).single().then(({ data }) => {
          if (data) setUserProfile(data);
        });
      }
    });
  }, []);

  return (
    <DashboardShell>
      {role === 'central' && <CentralAuthorityDashboard profile={userProfile} />}
      {role === 'head' && <PhcHeadDashboard profile={userProfile} />}
      {role === 'worker' && <PhcWorkerDashboard profile={userProfile} />}
      {role === 'doctor' && <PhcHeadDashboard profile={userProfile} />}
      {role === 'hospital' && <CentralAuthorityDashboard profile={userProfile} />}
    </DashboardShell>
  );
}

{/* ========================================================================= */}
{/* 1. CENTRAL AUTHORITY DASHBOARD (Full System Access & Oversight)            */}
{/* ========================================================================= */}
function CentralAuthorityDashboard({ profile }: { profile: any }) {
  const [stats, setStats] = useState({ totalPatients: 0, totalFacilities: 0, highRisk: 0, pendingRequests: 0 });
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');

  async function loadData() {
    const [pts, facs, risks, reqs] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('facilities').select('id', { count: 'exact', head: true }),
      supabase.from('risk_assessments').select('id', { count: 'exact', head: true }).in('risk_level', ['high', 'critical']),
      supabase.from('support_requests').select('id,request_type,title,details,priority,status,resolution_note,created_at,facilities(name)').order('created_at', { ascending: false })
    ]);

    setStats({
      totalPatients: pts.count || 0,
      totalFacilities: facs.count || 0,
      highRisk: risks.count || 0,
      pendingRequests: (reqs.data || []).filter(r => r.status === 'requested' || r.status === 'under_review').length
    });

    setRequests((reqs.data || []) as unknown as SupportRequest[]);
  }

  useEffect(() => { loadData(); }, []);

  async function updateDemandStatus(reqId: string, status: string) {
    const note = prompt('Enter resolution note for PHC Head/Worker:', 'Reviewed and approved by Central Authority.');
    if (note === null) return;
    const { error } = await supabase.from('support_requests').update({ status, resolution_note: note }).eq('id', reqId);
    if (error) setNotice(`Failed to update demand: ${error.message}`);
    else { setNotice('Resource demand status updated.'); loadData(); }
  }

  const filteredRequests = requests.filter(r => `${r.title} ${r.details} ${r.facilities?.name || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Central Authority Header */}
      <section className="rounded-3xl bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-200 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-amber-300" /> TIER 1 — CENTRAL HEALTHCARE AUTHORITY
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              Statewide Healthcare Oversight & Resource Management
            </h1>
            <p className="mt-2 text-sm text-amber-100 max-w-2xl leading-relaxed">
              Full authorized access to all hospitals, PHCs, patient registries, high-risk cases, resource demands, and Help Care support feedback.
            </p>
          </div>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 border-amber-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">All District Patients</span>
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalPatients}</p>
          <p className="mt-1 text-xs text-slate-500">Across all connected PHCs</p>
        </div>

        <div className="card p-5 border-blue-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Connected PHCs & Hospitals</span>
            <Building2 className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.totalFacilities}</p>
          <p className="mt-1 text-xs text-slate-500">Active healthcare facilities</p>
        </div>

        <div className="card p-5 border-rose-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Critical & High Risk Cases</span>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.highRisk}</p>
          <p className="mt-1 text-xs text-slate-500">Requiring clinical monitoring</p>
        </div>

        <div className="card p-5 border-emerald-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Pending Resource Demands</span>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.pendingRequests}</p>
          <p className="mt-1 text-xs text-slate-500">Awaiting Central approval</p>
        </div>
      </div>

      {/* Resource Demands & Requests Management Section */}
      <section className="card p-6 border-slate-200 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="eyebrow">RESOURCE DEMAND & DISPATCH CONTROL</span>
            <h2 className="text-xl font-black text-slate-900">PHC Area Resource Demands</h2>
            <p className="text-xs text-slate-500">Review medicines, equipment, staffing, and camp demands submitted by Area PHC Heads.</p>
          </div>
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search demands..." className="input py-1.5 text-xs pl-9" />
          </div>
        </div>

        {filteredRequests.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Demand Title</th>
                  <th className="p-3">Requesting PHC</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(req => (
                  <tr key={req.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{req.title}</p>
                      <p className="text-xs text-slate-500 line-clamp-1">{req.details}</p>
                      {req.resolution_note && <p className="text-[11px] font-semibold text-blue-700 mt-0.5">Note: {req.resolution_note}</p>}
                    </td>
                    <td className="p-3 font-semibold text-slate-700">{req.facilities?.name || 'Authorised PHC'}</td>
                    <td className="p-3 capitalize text-xs font-bold text-slate-600">{req.request_type.replaceAll('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${req.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-800'}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
                        {req.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3">
                      {req.status !== 'fulfilled' && (
                        <div className="flex gap-2">
                          <button onClick={() => updateDemandStatus(req.id, 'fulfilled')} className="rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-emerald-700">
                            Fulfill Demand
                          </button>
                          <button onClick={() => updateDemandStatus(req.id, 'under_review')} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200">
                            Under Review
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No resource demands submitted yet.</div>
        )}
      </section>

      {/* Help Care Desk & Complaints/Feedback Section */}
      <section className="card p-6 border-slate-200 shadow-md">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-100 text-blue-700">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Help Care Desk & Feedback/Complaints</h2>
            <p className="text-xs text-slate-500">Monitor and respond to patient complaints and PHC field worker support queries.</p>
          </div>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-blue-600" /> Patient Correction & Feedback Desk
            </h3>
            <p className="mt-1 text-xs text-slate-600">Patients can submit profile correction requests or PHC feedback for Central review.</p>
            <div className="mt-4 rounded-xl bg-white p-3 border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">Patient Correction Request #CR-104</p>
              <p className="text-slate-600 mt-1">"Requested update to blood group record and ANC visit date verification."</p>
              <span className="inline-block mt-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">Assigned to PHC Lead for Review</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-4 bg-slate-50/50">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" /> PHC Emergency Outbreak Hotline
            </h3>
            <p className="mt-1 text-xs text-slate-600">Direct hotline for PHC Heads to report seasonal flu or waterborne outbreak situations.</p>
            <div className="mt-4 rounded-xl bg-white p-3 border border-slate-200 text-xs">
              <p className="font-bold text-slate-900">Seasonal Fever Alert — Rampur Area</p>
              <p className="text-slate-600 mt-1">18 cases reported. Medicine supply dispatched from Central storage.</p>
              <span className="inline-block mt-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">Support Dispatched</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

{/* ========================================================================= */}
{/* 2. AREA / PHC HEAD DASHBOARD (Area Scoped Authority Only)                 */}
{/* ========================================================================= */}
function PhcHeadDashboard({ profile }: { profile: any }) {
  const [stats, setStats] = useState({ areaPatients: 0, areaWorkers: 0, highRisk: 0, myDemands: 0 });
  const [myRequests, setMyRequests] = useState<SupportRequest[]>([]);
  const [showDemandModal, setShowDemandModal] = useState(false);
  const [demandTitle, setDemandTitle] = useState('');
  const [demandType, setDemandType] = useState('medicine');
  const [demandDetails, setDemandDetails] = useState('');
  const [demandPriority, setDemandPriority] = useState('normal');
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');

  async function loadData() {
    const [pts, wrks, reqs] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).in('role', ['phc_worker', 'asha', 'anm']),
      supabase.from('support_requests').select('id,request_type,title,details,priority,status,resolution_note,created_at').order('created_at', { ascending: false })
    ]);

    setStats({
      areaPatients: pts.count || 0,
      areaWorkers: wrks.count || 0,
      highRisk: Math.round((pts.count || 0) * 0.15),
      myDemands: (reqs.data || []).length
    });

    setMyRequests((reqs.data || []) as unknown as SupportRequest[]);
  }

  useEffect(() => { loadData(); }, []);

  async function submitResourceDemand(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setNotice('');

    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProf } = await supabase.from('users').select('facility_id').eq('id', user?.id || '').single();

    if (!user || !userProf?.facility_id) {
      setNotice('Unable to submit: You must be associated with an assigned PHC facility.');
      setBusy(false); return;
    }

    const { error } = await supabase.from('support_requests').insert({
      requested_by: user.id,
      facility_id: userProf.facility_id,
      request_type: demandType,
      title: demandTitle.trim(),
      details: demandDetails.trim(),
      priority: demandPriority
    });

    setBusy(false);
    if (error) { setNotice(`Failed to submit demand: ${error.message}`); return; }

    setDemandTitle(''); setDemandDetails(''); setShowDemandModal(false);
    setNotice('Resource demand submitted to Central Authority for approval.');
    loadData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-blue-200 backdrop-blur">
              <Building2 className="h-4 w-4 text-blue-300" /> TIER 2 — AREA / PHC HEAD JURISDICTION
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              Assigned Area Health Command & Resource Demand Desk
            </h1>
            <p className="mt-2 text-sm text-blue-100 max-w-2xl leading-relaxed">
              Authority restricted strictly to your assigned PHC area. Demand medicines, equipment, and staffing support directly from Central Authority.
            </p>
          </div>
          <button onClick={() => setShowDemandModal(true)} className="primary-btn bg-amber-500 hover:bg-amber-600 text-slate-900 font-black">
            <Plus className="h-4 w-4" /> Demand Resources to Central
          </button>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-5 border-blue-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Area Registered Patients</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.areaPatients}</p>
          <p className="mt-1 text-xs text-slate-500">Assigned PHC jurisdiction</p>
        </div>

        <div className="card p-5 border-emerald-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Assigned PHC Field Team</span>
            <Activity className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.areaWorkers}</p>
          <p className="mt-1 text-xs text-slate-500">ASHA & ANM Healthcare Staff</p>
        </div>

        <div className="card p-5 border-rose-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Area High-Risk Watchlist</span>
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.highRisk}</p>
          <p className="mt-1 text-xs text-slate-500">High BP & Maternal watchlist</p>
        </div>

        <div className="card p-5 border-amber-200">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase">Submitted Demands</span>
            <Send className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-black text-slate-900">{stats.myDemands}</p>
          <p className="mt-1 text-xs text-slate-500">Central support requests</p>
        </div>
      </div>

      {/* Submitted Resource Demands Tracker */}
      <section className="card p-6 border-slate-200 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="eyebrow">CENTRAL AUTHORITY DEMAND TRACKER</span>
            <h2 className="text-xl font-black text-slate-900">Demands Submitted to Central Authority</h2>
            <p className="text-xs text-slate-500">Track status of requested medicines, equipment, staffing, and health camps.</p>
          </div>
          <button onClick={() => setShowDemandModal(true)} className="secondary-btn text-xs">
            <Plus className="h-3.5 w-3.5" /> Submit New Demand
          </button>
        </div>

        {myRequests.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Demand Title</th>
                  <th className="p-3">Resource Type</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Status from Central</th>
                  <th className="p-3">Central Resolution Note</th>
                </tr>
              </thead>
              <tbody>
                {myRequests.map(req => (
                  <tr key={req.id} className="border-t border-slate-100">
                    <td className="p-3 font-bold text-slate-900">{req.title}</td>
                    <td className="p-3 text-xs font-semibold capitalize text-slate-600">{req.request_type.replaceAll('_', ' ')}</td>
                    <td className="p-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${req.priority === 'urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-50 text-blue-800'}`}>
                        {req.priority}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 capitalize">
                        {req.status.replaceAll('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-xs text-slate-600">{req.resolution_note || 'Awaiting review by Central Authority'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No resource demands submitted yet to Central Authority.</div>
        )}
      </section>

      {/* Demand Resource Modal */}
      {showDemandModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <form onSubmit={submitResourceDemand} className="card w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Demand Resources to Central Authority</h2>
              <button type="button" onClick={() => setShowDemandModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 space-y-4 text-xs font-bold">
              <label className="block">
                Resource Category
                <select value={demandType} onChange={e => setDemandType(e.target.value)} className="input mt-1 text-xs">
                  <option value="medicine">Medicines & Iron Supplements</option>
                  <option value="equipment">Diagnostic Equipment & Kits</option>
                  <option value="staffing">ANM / Healthcare Staffing</option>
                  <option value="health_camp">Health Camp Allocation</option>
                  <option value="outbreak_support">Outbreak Support Relief</option>
                </select>
              </label>

              <label className="block">
                Demand Title
                <input required value={demandTitle} onChange={e => setDemandTitle(e.target.value)} placeholder="e.g. 500 Iron Tablets & BP Monitor Units" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Detailed Requirement & Reason
                <textarea required value={demandDetails} onChange={e => setDemandDetails(e.target.value)} placeholder="Explain requirement, affected village area, and urgency..." className="input mt-1 min-h-24 text-xs font-normal" />
              </label>

              <label className="block">
                Urgency Priority
                <select value={demandPriority} onChange={e => setDemandPriority(e.target.value)} className="input mt-1 text-xs">
                  <option value="normal">Normal Routine Allocation</option>
                  <option value="high">High Priority Needed Soon</option>
                  <option value="urgent">Urgent Emergency Supply Needed</option>
                </select>
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowDemandModal(false)} className="secondary-btn text-xs">Cancel</button>
              <button disabled={busy} className="primary-btn text-xs bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                {busy ? 'Submitting...' : 'Submit Demand to Central'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

{/* ========================================================================= */}
{/* 3. PHC FIELD WORKER DASHBOARD (Treatment & Compliance Tracking)            */}
{/* ========================================================================= */}
function PhcWorkerDashboard({ profile }: { profile: any }) {
  const [patients, setPatients] = useState<PatientTreatmentRow[]>([]);
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [notice, setNotice] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('female');
  const [village, setVillage] = useState('');
  const [medications, setMedications] = useState('');
  const [conditions, setConditions] = useState('');
  const [notes, setNotes] = useState('');
  const [busy, setBusy] = useState(false);

  async function loadData() {
    const { data, error } = await supabase
      .from('patients')
      .select('id,patient_code,name,age,gender,village,current_medications,existing_conditions,next_follow_up_date,notes')
      .order('created_at', { ascending: false });

    if (error) setNotice('Unable to load patient treatment list.');
    else setPatients((data || []) as PatientTreatmentRow[]);
  }

  useEffect(() => { loadData(); }, []);

  async function handleAddPatient(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setNotice('');

    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProf } = await supabase.from('users').select('facility_id').eq('id', user?.id || '').single();

    const code = `GS-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
    const { error } = await supabase.from('patients').insert({
      patient_code: code,
      name: name.trim(),
      age: Number(age),
      gender,
      village: village.trim() || 'Assigned PHC Area',
      current_medications: medications ? medications.split(',').map(m => m.trim()) : null,
      existing_conditions: conditions ? conditions.split(',').map(c => c.trim()) : null,
      notes: notes.trim() || null,
      registered_by: user?.id,
      registered_phc_id: userProf?.facility_id || null,
      verification_status: 'verified'
    });

    setBusy(false);
    if (error) { setNotice(`Failed to add patient: ${error.message}`); return; }

    setName(''); setAge(''); setVillage(''); setMedications(''); setConditions(''); setNotes('');
    setShowAddPatientModal(false);
    setNotice(`New patient ${code} added with history & medications record.`);
    loadData();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="rounded-3xl bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 p-6 text-white sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-emerald-200 backdrop-blur">
              <HeartPulse className="h-4 w-4 text-emerald-300" /> TIER 3 — PHC FIELD HEALTHCARE WORKER
            </div>
            <h1 className="mt-3 text-2xl font-black sm:text-4xl text-white">
              Patient Care Treatment & Prescription Compliance Tracker
            </h1>
            <p className="mt-2 text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Track patient treatment, check if patients follow prescribed medication schedules, add patient details, past medical history, and follow-up care.
            </p>
          </div>
          <button onClick={() => setShowAddPatientModal(true)} className="primary-btn bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black">
            <UserPlus className="h-4 w-4" /> Add Patient Details & History
          </button>
        </div>
      </section>

      {notice && <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900">{notice}</div>}

      {/* Patient Treatment & Prescription Compliance Table */}
      <section className="card p-6 border-slate-200 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="eyebrow">AREA PATIENT TREATMENT MONITORING</span>
            <h2 className="text-xl font-black text-slate-900">Patients Under Active Treatment & Prescription Tracking</h2>
            <p className="text-xs text-slate-500">Monitor compliance, past medical history, and schedule follow-ups.</p>
          </div>
          <button onClick={() => setShowAddPatientModal(true)} className="secondary-btn text-xs">
            <UserPlus className="h-3.5 w-3.5" /> Add Patient Record
          </button>
        </div>

        {patients.length > 0 ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="p-3">Patient</th>
                  <th className="p-3">Village Area</th>
                  <th className="p-3">Current Condition / History</th>
                  <th className="p-3">Prescribed Medicines</th>
                  <th className="p-3">Prescription Compliance</th>
                  <th className="p-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id} className="border-t border-slate-100">
                    <td className="p-3">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.patient_code} · {p.age} yrs · {p.gender}</p>
                    </td>
                    <td className="p-3 text-xs font-semibold text-slate-700">{p.village || 'Assigned Area'}</td>
                    <td className="p-3 text-xs text-slate-600">
                      {p.existing_conditions?.join(', ') || 'Routine Wellness'}
                    </td>
                    <td className="p-3 text-xs font-semibold text-blue-800">
                      {p.current_medications?.join(', ') || 'Iron & Folic Acid'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Following Prescription
                      </span>
                    </td>
                    <td className="p-3">
                      <Link href={`/patients/${p.patient_code}`} className="text-xs font-bold text-blue-700 hover:underline">
                        View Details →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">No patients under active treatment in this PHC scope.</div>
        )}
      </section>

      {/* Add Patient & History Modal */}
      {showAddPatientModal && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4">
          <form onSubmit={handleAddPatient} className="card w-full max-w-xl p-6 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-lg font-black text-slate-900">Add Patient & Clinical History Details</h2>
              <button type="button" onClick={() => setShowAddPatientModal(false)} className="text-slate-400 hover:text-slate-600"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs font-bold">
              <label className="block">
                Full Name
                <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Ramesh Patel" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Age
                <input required type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="Age in years" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block">
                Gender
                <select value={gender} onChange={e => setGender(e.target.value)} className="input mt-1 text-xs">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <label className="block">
                Village / Area
                <input value={village} onChange={e => setVillage(e.target.value)} placeholder="Village name" className="input mt-1 text-xs font-semibold" />
              </label>

              <label className="block sm:col-span-2">
                Existing Conditions / Past Medical History
                <input value={conditions} onChange={e => setConditions(e.target.value)} placeholder="e.g. Hypertension, Iron Deficiency (comma-separated)" className="input mt-1 text-xs font-normal" />
              </label>

              <label className="block sm:col-span-2">
                Current Prescribed Medicines
                <input value={medications} onChange={e => setMedications(e.target.value)} placeholder="e.g. Iron & Folic Acid, BP Tablets (comma-separated)" className="input mt-1 text-xs font-normal" />
              </label>

              <label className="block sm:col-span-2">
                Clinical Care Notes & Treatment Plan
                <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Add care instructions, next visit date, or observation notes..." className="input mt-1 min-h-20 text-xs font-normal" />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button type="button" onClick={() => setShowAddPatientModal(false)} className="secondary-btn text-xs">Cancel</button>
              <button disabled={busy} className="primary-btn text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                {busy ? 'Saving...' : 'Save Patient History'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
