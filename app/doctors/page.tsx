'use client';

import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getDoctors } from '@/lib/api/doctor';
import type { DoctorUser } from '@/lib/types';
import { Stethoscope, Building2, Clock, Phone, Mail, ShieldCheck, CheckCircle2 } from 'lucide-react';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDoctors()
      .then(data => {
        setDoctors(data);
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
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950/60 px-3.5 py-1.5 text-xs font-black text-blue-800 dark:text-blue-300 border border-blue-300">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              <span>Medical Staff Directory</span>
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
              Verified Doctors & Specialists
            </h1>
            <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-400">
              Roster of qualified clinicians, specialists, and medical officers across the regional network.
            </p>
          </div>

          <span className="rounded-xl bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800 px-4 py-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
            {doctors.length} Doctors Registered
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doc) => (
              <div key={doc.id} className="card p-6 border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-lg transition">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold shrink-0">
                      <Stethoscope className="h-6 w-6" />
                    </span>
                    <div>
                      <h3 className="text-base font-black text-slate-900 dark:text-slate-100">{doc.name}</h3>
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 block">
                        {doc.specialization || doc.department || 'General Medicine'}
                      </span>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 px-2.5 py-1 text-xs font-extrabold text-blue-700 dark:text-blue-300 shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-blue-500" />
                    {doc.status || 'On Duty'}
                  </span>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-bold">{doc.facility?.name || doc.designation || 'District Referral Hospital'}</span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                    <Clock className="h-4 w-4 text-slate-400 shrink-0" />
                    <span>{doc.availability || 'Mon - Sat (8 AM - 4 PM)'}</span>
                  </div>

                  {doc.phone && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                      <span>{doc.phone}</span>
                    </div>
                  )}

                  {doc.email && (
                    <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                      <span className="truncate">{doc.email}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
