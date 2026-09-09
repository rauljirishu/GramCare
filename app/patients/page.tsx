'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { PatientTable } from '@/components/patient-table';
import { getPatients } from '@/lib/api/doctor';
import type { PatientRow } from '@/lib/types';
import { Users, Search, Plus } from 'lucide-react';

export default function PatientsPage() {
  const [q, setQ] = useState('');
  const [data, setData] = useState<PatientRow[] | null>(null);

  useEffect(() => {
    setData(null);
    const id = setTimeout(() => {
      getPatients({ query: q })
        .then(setData)
        .catch(() => setData([]));
    }, 250);
    return () => clearTimeout(id);
  }, [q]);

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-blue-700">
            <Users className="h-4 w-4 text-blue-600" />
            <span>Digital Health Records Registry</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Patient Directory
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Search patient health records across rural PHC sectors and villages.
          </p>
        </div>

        <Link
          href="/workspace"
          className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md"
        >
          <Plus className="h-4 w-4" />
          <span>Register New Patient</span>
        </Link>
      </header>

      <div className="relative max-w-md mb-6">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input
          className="input input-icon-left text-sm py-2.5"
          style={{ paddingLeft: '2.75rem' }}
          placeholder="Search patients by name or village…"
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>

      <div className="card p-6 border-slate-200">
        {!data ? <Loading label="Loading patient directory…" /> : <PatientTable patients={data} />}
      </div>
    </DashboardShell>
  );
}
