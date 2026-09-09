'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { syncEngine } from '@/lib/offline/sync-engine';
import { OfflineStatusBar } from '@/components/offline-status-bar';
import { PatientRegistrationModal } from '@/components/patient-registration-modal';
import { VitalsRecordModal } from '@/components/vitals-record-modal';
import { FlashcardsSection } from '@/components/flashcards';
import { 
  Users, 
  UserPlus, 
  Activity, 
  LogOut, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Clock, 
  Sparkles,
  HeartPulse,
  UserCheck,
  Hospital,
  Globe2
} from 'lucide-react';
import type { Patient } from '@/lib/types';

export default function WorkspacePage() {
  const router = useRouter();
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [selectedPatientForVitals, setSelectedPatientForVitals] = useState<string | undefined>(undefined);

  useEffect(() => {
    let live = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setNameFallback();
      } else {
        const { data: profile } = await supabase.from('users').select('name,role').eq('id', user.id).single();
        if (profile?.role === 'doctor' || profile?.role === 'admin') {
          router.replace('/dashboard');
          return;
        }
        if (live) {
          setUserName(profile?.name || user.user_metadata?.name || 'Health Worker');
          setLoading(false);
        }
      }
    })();

    loadLocalData();

    const unsubscribe = syncEngine.subscribe(() => {
      loadLocalData();
    });

    return () => {
      live = false;
      unsubscribe();
    };
  }, [router]);

  const setNameFallback = () => {
    setUserName('Community Health Worker (Offline Mode)');
    setLoading(false);
  };

  const loadLocalData = () => {
    const localPats = syncEngine.getLocalPatients();
    setPatients(localPats);
  };

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.village && p.village.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-50 text-base font-bold text-slate-500">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <span>Initializing GramCare Offline Engine…</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* Real-time Network & Sync Status Header */}
      <OfflineStatusBar />

      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-20">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-4">
          <Link href="/workspace" className="flex items-center gap-2.5 text-xl font-black text-slate-900">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-sm font-black text-white shadow-sm">+</span>
            Gram<span className="text-blue-600">Care</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-sm font-extrabold text-slate-800">
              {userName}
            </span>
            <button
              onClick={signOut}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-extrabold text-slate-700 hover:bg-slate-100 transition"
            >
              <LogOut className="h-4 w-4 text-slate-500" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-5 py-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-black text-blue-700">
              <ShieldCheck className="h-4 w-4 text-blue-600" />
              <span>Offline-First Care Portal</span>
            </div>
            <h1 className="mt-2.5 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
              Welcome, {userName}
            </h1>
            <p className="mt-1 text-sm leading-6 text-slate-600 font-medium max-w-xl">
              Register patients, collect vitals, run local AI risk predictions offline, and sync automatically when connected.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="primary-btn text-sm py-3 px-5 font-bold shadow-md"
            >
              <UserPlus className="h-5 w-5" />
              <span>Register Patient</span>
            </button>

            <button
              onClick={() => {
                setSelectedPatientForVitals(undefined);
                setShowVitalsModal(true);
              }}
              className="secondary-btn text-sm py-3 px-5 font-bold shadow-sm border-blue-200 text-blue-800 hover:bg-blue-50"
            >
              <Activity className="h-5 w-5 text-blue-600" />
              <span>Record Vitals & AI Risk</span>
            </button>
          </div>
        </div>

        {/* Local Patient Directory Table */}
        <div className="mt-8 card p-6 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Local Patient Records ({filteredPatients.length})
              </h2>
              <p className="text-xs text-slate-500 font-medium">Stored on device & automatically queued for server synchronization</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient or village…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="input input-icon-left text-sm py-2.5"
                style={{ paddingLeft: '2.75rem' }}
              />
            </div>
          </div>

          {!filteredPatients.length ? (
            <div className="py-12 text-center">
              <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <Users className="h-7 w-7" />
              </span>
              <p className="mt-4 text-base font-extrabold text-slate-800">No patients recorded yet</p>
              <p className="mt-1 text-xs text-slate-500">Click "Register Patient" to add a new patient even while offline.</p>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="primary-btn mt-4 text-xs py-2.5 px-4 font-bold"
              >
                Register Patient Now
              </button>
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-extrabold text-xs">
                  <tr>
                    <th className="p-3.5 rounded-l-xl">Patient Name</th>
                    <th className="p-3.5">Age / Gender</th>
                    <th className="p-3.5">Village</th>
                    <th className="p-3.5">Sync Status</th>
                    <th className="p-3.5 text-right rounded-r-xl">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800 text-sm">
                  {filteredPatients.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-3.5 font-bold text-slate-900">
                        {p.name}
                        {p.guardian_name && (
                          <span className="block text-xs font-medium text-slate-500">
                            c/o {p.guardian_name}
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 capitalize">{p.age}y • {p.gender}</td>
                      <td className="p-3.5">{p.village || '—'}</td>
                      <td className="p-3.5">
                        {p.sync_status === 'synced' ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 border border-amber-200">
                            <Clock className="h-3.5 w-3.5" />
                            Pending Sync
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedPatientForVitals(p.id);
                            setShowVitalsModal(true);
                          }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline bg-blue-50 px-3 py-1.5 rounded-lg"
                        >
                          <Activity className="h-4 w-4" />
                          <span>Add Vitals</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* IMPACT AND BENEFITS SHOWCASE */}
      <section className="mx-auto max-w-5xl px-5 py-8">
        <div className="card p-7 sm:p-9 border-slate-200 bg-gradient-to-b from-white to-blue-50/20">
          <div className="text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1 text-xs font-black text-blue-700">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span>Smart India Hackathon 2026</span>
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
              IMPACT AND BENEFITS
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600 font-medium">
              GramCare helps reduce referral delays, improve record accessibility, and maintain continuity of healthcare for rural communities.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <article className="card p-5 border-slate-200 text-center bg-white shadow-sm hover:shadow-md transition-all">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-rose-100 shadow-sm">
                <img src="/images/patient_care_clinic.png" alt="For Patients" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <HeartPulse className="h-4 w-4 text-rose-600" />
                For Patients
              </h3>
              <ul className="mt-3 space-y-1.5 text-left text-xs leading-5 text-slate-600 font-medium">
                <li>● Faster identification of high-risk cases</li>
                <li>● Reduced unnecessary travel</li>
                <li>● Better treatment continuity</li>
              </ul>
            </article>

            <article className="card p-5 border-slate-200 text-center bg-white shadow-sm hover:shadow-md transition-all">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-blue-100 shadow-sm">
                <img src="/images/rural_health_worker.png" alt="For Health Workers" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <UserCheck className="h-4 w-4 text-blue-600" />
                Health Workers
              </h3>
              <ul className="mt-3 space-y-1.5 text-left text-xs leading-5 text-slate-600 font-medium">
                <li>● Can work without internet</li>
                <li>● Digital patient records</li>
                <li>● AI-assisted triage</li>
              </ul>
            </article>

            <article className="card p-5 border-slate-200 text-center bg-white shadow-sm hover:shadow-md transition-all">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-violet-100 shadow-sm">
                <img src="/images/doctor_triage_dashboard.png" alt="For Doctors" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <Hospital className="h-4 w-4 text-violet-600" />
                Doctors & Hospitals
              </h3>
              <ul className="mt-3 space-y-1.5 text-left text-xs leading-5 text-slate-600 font-medium">
                <li>● Centralized patient info</li>
                <li>● High-risk cases visible quickly</li>
                <li>● Referral coordination</li>
              </ul>
            </article>

            <article className="card p-5 border-slate-200 text-center bg-white shadow-sm hover:shadow-md transition-all">
              <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-emerald-100 shadow-sm">
                <img src="/images/community_health_impact.png" alt="Social Impact" className="h-full w-full object-cover" />
              </div>
              <h3 className="mt-4 text-base font-black text-slate-900 flex items-center justify-center gap-1">
                <Globe2 className="h-4 w-4 text-emerald-600" />
                Social Impact
              </h3>
              <ul className="mt-3 space-y-1.5 text-left text-xs leading-5 text-slate-600 font-medium">
                <li>● Improved healthcare access</li>
                <li>● Support for rural areas</li>
                <li>● Reduced care delays</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      {/* Clinical Guidance Flashcards */}
      <section className="border-t border-slate-200/80 bg-white py-8">
        <FlashcardsSection lang="English" />
      </section>

      {/* Modals */}
      {showRegisterModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => loadLocalData()}
        />
      )}

      {showVitalsModal && (
        <VitalsRecordModal
          patients={patients}
          selectedPatientId={selectedPatientForVitals}
          onClose={() => setShowVitalsModal(false)}
          onSuccess={() => loadLocalData()}
        />
      )}
    </main>
  );
}
