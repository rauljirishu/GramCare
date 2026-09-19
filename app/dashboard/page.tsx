'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { getDashboardStats } from '@/lib/api/doctor';
import { currentRole } from '@/lib/auth';
import { GramRole, roleLabels } from '@/lib/grams-data';
import { useSettings } from '@/lib/context/settings-context';
import { uiLabels } from '@/lib/i18n/ui-labels';
import { Activity, ArrowRight, ShieldCheck, Users, WifiOff } from 'lucide-react';

type DashboardStats = Awaited<ReturnType<typeof getDashboardStats>>;
const emptyStats: DashboardStats = { totalPatients: 0, newPatientsThisWeek: 0, highRiskPatients: 0, criticalPatients: 0, pendingReferrals: 0, activeFollowUps: 0, missedFollowUps: 0 };

function cards(role: GramRole, stats: DashboardStats, labels: ReturnType<typeof uiLabels>): [string, string][] {
  if (role === 'worker') return [[labels.authorisedPatients, String(stats.totalPatients)], ['Pending records', String(stats.newPatientsThisWeek)], [labels.highRiskCases, String(stats.highRiskPatients)], [labels.followUpsDue, String(stats.activeFollowUps)]];
  if (role === 'doctor') return [[labels.authorisedPatients, String(stats.totalPatients)], ['Reviews required', String(stats.highRiskPatients)], [labels.criticalCases, String(stats.criticalPatients)], [labels.pendingReferrals, String(stats.pendingReferrals)]];
  if (role === 'hospital') return [['Authorised cases', String(stats.totalPatients)], ['Incoming referrals', String(stats.pendingReferrals)], ['Active follow-ups', String(stats.activeFollowUps)], ['Missed follow-ups', String(stats.missedFollowUps)]];
  if (role === 'patient') return [['My records', String(stats.totalPatients)], [labels.pendingReferrals, String(stats.pendingReferrals)], [labels.followUpsDue, String(stats.activeFollowUps)], ['Missed follow-ups', String(stats.missedFollowUps)]];
  if (role === 'head') return [[labels.authorisedPatients, String(stats.totalPatients)], [labels.highRiskCases, String(stats.highRiskPatients)], [labels.pendingReferrals, String(stats.pendingReferrals)], [labels.followUpsDue, String(stats.activeFollowUps)]];
  return [[labels.authorisedPatients, String(stats.totalPatients)], [labels.highRiskCases, String(stats.highRiskPatients)], [labels.pendingReferrals, String(stats.pendingReferrals)], [labels.followUpsDue, String(stats.activeFollowUps)]];
}

export default function Dashboard() {
  const [role, setRole] = useState<GramRole>('central');
  const [stats, setStats] = useState<DashboardStats>(emptyStats);
  const [error, setError] = useState('');
  const { language } = useSettings();
  const labels = uiLabels(language);

  useEffect(() => {
    currentRole().then(value => { if (value) setRole(value); });
    getDashboardStats().then(setStats).catch(() => setError('Unable to load live dashboard statistics.'));
  }, []);

  const actions = role === 'worker'
    ? [[labels.registerPatient, '/patients'], [labels.recordHealth, '/assessment'], [labels.referrals, '/referrals'], [labels.followUpCare, '/follow-ups']]
    : role === 'patient'
      ? [['My health', '/patient-dashboard'], ['My referrals', '/referrals'], ['Health guidance', '/health-education']]
      : [[labels.patients, '/patients'], [labels.riskReview, '/assessment'], [labels.referrals, '/referrals'], [labels.followUpCare, '/follow-ups']];

  return <DashboardShell>
    <section className="rounded-3xl bg-gradient-to-br from-blue-800 to-slate-900 p-6 text-white sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><div className="flex items-center gap-2 text-xs font-bold text-blue-200"><ShieldCheck className="h-4 w-4" />{roleLabels[role]} · {labels.dashboard}</div><h1 className="mt-3 text-3xl font-black sm:text-4xl">{labels.connectedCare}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-blue-100">{labels.liveStats}</p></div></div></section>
    <div className="mt-5 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs font-semibold text-blue-900"><ShieldCheck className="h-4 w-4" />{labels.patientAccess}</div>
    {error && <p role="alert" className="mt-4 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
    <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{cards(role, stats, labels).map(([name, value], index) => <div className="card p-4" key={name}><div className="flex justify-between text-slate-500"><span className="text-xs font-bold uppercase">{name}</span>{index % 2 ? <Activity className="h-4 w-4 text-emerald-600" /> : <Users className="h-4 w-4 text-blue-600" />}</div><p className="mt-3 text-3xl font-black">{value}</p><p className="mt-1 text-xs text-slate-500">{labels.liveInfo}</p></div>)}</section>
    <section className="mt-7"><h2 className="text-xl font-black">{labels.quickActions}</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{actions.map(([label, href]) => <Link className="card flex items-center justify-between p-5 font-bold hover:border-blue-300" href={href} key={label}>{label}<ArrowRight className="h-4 w-4 text-blue-600" /></Link>)}</div></section>
    <section className="card mt-7 p-5"><h2 className="font-black">{labels.aiRisk}</h2><p className="mt-2 text-sm text-slate-600">{labels.aiRiskDescription}</p></section>
    <p className="mt-6 flex items-center gap-2 text-xs text-slate-500"><WifiOff className="h-4 w-4" />{labels.offlineInfo}</p>
  </DashboardShell>;
}
