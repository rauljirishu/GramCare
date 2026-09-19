'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { currentRole } from '@/lib/auth';
import { AlertTriangle, ShieldCheck, Plus, CheckCircle2, Clock, Check, Wrench } from 'lucide-react';

type Complaint = {
  id: string;
  ticket_no: string;
  complainant_name: string;
  role: string;
  phc_name: string;
  issue_category: string;
  title: string;
  details: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Normal';
  status: 'Open' | 'Under Investigation' | 'Resolved';
  resolution_note?: string;
  created_at: string;
};

export default function ComplaintsPage() {
  const [role, setRole] = useState('central');
  const [items, setItems] = useState<Complaint[]>([]);
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('Equipment & Resource Breakdown');
  const [priority, setPriority] = useState<'Critical' | 'High' | 'Medium' | 'Normal'>('High');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [complainantName, setComplainantName] = useState('');
  const [busy, setBusy] = useState(false);

  const initialComplaints: Complaint[] = [
    {
      id: 'cmp-101',
      ticket_no: 'GRM-CMP-2026-081',
      complainant_name: 'Dr. Rajesh Sharma (PHC Head)',
      role: 'PHC Head',
      phc_name: 'Primary Health Centre Rampur Central',
      issue_category: 'Equipment & Resource Breakdown',
      title: 'ECG Machine Sensor Fault',
      details: 'Main ECG unit in emergency room reporting calibration error during diagnostic readings.',
      priority: 'Critical',
      status: 'Under Investigation',
      created_at: '2026-09-18T08:20:00Z'
    },
    {
      id: 'cmp-102',
      ticket_no: 'GRM-CMP-2026-079',
      complainant_name: 'Sunita Devi (ANM Worker)',
      role: 'Health Worker',
      phc_name: 'PHC Rampur East Sub-branch',
      issue_category: 'Medicine Supply Delay',
      title: 'Tetanus Toxoid Stock Out Risk',
      details: 'Remaining TT vaccine doses low. Request urgent stock replenishment from central warehouse.',
      priority: 'High',
      status: 'Open',
      created_at: '2026-09-17T11:45:00Z'
    },
    {
      id: 'cmp-103',
      ticket_no: 'GRM-CMP-2026-074',
      complainant_name: 'Ramesh Kumar (Patient)',
      role: 'Patient',
      phc_name: 'PHC Anandpur Rural Centre',
      issue_category: 'Patient Grievance / Delay',
      title: 'Long Wait Time for Morning OPD Blood Pressure Checks',
      details: 'Single BP apparatus in use during rush hours leading to extended wait times for senior citizens.',
      priority: 'Medium',
      status: 'Resolved',
      resolution_note: 'Central Authority dispatched 2 additional digital BP monitors to Anandpur PHC.',
      created_at: '2026-09-15T09:10:00Z'
    }
  ];

  useEffect(() => {
    currentRole().then(r => { if (r) setRole(r); });
    setItems(initialComplaints);
  }, []);

  function handleAddComplaint(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const newCmp: Complaint = {
      id: `cmp-${Date.now()}`,
      ticket_no: `GRM-CMP-2026-${Math.floor(100 + Math.random() * 900)}`,
      complainant_name: complainantName || (role === 'patient' ? 'Patient User' : 'PHC Staff'),
      role: role === 'patient' ? 'Patient' : role === 'head' ? 'PHC Head' : 'Health Worker',
      phc_name: 'GramCare Sub-branch',
      issue_category: category,
      title,
      details,
      priority,
      status: 'Open',
      created_at: new Date().toISOString()
    };
    setItems([newCmp, ...items]);
    setBusy(false);
    setShowModal(false);
    setTitle('');
    setDetails('');
    setComplainantName('');
    setNotice(`Complaint ticket ${newCmp.ticket_no} logged successfully with Central Authority.`);
  }

  function updateStatus(id: string, newStatus: 'Open' | 'Under Investigation' | 'Resolved') {
    setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
    setNotice(`Ticket ${id} status updated to ${newStatus}.`);
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow">CENTRAL HEALTHCARE AUTHORITY</span>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Complaint Box & Grievance Redressal</h1>
            <p className="mt-1 text-sm text-slate-600">
              Centralized problem reporting system for patients, health workers, and area authorities.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="primary-btn">
            <Plus className="h-4 w-4" /> Report Problem / Complaint
          </button>
        </header>

        <div className="flex items-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 p-3.5 text-xs font-semibold text-rose-900">
          <AlertTriangle className="h-4 w-4 text-rose-600" />
          {role === 'central'
            ? 'Central Authority Oversight: Track, investigate, and resolve complaints logged across all PHCs.'
            : 'Log problems regarding equipment, staff availability, medicine supply, or facility issues directly to Central Authority.'}
        </div>

        {notice && (
          <div className="rounded-xl bg-blue-50 p-4 text-xs font-bold text-blue-900 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            {notice}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5 border-l-4 border-l-rose-500">
            <p className="text-xs font-bold uppercase text-slate-500">Open Tickets</p>
            <p className="mt-2 text-3xl font-black text-rose-600">
              {items.filter(i => i.status === 'Open').length}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">Awaiting investigation</p>
          </div>
          <div className="card p-5 border-l-4 border-l-amber-500">
            <p className="text-xs font-bold uppercase text-slate-500">Under Investigation</p>
            <p className="mt-2 text-3xl font-black text-amber-600">
              {items.filter(i => i.status === 'Under Investigation').length}
            </p>
            <p className="mt-1 text-xs font-bold text-slate-500">Central Action in Progress</p>
          </div>
          <div className="card p-5 border-l-4 border-l-emerald-500">
            <p className="text-xs font-bold uppercase text-slate-500">Resolved Complaints</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">
              {items.filter(i => i.status === 'Resolved').length}
            </p>
            <p className="mt-1 text-xs font-bold text-emerald-700">Closed & Rectified</p>
          </div>
        </div>

        <section className="card p-6 border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-4">Grievance Ticket Registry</h2>
          <div className="space-y-4">
            {items.map(cmp => (
              <div key={cmp.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase text-slate-400">{cmp.ticket_no}</span>
                    <h3 className="text-base font-extrabold text-slate-900">{cmp.title}</h3>
                    <p className="text-xs text-slate-500">{cmp.complainant_name} ({cmp.role}) · {cmp.phc_name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      cmp.priority === 'Critical' ? 'bg-rose-100 text-rose-800 font-black' :
                      cmp.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {cmp.priority} Priority
                    </span>

                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      cmp.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                      cmp.status === 'Under Investigation' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {cmp.status}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700">{cmp.details}</p>

                {cmp.resolution_note && (
                  <div className="rounded-xl bg-emerald-50 p-3 text-xs text-emerald-800 font-semibold border border-emerald-100">
                    ✅ Resolution Note: {cmp.resolution_note}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <span>Category: <b>{cmp.issue_category}</b> · Logged: {new Date(cmp.created_at).toLocaleDateString()}</span>
                  
                  {role === 'central' && cmp.status !== 'Resolved' && (
                    <div className="flex gap-2">
                      <button onClick={() => updateStatus(cmp.id, 'Under Investigation')} className="rounded-lg bg-amber-50 px-3 py-1 font-bold text-amber-800 border border-amber-200 hover:bg-amber-100">
                        Mark Investigating
                      </button>
                      <button onClick={() => updateStatus(cmp.id, 'Resolved')} className="rounded-lg bg-emerald-600 px-3 py-1 font-bold text-white shadow-sm hover:bg-emerald-700">
                        Mark Resolved
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleAddComplaint} className="card w-full max-w-lg p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Log Problem / Complaint</h2>
              <p className="text-xs text-slate-500">Submit a formal complaint to Central Healthcare Authority.</p>

              <div>
                <label className="text-xs font-bold text-slate-700">Complainant Name / Identity</label>
                <input
                  type="text"
                  value={complainantName}
                  onChange={e => setComplainantName(e.target.value)}
                  placeholder="Your Name or Designation"
                  className="input mt-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Issue Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input mt-1 text-sm">
                  <option value="Equipment & Resource Breakdown">Equipment & Resource Breakdown</option>
                  <option value="Medicine Supply Delay">Medicine Supply Delay</option>
                  <option value="Facility Cleanliness & Water">Facility Cleanliness & Water</option>
                  <option value="Staffing / Doctor Unavailability">Staffing / Doctor Unavailability</option>
                  <option value="Patient Grievance / Delay">Patient Grievance / Delay</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Priority Level</label>
                <select value={priority} onChange={e => setPriority(e.target.value as any)} className="input mt-1 text-sm">
                  <option value="Critical">Critical (Needs Immediate Central Intervention)</option>
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Normal">Normal</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Complaint Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Short summary of the problem"
                  className="input mt-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Detailed Problem Description</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Describe the exact issue, location, and impact..."
                  className="input mt-1 text-sm min-h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="primary-btn">
                  {busy ? 'Logging Ticket...' : 'Log Ticket to Central Authority'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
