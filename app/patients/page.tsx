'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { PatientTable } from '@/components/patient-table';
import { PatientRegistrationModal } from '@/components/patient-registration-modal';
import { getPatients } from '@/lib/api/doctor';
import type { PatientRow } from '@/lib/types';
import { Users, Search, Plus, Filter, UserCheck } from 'lucide-react';

export default function PatientsPage() {
  const [q, setQ] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [data, setData] = useState<PatientRow[] | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    loadPatients();
  }, [q, riskFilter, villageFilter, genderFilter]);

  async function loadPatients() {
    setData(null);
    try {
      const res = await getPatients({
        query: q,
        riskLevel: riskFilter,
        village: villageFilter,
        gender: genderFilter
      });
      setData(res);
    } catch {
      setData([]);
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

        <button
          onClick={() => setShowRegisterModal(true)}
          className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </button>
      </header>

      {/* Multi-Criteria Filters Bar */}
      <div className="mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            className="input input-icon-left text-xs py-2.5"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search name, village, or phone…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
          <Filter className="h-4 w-4 text-slate-500 ml-2" />
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-700 dark:text-slate-200 py-1.5 px-2 outline-none"
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
            <option value="Sitapur">Sitapur</option>
            <option value="Palampur">Palampur</option>
            <option value="Kalyanpur">Kalyanpur</option>
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
          <PatientTable patients={data} />
        )}
      </div>

      {showRegisterModal && (
        <PatientRegistrationModal
          onClose={() => setShowRegisterModal(false)}
          onSuccess={() => loadPatients()}
        />
      )}
    </DashboardShell>
  );
}
