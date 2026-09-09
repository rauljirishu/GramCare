'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { DashboardShell } from '@/components/dashboard-shell';
import { Loading } from '@/components/loading';
import { getDashboardStats, getNotifications } from '@/lib/api/doctor';
import { supabase } from '@/lib/supabase/client';
import type { DashboardStats, Notification } from '@/lib/types';
import { 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Stethoscope
} from 'lucide-react';

const cards = [
  { title: 'Total Patients', description: 'All registered patients in network', href: '/patients', key: 'totalPatients' as const, icon: <Users className="h-6 w-6 text-blue-600" />, color: 'bg-blue-50/80 border-blue-100' },
  { title: 'High-Risk Patients', description: 'Require immediate clinical attention', href: '/high-risk', key: 'highRiskPatients' as const, icon: <AlertTriangle className="h-6 w-6 text-rose-600" />, color: 'bg-rose-50/80 border-rose-100' },
  { title: 'Pending Referrals', description: 'Awaiting doctor review & triage', href: '/patients', key: 'pendingReferrals' as const, icon: <ArrowUpRight className="h-6 w-6 text-violet-600" />, color: 'bg-violet-50/80 border-violet-100' },
  { title: 'Follow-ups Due', description: 'Scheduled for today or earlier', href: '/follow-ups', key: 'followUpsDue' as const, icon: <Clock className="h-6 w-6 text-emerald-600" />, color: 'bg-emerald-50/80 border-emerald-100' },
] as const;

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; role: 'doctor' | 'admin' | 'asha' }>({ name: '', role: 'doctor' });
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('name, role').eq('id', user.id).single();
          if (profile && active) {
            setUserProfile({
              name: profile.name || user.user_metadata?.name || '',
              role: profile.role || 'doctor'
            });
          } else if (user.user_metadata?.name && active) {
            setUserProfile({
              name: user.user_metadata.name,
              role: user.user_metadata.requested_role || 'doctor'
            });
          }
        }

        const [st, notifs] = await Promise.all([
          getDashboardStats(),
          getNotifications()
        ]);
        if (active) {
          setStats(st);
          setNotifications(notifs);
        }
      } catch {
        if (active) setError('Unable to connect to live clinical network.');
      }
    };

    load();
    const id = setInterval(load, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const isAdmin = userProfile.role === 'admin';
  const greetingName = userProfile.name ? (isAdmin ? `Administrator ${userProfile.name}` : `Dr. ${userProfile.name}`) : (isAdmin ? 'Administrator' : 'Doctor');
  const portalLabel = isAdmin ? 'Health Admin Control Center' : 'Clinician Control Center';
  const PortalIcon = isAdmin ? ShieldCheck : Stethoscope;

  return (
    <DashboardShell>
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3.5 py-1.5 text-xs font-extrabold text-blue-700">
            <PortalIcon className="h-4 w-4 text-blue-600" />
            <span>{portalLabel}</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Good day, {greetingName}
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            Real-time clinical overview of synced patient records, high-risk triage, and care referrals.
          </p>
        </div>

        <Link
          href="/high-risk"
          className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-rose-700 transition"
        >
          <AlertTriangle className="h-5 w-5" />
          <span>High-Risk Patients ({stats?.highRiskPatients ?? 0})</span>
        </Link>
      </header>

      {error ? (
        <div role="alert" className="card p-5 text-sm font-bold text-rose-700 bg-rose-50 border-rose-200">
          {error}
        </div>
      ) : !stats ? (
        <Loading label="Loading clinical overview…" />
      ) : (
        <>
          {/* Metric Cards */}
          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((c) => (
              <Link
                href={c.href}
                key={c.title}
                className={`card p-6 border ${c.color} transition duration-200 hover:-translate-y-1 hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{c.title}</p>
                    <p className="mt-2 text-4xl font-black text-slate-900">{stats[c.key]}</p>
                  </div>
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-sm border border-slate-100">
                    {c.icon}
                  </span>
                </div>
                <p className="mt-3 text-xs font-semibold text-slate-600">{c.description}</p>
              </Link>
            ))}
          </section>

          {/* Quick Actions & Notifications Grid */}
          <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_.9fr]">
            <section className="card p-7 border-slate-200">
              <h2 className="font-black text-slate-900 text-xl flex items-center gap-2.5">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Clinical Quick Actions
              </h2>
              <p className="mt-1 text-sm text-slate-600">Fast workflows for clinical triage, referral management, and scheduled checkups.</p>
              
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/high-risk"
                  className="primary-btn !bg-rose-600 hover:!bg-rose-700 text-sm py-3 px-5 font-bold"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Review High-Risk Patients</span>
                </Link>
                
                <Link
                  href="/patients"
                  className="secondary-btn text-sm py-3 px-5 font-bold"
                >
                  <Users className="h-5 w-5 text-blue-600" />
                  <span>View All Synced Patients</span>
                </Link>

                <Link
                  href="/follow-ups"
                  className="secondary-btn text-sm py-3 px-5 font-bold"
                >
                  <Clock className="h-5 w-5 text-emerald-600" />
                  <span>Manage Scheduled Follow-ups</span>
                </Link>
              </div>
            </section>

            {/* Live Clinical Alerts & Notifications */}
            <section className="card p-7 border-slate-200">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h2 className="font-black text-slate-900 text-lg flex items-center gap-2">
                  <Bell className="h-5 w-5 text-amber-500" />
                  Live Triage Alerts & Notifications
                </h2>
                <span className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                  Live Network
                </span>
              </div>

              {!notifications.length ? (
                <div className="py-10 text-center text-sm font-medium text-slate-500">
                  No active clinical notifications. Urgent triage alerts will appear here automatically.
                </div>
              ) : (
                <ul className="mt-4 space-y-3">
                  {notifications.map((n) => (
                    <li key={n.id} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-xs">
                      <p className="font-bold text-slate-900 text-sm">{n.title}</p>
                      <p className="mt-1 text-slate-600 leading-5 text-xs">{n.message}</p>
                      <span className="mt-2 block text-[11px] text-slate-400 font-semibold">
                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
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
