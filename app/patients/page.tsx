'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { PatientTable } from '@/components/patient-table';
import { PatientRegistrationModal } from '@/components/patient-registration-modal';
import { getPatients } from '@/lib/api/doctor';
import { syncEngine } from '@/lib/offline/sync-engine';
import type { PatientRow } from '@/lib/types';
import { Users, Search, Plus, Filter, Map, RotateCcw, MapPin, CloudUpload, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';

const riskValues = ['all', 'critical', 'high', 'medium', 'low'];

export default function PatientsPage() {
  const [query, setQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [referralFilter, setReferralFilter] = useState('all');
  const [syncFilter, setSyncFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('all');
  const [data, setData] = useState<PatientRow[] | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  async function loadPatients() {
    setData(null);
    const remote = await getPatients({ demoFilter: 'all' });
    const local = syncEngine.getLocalPatients()
      .filter(p => p.id.startsWith('loc_') || !remote.some(r => r.id === p.id || r.id === p.server_id));
    const localRows: PatientRow[] = local.map(patient => ({ ...patient, latestRisk: null, pendingSync: patient.sync_status !== 'synced' }));
    setData([...localRows, ...remote]);
  }

  useEffect(() => {
    loadPatients();
    return syncEngine.subscribe(() => { loadPatients(); });
  }, []);

  const villages = useMemo(() => [...new Set((data || []).map(p => p.village).filter(Boolean) as string[])].sort(), [data]);
  const patients = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return (data || []).filter(p => {
      const matchesQuery = !normalized || [p.name, p.patient_code, p.phone, p.village].some(value => value?.toLowerCase().includes(normalized));
      const risk = p.latestRisk?.risk_level || 'low';
      const matchesRisk = riskFilter === 'all' || risk === riskFilter;
      const matchesVillage = villageFilter === 'all' || p.village?.toLowerCase() === villageFilter.toLowerCase();
      const matchesGender = genderFilter === 'all' || p.gender?.toLowerCase() === genderFilter;
      const matchesReferral = referralFilter === 'all' || (p.referral_status || 'none') === referralFilter;
      const matchesSync = syncFilter === 'all' || (p.sync_status || 'synced') === syncFilter;
      const hasLocation = p.latitude != null && p.longitude != null;
      const matchesLocation = locationFilter === 'all' || (locationFilter === 'available' ? hasLocation : !hasLocation);
      return matchesQuery && matchesRisk && matchesVillage && matchesGender && matchesReferral && matchesSync && matchesLocation;
    });
  }, [data, query, riskFilter, villageFilter, genderFilter, referralFilter, syncFilter, locationFilter]);

  const stats = useMemo(() => {
    const records = data || [];
    return {
      total: records.length,
      high: records.filter(p => p.latestRisk?.risk_level === 'high' || p.latestRisk?.risk_level === 'critical').length,
      medium: records.filter(p => p.latestRisk?.risk_level === 'medium').length,
      low: records.filter(p => p.latestRisk?.risk_level === 'low' || !p.latestRisk).length,
      referral: records.filter(p => p.referral_status && p.referral_status !== 'none').length,
      followUps: records.filter(p => p.next_follow_up_date && p.next_follow_up_date <= new Date().toISOString().slice(0, 10)).length,
      gps: records.filter(p => p.latitude != null && p.longitude != null).length,
      pending: syncEngine.getPendingCount(),
    };
  }, [data]);

  function resetFilters() {
    setQuery(''); setRiskFilter('all'); setVillageFilter('all'); setGenderFilter('all'); setReferralFilter('all'); setSyncFilter('all'); setLocationFilter('all');
  }

  const metricCards = [
    ['Total Patients', stats.total, Users, 'text-blue-600'], ['High Risk', stats.high, AlertTriangle, 'text-rose-600'], ['Medium Risk', stats.medium, AlertTriangle, 'text-amber-600'], ['Low Risk', stats.low, CheckCircle2, 'text-emerald-600'],
    ['Referrals', stats.referral, AlertTriangle, 'text-violet-600'], ['Due Follow-ups', stats.followUps, Clock, 'text-orange-600'], ['GPS Enabled', stats.gps, MapPin, 'text-blue-600'], ['Pending Sync', stats.pending, CloudUpload, 'text-amber-600']
  ] as const;

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 dark:bg-blue-950 px-3.5 py-1.5 text-xs font-extrabold text-blue-700 dark:text-blue-300"><Users className="h-4 w-4" /><span>Digital Health Records Registry</span></div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">Patient Directory</h1>
          <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-400">Search rural patient records, care risk, referral status, and location coverage.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/patients/map" className="secondary-btn text-xs py-2.5 px-4 font-bold"><Map className="h-4 w-4 text-blue-600" /> Patient Map</Link>
          <button onClick={() => setShowRegisterModal(true)} className="primary-btn text-xs py-2.5 px-4 font-bold shadow-md"><Plus className="h-4 w-4" /> Register New Patient</button>
        </div>
      </header>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
        {metricCards.map(([label, value, Icon, color]) => <div key={label} className="card p-3 border-slate-200"><div className="flex items-center justify-between"><span className="text-[10px] font-black uppercase text-slate-500">{label}</span><Icon className={`h-4 w-4 ${color}`} /></div><p className="mt-1 text-2xl font-black text-slate-900">{value}</p></div>)}
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-100 p-3 dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative w-full lg:w-80"><Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" /><input className="input input-icon-left text-xs py-2.5" style={{ paddingLeft: '2.75rem' }} placeholder="Search name, patient ID, village, phone" value={query} onChange={e => setQuery(e.target.value)} /></div>
          <div className="flex flex-wrap gap-2"><Filter className="ml-1 mt-2 h-4 w-4 text-slate-500" />
            <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All risks</option>{riskValues.slice(1).map(v => <option key={v} value={v}>{v[0].toUpperCase() + v.slice(1)}</option>)}</select>
            <select value={genderFilter} onChange={e => setGenderFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All genders</option><option value="female">Female</option><option value="male">Male</option><option value="other">Other</option></select>
            <select value={villageFilter} onChange={e => setVillageFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All villages</option>{villages.map(v => <option key={v} value={v}>{v}</option>)}</select>
            <select value={referralFilter} onChange={e => setReferralFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All referrals</option><option value="none">No referral</option><option value="pending">Pending</option><option value="accepted">Accepted</option><option value="completed">Completed</option></select>
            <select value={syncFilter} onChange={e => setSyncFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All sync states</option><option value="pending">Pending Sync</option><option value="synced">Synced</option><option value="failed">Failed</option></select>
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="input w-auto bg-white text-xs py-2"><option value="all">All locations</option><option value="available">GPS available</option><option value="missing">Location missing</option></select>
            <button onClick={resetFilters} className="secondary-btn text-xs py-2 px-3"><RotateCcw className="h-3.5 w-3.5" /> Reset Filters</button>
          </div>
        </div>
      </div>

      <div className="card p-6 border-slate-200">{!data ? <Loading label="Loading patient directory…" /> : <PatientTable patients={patients} onRegisterClick={() => setShowRegisterModal(true)} />}</div>

      {showRegisterModal && <PatientRegistrationModal onClose={() => setShowRegisterModal(false)} onSuccess={() => loadPatients()} />}
    </DashboardShell>
  );
}
