'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { RiskBadge } from '@/components/risk-badge';
import { 
  getDashboardStats, 
  getPatients, 
  getReferrals, 
  getNotifications, 
  getAuditLogs 
} from '@/lib/api/doctor';
import { supabase } from '@/lib/supabase/client';
import { AI_DISCLAIMER_TEXT } from '@/lib/ai/risk-predictor';
import type { 
  DashboardStats, 
  PatientRow, 
  Referral, 
  Notification, 
  AuditLog 
} from '@/lib/types';
import { 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Stethoscope, 
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Activity,
  FileText,
  UserPlus,
  Sparkles,
  Info,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [patients, setPatients] = useState<PatientRow[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; role: string }>({ name: '', role: 'doctor' });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [villageFilter, setVillageFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && active) {
          const { data: profile } = await supabase.from('users').select('name, role').eq('id', user.id).single();
          if (profile) {
            setUserProfile({
              name: profile.name || user.user_metadata?.name || '',
              role: profile.role || 'doctor'
            });
          } else if (user.user_metadata?.name) {
            setUserProfile({
              name: user.user_metadata.name,
              role: user.user_metadata.requested_role || 'doctor'
            });
          }
        }

        const [st, pts, refs, notifs, logs] = await Promise.all([
          getDashboardStats(),
          getPatients({ query: search, riskLevel: riskFilter, village: villageFilter, gender: genderFilter }),
          getReferrals('all'),
          getNotifications(),
          getAuditLogs()
        ]);

        if (active) {
          setStats(st);
          setPatients(pts);
          setReferrals(refs);
          setNotifications(notifs);
          setAuditLogs(logs);
          setLoading(false);
        }
      } catch {
        if (active) setLoading(false);
      }
    };

    load();
  }, [search, riskFilter, villageFilter, genderFilter]);

  const isAdmin = userProfile.role === 'admin';
  const greetingName = userProfile.name 
    ? (isAdmin ? `Administrator ${userProfile.name}` : `Dr. ${userProfile.name}`) 
    : (isAdmin ? 'Administrator' : 'Doctor');
  const portalLabel = isAdmin ? 'Health Admin Control Center' : 'Clinician Triage & Control Center';
  const PortalIcon = isAdmin ? ShieldCheck : Stethoscope;

  const cardList = [
    { title: 'Total Patients', value: stats?.totalPatients ?? 0, desc: 'Registered in rural network', href: '/patients', icon: <Users className="h-6 w-6 text-blue-600" />, bg: 'bg-blue-50/80 border-blue-100' },
    { title: 'Critical Patients', value: stats?.criticalPatients ?? 0, desc: 'Immediate clinical review', href: '/high-risk', icon: <Flame className="h-6 w-6 text-rose-600" />, bg: 'bg-rose-50/80 border-rose-100' },
    { title: 'High-Risk Patients', value: stats?.highRiskPatients ?? 0, desc: 'Urgent referral priority', href: '/high-risk', icon: <AlertTriangle className="h-6 w-6 text-amber-600" />, bg: 'bg-amber-50/80 border-amber-100' },
    { title: 'Pending Referrals', value: stats?.pendingReferrals ?? 0, desc: 'Awaiting doctor acceptance', href: '/referrals', icon: <ArrowUpRight className="h-6 w-6 text-violet-600" />, bg: 'bg-violet-50/80 border-violet-100' },
    { title: 'Active Follow-ups', value: stats?.activeFollowUps ?? 0, desc: 'Scheduled clinical visits', href: '/follow-ups', icon: <Clock className="h-6 w-6 text-emerald-600" />, bg: 'bg-emerald-50/80 border-emerald-100' },
    { title: 'Missed Follow-ups', value: stats?.missedFollowUps ?? 0, desc: 'Require worker follow-up', href: '/follow-ups', icon: <Calendar className="h-6 w-6 text-rose-600" />, bg: 'bg-rose-50/80 border-rose-100' },
  ];

  return (
    <DashboardShell>
      {/* Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-blue-700">
            <PortalIcon className="h-4 w-4 text-blue-600" />
            <span>{portalLabel}</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Good day, {greetingName}
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Real-time rural healthcare triage, digital referrals, and AI-assisted risk prioritization.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/workspace"
            className="secondary-btn text-sm py-2.5 px-4 font-bold"
          >
            <UserPlus className="h-4 w-4 text-blue-600" />
            <span>Worker Intake UI</span>
          </Link>

          <Link
            href="/high-risk"
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
          >
            <Flame className="h-4 w-4" />
            <span>Critical Triage ({stats?.criticalPatients ?? 0})</span>
          </Link>
        </div>
      </header>

      {/* Medical AI Decision Support Disclaimer */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 p-4 text-white shadow-md border border-blue-800/40">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
          <div className="text-xs leading-5">
            <span className="font-extrabold text-blue-200 uppercase tracking-wider block mb-0.5">Clinical Decision Support System</span>
            <p className="text-slate-300 font-medium">{AI_DISCLAIMER_TEXT}</p>
          </div>
        </div>
      </div>

      {loading ? (
        <Loading label="Loading doctor dashboard & clinical data…" />
      ) : (
        <>
          {/* Metric Cards Grid */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {cardList.map((c) => (
              <Link
                href={c.href}
                key={c.title}
                className={`card p-5 border ${c.bg} transition duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col justify-between`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{c.title}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{c.value}</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-white shadow-sm border border-slate-100">
                    {c.icon}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold text-slate-600">{c.desc}</p>
              </Link>
            ))}
          </section>

          {/* Priority Patients Workspace & Filters */}
          <section className="mt-8 card p-6 border-slate-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2.5">
                  <Activity className="h-6 w-6 text-rose-600" />
                  Priority Patient Triage (Sorted by Risk)
                </h2>
                <p className="mt-1 text-xs text-slate-500 font-medium">
                  Real-time patient triage queue powered by offline AI clinical risk predictor.
                </p>
              </div>

              {/* Multi-Criteria Filters */}
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name or village…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="input input-icon-left text-xs py-2 text-slate-900"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <Filter className="h-3.5 w-3.5 text-slate-500 ml-2" />
                  <select
                    value={riskFilter}
                    onChange={e => setRiskFilter(e.target.value)}
                    className="bg-transparent text-xs font-bold text-slate-700 py-1.5 px-2 outline-none"
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
                    className="bg-transparent text-xs font-bold text-slate-700 py-1.5 px-2 outline-none border-l border-slate-200"
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
                    className="bg-transparent text-xs font-bold text-slate-700 py-1.5 px-2 outline-none border-l border-slate-200"
                  >
                    <option value="all">All Genders</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Patients Table */}
            {!patients.length ? (
              <div className="py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                  <Users className="h-6 w-6" />
                </span>
                <p className="mt-3 text-base font-extrabold text-slate-800">No matching patients found</p>
                <p className="mt-1 text-xs text-slate-500">Try adjusting your search query or filter selection.</p>
              </div>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                      <th className="py-3 px-4">Patient Name</th>
                      <th className="py-3 px-4">Age / Gender</th>
                      <th className="py-3 px-4">Village</th>
                      <th className="py-3 px-4">AI Risk Triage</th>
                      <th className="py-3 px-4">Warning Signals</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {patients.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3.5 px-4">
                          <Link href={`/patients/${p.id}`} className="font-extrabold text-slate-900 hover:text-blue-700 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                          </Link>
                          {p.emergency_contact && (
                            <span className="block text-[11px] text-slate-400 font-normal mt-0.5">Emergency: {p.emergency_contact}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {p.age} yrs • <span className="capitalize">{p.gender}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700 font-semibold">
                          {p.village || 'Gram Panchayat'}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2">
                            <RiskBadge level={p.latestRisk?.risk_level ?? 'low'} />
                            {p.latestRisk && (
                              <span className="font-mono font-black text-slate-700 text-xs">
                                {p.latestRisk.risk_score}/100
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-xs max-w-xs truncate">
                          {p.latestRisk?.warning_signals?.join(', ') || 'Normal baseline'}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/patients/${p.id}/referral`}
                              className="rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-extrabold text-blue-700 hover:bg-blue-100 transition"
                            >
                              Refer Patient
                            </Link>
                            <Link
                              href={`/patients/${p.id}`}
                              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-200 transition"
                            >
                              View Chart
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Grid Section: Active Referrals Lifecycle & Live Notifications */}
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            {/* Active Referrals Tracker */}
            <section className="card p-6 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <ArrowUpRight className="h-5 w-5 text-violet-600" />
                  Active Clinical Referrals
                </h2>
                <Link href="/referrals" className="text-xs font-extrabold text-blue-700 hover:underline flex items-center gap-1">
                  <span>View All Referrals</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {!referrals.length ? (
                <div className="py-10 text-center text-xs text-slate-500 font-medium">
                  No active referrals. Generated referrals will track here.
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {referrals.slice(0, 4).map((r) => (
                    <li key={r.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-900 text-sm">{r.reason}</span>
                        <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase tracking-wider ${
                          r.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          r.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                          r.status === 'completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {r.status}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 text-xs">
                        Destination: <strong className="text-slate-800">{r.referred_to_text || 'District Hospital'}</strong>
                      </p>
                      <span className="mt-2 block text-[11px] text-slate-400 font-semibold">
                        Generated: {new Date(r.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Audit Log & Activity Feed */}
            <section className="card p-6 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Audit Trail & Recent System Activity
                </h2>
                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Audit Logging Active
                </span>
              </div>

              {!auditLogs.length ? (
                <div className="py-10 text-center text-xs text-slate-500 font-medium">
                  No recent system events logged.
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {auditLogs.slice(0, 5).map((l) => (
                    <li key={l.id} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-white p-3 text-xs">
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-blue-50 text-blue-700 font-bold">
                        <FileText className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="font-extrabold text-slate-900">{l.action.replace(/_/g, ' ')}</p>
                        <p className="mt-0.5 text-slate-600 text-[11px]">
                          Entity: <span className="font-semibold text-slate-800">{l.entity_type}</span> ({l.entity_id || 'system'})
                        </p>
                        <span className="text-[10px] text-slate-400 font-medium block mt-1">
                          {new Date(l.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
