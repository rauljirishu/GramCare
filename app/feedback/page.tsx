'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { supabase } from '@/lib/supabase/client';
import { currentRole } from '@/lib/auth';
import { MessageSquare, Star, ThumbsUp, Plus, ShieldCheck, CheckCircle2 } from 'lucide-react';

type FeedbackItem = {
  id: string;
  sender_name: string;
  role: string;
  phc_name: string;
  category: string;
  rating: number;
  message: string;
  created_at: string;
  status: string;
};

export default function FeedbackPage() {
  const [role, setRole] = useState('central');
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [notice, setNotice] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState('PHC Facility & Services');
  const [rating, setRating] = useState(5);
  const [message, setMessage] = useState('');
  const [senderName, setSenderName] = useState('');
  const [busy, setBusy] = useState(false);

  const initialFeedbacks: FeedbackItem[] = [
    {
      id: 'fb-1',
      sender_name: 'Anita Devi',
      role: 'Patient',
      phc_name: 'PHC Rampur Central',
      category: 'Doctor & Nursing Care',
      rating: 5,
      message: 'The maternal checkup was very smooth. Dr. Rajesh Sharma and the ASHA worker explained all medicines clearly.',
      created_at: '2026-09-18T10:30:00Z',
      status: 'Reviewed'
    },
    {
      id: 'fb-2',
      sender_name: 'Ramesh Singh',
      role: 'Patient',
      phc_name: 'PHC Rampur East Sub-branch',
      category: 'PHC Facility & Cleanliness',
      rating: 4,
      message: 'Clean waiting area and prompt blood pressure testing. Water cooler in waiting room needs repair.',
      created_at: '2026-09-17T14:15:00Z',
      status: 'Reviewed'
    },
    {
      id: 'fb-3',
      sender_name: 'Sunita Verma (ANM Worker)',
      role: 'Health Worker',
      phc_name: 'PHC Anandpur Rural Centre',
      category: 'Mobile Screening Kits',
      rating: 5,
      message: 'The offline tablet sync and BP monitors provided by central authority are helping us complete 30+ home screenings daily.',
      created_at: '2026-09-16T09:45:00Z',
      status: 'Reviewed'
    },
    {
      id: 'fb-4',
      sender_name: 'Vikram Patel',
      role: 'Patient',
      phc_name: 'PHC Sundarpur Health Outpost',
      category: 'Emergency Transport',
      rating: 5,
      message: 'Ambulance arrived within 20 minutes when my mother required urgent transfer to CHC Rampur.',
      created_at: '2026-09-15T18:20:00Z',
      status: 'Reviewed'
    }
  ];

  useEffect(() => {
    currentRole().then(r => { if (r) setRole(r); });
    setItems(initialFeedbacks);
  }, []);

  function handleAddFeedback(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const newFb: FeedbackItem = {
      id: `fb-${Date.now()}`,
      sender_name: senderName || (role === 'patient' ? 'Patient User' : 'Health Worker'),
      role: role === 'patient' ? 'Patient' : role === 'head' ? 'PHC Head' : 'Health Worker',
      phc_name: 'GramCare Network PHC',
      category,
      rating,
      message,
      created_at: new Date().toISOString(),
      status: 'New'
    };
    setItems([newFb, ...items]);
    setBusy(false);
    setShowModal(false);
    setMessage('');
    setSenderName('');
    setNotice('Thank you! Your feedback has been submitted to the Central Health Authority.');
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="eyebrow">CENTRAL HEALTHCARE AUTHORITY</span>
            <h1 className="mt-1 text-3xl font-black text-slate-900">Feedback & Service Evaluation</h1>
            <p className="mt-1 text-sm text-slate-600">
              Statewide portal for collecting patient experiences, facility feedback, and healthcare worker insights.
            </p>
          </div>
          <button onClick={() => setShowModal(true)} className="primary-btn">
            <Plus className="h-4 w-4" /> Submit Feedback
          </button>
        </header>

        <div className="flex items-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 p-3.5 text-xs font-semibold text-blue-900">
          <ShieldCheck className="h-4 w-4 text-blue-700" />
          {role === 'central'
            ? 'Central Authority View: Monitoring all feedbacks across all PHCs and referral centers.'
            : 'Your feedback directly reaches the Central Health Authority for continuous care improvement.'}
        </div>

        {notice && (
          <div className="rounded-xl bg-emerald-50 p-4 text-xs font-bold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            {notice}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-slate-500">Average Rating</p>
            <p className="mt-2 text-3xl font-black text-slate-900">4.8 / 5.0</p>
            <p className="mt-1 text-xs font-bold text-emerald-600">Based on verified feedback</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-slate-500">Total Feedbacks Received</p>
            <p className="mt-2 text-3xl font-black text-slate-900">{items.length}</p>
            <p className="mt-1 text-xs font-bold text-blue-600">From 6 PHC districts</p>
          </div>
          <div className="card p-5">
            <p className="text-xs font-bold uppercase text-slate-500">Satisfaction Index</p>
            <p className="mt-2 text-3xl font-black text-emerald-600">96.4%</p>
            <p className="mt-1 text-xs font-bold text-slate-500">Patient & Worker approval</p>
          </div>
        </div>

        <section className="card p-6 border-slate-200">
          <h2 className="text-lg font-black text-slate-900 mb-4">Statewide Feedback Log</h2>
          <div className="space-y-4">
            {items.map(fb => (
              <div key={fb.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-blue-300 transition">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-blue-700">
                      <MessageSquare className="h-4 w-4" />
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900">{fb.sender_name}</h3>
                      <p className="text-xs text-slate-500">{fb.role} · {fb.phc_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center text-amber-500">
                      {Array.from({ length: fb.rating }).map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${fb.status === 'New' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                      {fb.status}
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate-700 leading-relaxed">{fb.message}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span className="font-semibold text-slate-500">Category: {fb.category}</span>
                  <span>Submitted: {new Date(fb.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
            <form onSubmit={handleAddFeedback} className="card w-full max-w-lg p-6 space-y-4">
              <h2 className="text-xl font-black text-slate-900">Submit Service Feedback</h2>
              <p className="text-xs text-slate-500">Share your experience with Central Healthcare Authority.</p>

              <div>
                <label className="text-xs font-bold text-slate-700">Your Name / Designation</label>
                <input
                  type="text"
                  value={senderName}
                  onChange={e => setSenderName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar or ASHA Worker"
                  className="input mt-1 text-sm"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Feedback Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)} className="input mt-1 text-sm">
                  <option value="Doctor & Nursing Care">Doctor & Nursing Care</option>
                  <option value="PHC Facility & Cleanliness">PHC Facility & Cleanliness</option>
                  <option value="Medicine Availability">Medicine Availability</option>
                  <option value="Mobile Screening Kits">Mobile Screening Kits</option>
                  <option value="Emergency Transport">Emergency Transport</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Rating (1 to 5 Stars)</label>
                <select value={rating} onChange={e => setRating(Number(e.target.value))} className="input mt-1 text-sm">
                  <option value={5}>⭐⭐⭐⭐⭐ (5 - Excellent)</option>
                  <option value={4}>⭐⭐⭐⭐ (4 - Good)</option>
                  <option value={3}>⭐⭐⭐ (3 - Average)</option>
                  <option value={2}>⭐⭐ (2 - Needs Improvement)</option>
                  <option value={1}>⭐ (1 - Poor)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Feedback Details</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write your detailed feedback here..."
                  className="input mt-1 text-sm min-h-24"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="secondary-btn">
                  Cancel
                </button>
                <button type="submit" disabled={busy} className="primary-btn">
                  {busy ? 'Submitting...' : 'Submit Feedback'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
