'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { LocationMap } from '@/components/location-map';
import { getPatients } from '@/lib/api/doctor';
import { syncEngine } from '@/lib/offline/sync-engine';
import type { PatientRow } from '@/lib/types';
import { ArrowLeft, MapPin, Navigation } from 'lucide-react';

export default function PatientMapPage() {
  const [patients, setPatients] = useState<PatientRow[] | null>(null);

  useEffect(() => {
    (async () => {
      const remote = await getPatients({ demoFilter: 'all' });
      const local = syncEngine.getLocalPatients().filter(p => p.id.startsWith('loc_') || !remote.some(r => r.id === p.id || r.id === p.server_id));
      setPatients([...local.map(p => ({ ...p, latestRisk: null })), ...remote]);
    })();
  }, []);

  const located = (patients || []).filter(p => p.latitude != null && p.longitude != null);
  const markers = located.map(p => {
    const level = p.latestRisk?.risk_level;
    return {
      lat: p.latitude as number,
      lng: p.longitude as number,
      color: level === 'high' || level === 'critical' ? 'red' as const : level === 'medium' ? 'amber' as const : 'green' as const,
      label: `${p.patient_code || p.id.slice(0, 8).toUpperCase()} · ${level || 'low'} risk · ${p.village || 'Village not recorded'}`,
      href: `/patients/${p.id}`,
    };
  });

  return (
    <DashboardShell>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><Link href="/patients" className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline"><ArrowLeft className="h-4 w-4" /> Back to Patient Directory</Link><h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100">Patient Map</h1><p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Stored patient coordinates across the care area. Select a marker to open the record.</p></div>
        <div className="flex items-center gap-3 text-xs font-bold text-slate-600"><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Low</span><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-amber-500" /> Medium</span><span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-rose-500" /> High</span></div>
      </div>
      {!patients ? <Loading label="Loading patient locations…" /> : <>
        <div className="card overflow-hidden border-slate-200 p-2"><LocationMap markers={markers} height="560px" /></div>
        <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-slate-500"><Navigation className="h-4 w-4 text-blue-600" /><span>{located.length} of {patients.length} patients have stored coordinates.</span><MapPin className="ml-2 h-4 w-4 text-slate-400" /><span>Map URLs contain coordinates only, never patient names or phone numbers.</span></div>
      </>}
    </DashboardShell>
  );
}