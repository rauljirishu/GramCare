'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getFacilities } from '@/lib/api/doctor';
import type { Facility } from '@/lib/types';
import { Building2, MapPin, Activity, ShieldCheck, Tag, Plus } from 'lucide-react';

export default function FacilitiesPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getFacilities()
      .then(data => {
        setFacilities(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-3.5 py-1.5 text-xs font-black text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              <Building2 className="h-4 w-4 text-emerald-600" />
              <span>Healthcare Infrastructure Network</span>
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
              Healthcare Facilities Catalog
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Directory of connected Primary Health Centres (PHC), Community Health Centres (CHC), and District Hospitals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 px-4 py-2 text-xs font-black text-blue-700 dark:text-blue-300">
              {facilities.length} Connected Facilities
            </span>
          </div>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {facilities.map((fac) => (
              <div key={fac.id} className="card p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                      <Building2 className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-slate-100">{fac.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-500 dark:text-slate-400">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <span>{fac.village || 'Grampur District'}, {fac.address}</span>
                      </div>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 text-xs font-extrabold text-emerald-700 dark:text-emerald-300 shrink-0">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    {fac.status || 'Active'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Facility Type</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block">
                      {fac.facility_type || 'Primary Care Center'}
                    </span>
                  </div>
                  <div>
                    <span className="block font-bold text-slate-400 uppercase text-[10px]">Facility Code</span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-200 mt-0.5 block font-mono">
                      {fac.code || 'PHC-001'}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <span className="block font-bold text-slate-400 uppercase text-[10px] mb-2">Available Clinical Services</span>
                  <div className="flex flex-wrap gap-1.5">
                    {(fac.services || ['General Medicine', 'Vitals Screening', 'Emergency First Aid']).map((srv, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 dark:text-slate-300">
                        <Tag className="h-3 w-3 text-slate-400" />
                        {srv}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
