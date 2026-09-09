'use client';

import Link from 'next/link';
import { RiskBadge } from '@/components/risk-badge';
import type { PatientRow } from '@/lib/types';
import { ChevronRight, Sparkles, User, UserPlus, RefreshCw } from 'lucide-react';

interface PatientTableProps {
  patients: PatientRow[];
  onRegisterClick?: () => void;
  onLoadDemoClick?: () => void;
}

export function PatientTable({ patients, onRegisterClick, onLoadDemoClick }: PatientTableProps) {
  if (!patients.length) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-3xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 font-bold mb-4 border border-blue-200">
          <User className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-slate-100">No patients registered yet</h3>
        <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
          Get started by registering a new real patient or loading the 6 canonical SIH demo records.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {onRegisterClick && (
            <button
              onClick={onRegisterClick}
              className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md"
            >
              <UserPlus className="h-4 w-4" />
              <span>+ Register Patient</span>
            </button>
          )}

          {onLoadDemoClick && (
            <button
              onClick={onLoadDemoClick}
              className="secondary-btn text-xs py-2.5 px-4 font-bold border border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
            >
              <RefreshCw className="h-4 w-4 text-blue-600" />
              <span>Load Demo Patients</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 dark:border-slate-800 text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <tr>
            <th className="p-3.5">Patient ID</th>
            <th className="p-3.5">Patient Name</th>
            <th className="p-3.5">Age / Gender</th>
            <th className="p-3.5">Village / Gram Panchayat</th>
            <th className="p-3.5">Triage Risk Level</th>
            <th className="p-3.5 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {patients.map(p => {
            const patientCode = p.patient_code || (p.is_demo ? `GC-DEMO-${p.id.slice(0, 3).toUpperCase()}` : `GC-2026-${p.id.slice(0, 4).toUpperCase()}`);
            return (
              <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/50 transition">
                <td className="p-3.5 font-mono text-xs font-bold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span>{patientCode}</span>
                    {p.is_demo && (
                      <span className="rounded bg-amber-100 dark:bg-amber-950 px-1.5 py-0.5 text-[10px] font-black text-amber-800 dark:text-amber-300 border border-amber-300">
                        DEMO
                      </span>
                    )}
                  </div>
                </td>

                <td className="p-3.5">
                  <Link href={`/patients/${p.id}`} className="font-extrabold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition">
                    {p.name}
                  </Link>
                  {p.existing_conditions && p.existing_conditions.length > 0 && (
                    <span className="block text-[11px] font-medium text-slate-400 truncate max-w-xs">
                      {p.existing_conditions.join(', ')}
                    </span>
                  )}
                </td>

                <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300 capitalize">
                  {p.age} yrs • {p.gender}
                </td>

                <td className="p-3.5 text-slate-600 dark:text-slate-400 font-semibold">
                  {p.village || '—'} {p.gram_panchayat ? `(${p.gram_panchayat})` : ''}
                </td>

                <td className="p-3.5">
                  <RiskBadge level={p.latestRisk?.risk_level ?? null} />
                </td>

                <td className="p-3.5 text-right">
                  <Link
                    className="inline-flex items-center gap-1 font-extrabold text-xs text-blue-600 dark:text-blue-400 hover:underline"
                    href={`/patients/${p.id}`}
                  >
                    <span>View Record</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
