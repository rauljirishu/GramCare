'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { NearbyFacilities } from '@/components/nearby-facilities';
import { createReferral, getPatientDetail } from '@/lib/api/doctor';
import type { Patient } from '@/lib/types';
import type { NearbyFacilityResult } from '@/lib/location/types';
import { MapPin, ArrowUpRight, ChevronLeft, Building2 } from 'lucide-react';

export default function ReferralPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState('');
  const [facilityId, setFacilityId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [priority, setPriority] = useState<'routine' | 'priority' | 'urgent'>('routine');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPatientDetail(id)
      .then((res) => setPatient(res.patient))
      .catch(() => setError('Could not load patient record.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSelectFacility = (fac: NearbyFacilityResult) => {
    setFacilityId(fac.id);
    setDestination(fac.name);
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!destination.trim()) {
      setError('Please select or enter a destination facility.');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      await createReferral({
        patientId: id,
        facilityId: facilityId ?? undefined,
        destination: destination.trim(),
        reason,
        priority,
      });
      setMessage('Referral created and marked pending.');
      setTimeout(() => router.push(`/patients/${id}`), 700);
    } catch {
      setError('Could not create the referral. Check your access and destination.');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <DashboardShell>
        <Loading label="Loading patient and referral workflow…" />
      </DashboardShell>
    );
  }

  const locationLabel = patient
    ? [patient.village, patient.district, patient.state].filter(Boolean).join(', ') || 'Location not set'
    : '';

  return (
    <DashboardShell>
      <Link href={`/patients/${id}`} className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline mb-4">
        <ChevronLeft className="h-4 w-4" />
        Back to Patient
      </Link>

      <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">Create Referral</h1>
      <p className="mt-1 text-sm text-slate-500">
        Select a destination facility based on patient location. Facilities are sorted by distance — you must confirm the selection.
      </p>

      {/* Referral workflow steps */}
      <div className="mt-6 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-500">
        <span className="rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1.5 flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5" />
          Patient Location
        </span>
        <span>→</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">Nearest / Selected PHC</span>
        <span>→</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">Specialist / Hospital</span>
        <span>→</span>
        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5">Follow-up</span>
      </div>

      {patient && (
        <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-4">
          <p className="text-xs font-black text-slate-700 dark:text-slate-300">{patient.name}</p>
          <p className="text-xs font-semibold text-slate-500 mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {locationLabel}
          </p>
          {patient.address && (
            <p className="text-[10px] font-semibold text-slate-400 mt-0.5">{patient.address}</p>
          )}
        </div>
      )}

      <form onSubmit={submit} className="mt-6 max-w-2xl space-y-5">
        {message && (
          <p className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-sm font-semibold text-emerald-800">{message}</p>
        )}
        {error && (
          <p className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-sm font-semibold text-rose-800">{error}</p>
        )}

        <NearbyFacilities
          latitude={patient?.latitude}
          longitude={patient?.longitude}
          onSelect={handleSelectFacility}
          selectedFacilityId={facilityId}
        />

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
            <Building2 className="inline h-4 w-4 mr-1" />
            Receiving facility or doctor *
          </label>
          <input
            required
            className="input mt-1"
            placeholder="Select from nearby list above or enter manually"
            value={destination}
            onChange={(e) => {
              setDestination(e.target.value);
              setFacilityId(null);
            }}
          />
          <p className="mt-1 text-[10px] font-semibold text-slate-400">
            Destination is never auto-selected — choose the appropriate facility for this referral.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as typeof priority)}
            className="input mt-1 bg-white dark:bg-slate-900"
          >
            <option value="routine">Routine</option>
            <option value="priority">Priority</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Clinical reason *</label>
          <textarea
            required
            minLength={3}
            className="input mt-1 min-h-28"
            placeholder="Reason for referral and relevant clinical context"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button
          disabled={busy}
          type="submit"
          className="primary-btn py-2.5 px-5 text-sm font-bold disabled:opacity-60"
        >
          <ArrowUpRight className="h-4 w-4" />
          {busy ? 'Creating…' : 'Create pending referral'}
        </button>
      </form>
    </DashboardShell>
  );
}
