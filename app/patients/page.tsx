'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { PatientTable } from '@/components/patient-table';
import { PatientRegistrationModal } from '@/components/patient-registration-modal';
import { getPatients, resetDemoData } from '@/lib/api/doctor';
import type { PatientRow } from '@/lib/types';
import { Users, Search, Plus, Filter, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function PatientsPage() {
  const [q, setQ] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [demoFilter, setDemoFilter] = useState<'all' | 'real' | 'demo'>('all');

  const [data, setData] = useState<PatientRow[] | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    loadPatients();
  }, [q, riskFilter, villageFilter, genderFilter, demoFilter]);

  async function loadPatients() {
    setData(null);
    try {
      const res = await getPatients({
        query: q,
        riskLevel: riskFilter,
        village: villageFilter,
        gender: genderFilter,
        demoFilter
      });
      setData(res);
    } catch {
      setData([]);
    }
  }

  async function handleResetDemoData() {
    setResetting(true);
    try {
      await resetDemoData();
      setNotification('6 Demo Patients refreshed successfully without altering real patient records.');
      setShowResetConfirm(false);
      await loadPatients();
      setTimeout(() => setNotification(''), 4000);
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setResetting(false);
    }
  }

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-300">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Digital Health Records Registry</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
            Patient Directory
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-400">
            Search patient health records across rural PHC sectors and villages.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="secondary-btn text-xs py-2.5 px-3.5 font-bold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Admin action to refresh 6 SIH demo records without affecting real patients"
          >
            <RefreshCw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={() => setShowRegisterModal(true)}
            className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Register New Patient</span>
          </button>
        </div>
      </header>

      {notification && (
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Multi-Criteria Filters Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input input-icon-left text-xs py-2.5"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search name, village, or GC-DEMO-001 ID…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Filter className="h-4 w-4 text-slate-500 ml-2" />
          
          {/* Demo Data Filter Toggle */}
          <select
            value={demoFilter}
            onChange={e => setDemoFilter(e.target.value as any)}
            className="bg-transparent text-xs font-black text-blue-700 dark:text-blue-300 py-1.5 px-2 outline-none"
          >
            <option value="all">Show All Patients</option>
            <option value="real">Real Patients Only</option>
            <option value="demo">Demo Patients Only</option>
          </select>

          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2 outline-none border-l border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>

          <select
            value={villageFilter}
            onChange={e => setVillageFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2 outline-none border-l border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Villages</option>
            <option value="Rampur">Rampur</option>
            <option value="Shivpur">Shivpur</option>
            <option value="Lakshmipur">Lakshmipur</option>
            <option value="Devgaon">Devgaon</option>
            <option value="Haripur">Haripur</option>
            <option value="Anandpur">Anandpur</option>
          </select>

          <select
            value={genderFilter}
            onChange={e => setGenderFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2 outline-none border-l border-slate-200 dark:border-slate-700"
          >
            <option value="all">All Genders</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
          </select>
        </div>
      </div>

      <div className="card p-6 border-slate-200 dark:border-slate-800">
        {!data ? (
          <Loading label="Loading patient directory from database…" />
        ) : (
          <PatientTable
            patients={data}
            onRegisterClick={() => setShowRegisterModal(true)}
            onLoadDemoClick={() => handleResetDemoData()}
          />
        )}
      </div>

      {showRegisterModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => loadPatients()}
        />
      )}

      {/* Demo Reset Confirmation Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 text-rose-600">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 dark:bg-rose-950 font-bold">
                <AlertCircle className="h-5 w-5" />
              </span>
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">Reset SIH Demo Data?</h3>
                <p className="text-xs text-slate-500">Idempotent Demo Data Refresh Action</p>
              </div>
            </div>

            <p className="mt-4 text-xs font-semibold leading-relaxed text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
              This action will delete and recreate only the <strong>6 canonical SIH demonstration records</strong> (`is_demo = true`). Real patient records will <strong>NEVER</strong> be deleted or altered.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="secondary-btn text-xs py-2 px-3"
              >
                Cancel
              </button>

              <button
                disabled={resetting}
                onClick={handleResetDemoData}
                className="primary-btn text-xs py-2 px-4 bg-rose-600 hover:bg-rose-700 font-bold"
              >
                {resetting ? 'Refreshing Demo Data…' : 'Reset Demo Patients'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
