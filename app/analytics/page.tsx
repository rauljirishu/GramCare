'use client';

import { DashboardShell } from '@/components/dashboard-shell';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Activity,
  Award
} from 'lucide-react';

export default function AnalyticsPage() {
  const villageStats = [
    { name: 'Rampur Gram Panchayat', count: 12, pct: 44, color: 'bg-blue-600' },
    { name: 'Sitapur Sector', count: 8, pct: 29, color: 'bg-indigo-600' },
    { name: 'Palampur Anganwadi', count: 5, pct: 18, color: 'bg-violet-600' },
    { name: 'Kalyanpur Post', count: 2, pct: 9, color: 'bg-emerald-600' },
  ];

  const riskDistribution = [
    { level: 'Low Risk', pct: 45, count: 12, bg: 'bg-emerald-500', text: 'text-emerald-700' },
    { level: 'Medium Risk', pct: 25, count: 7, bg: 'bg-blue-500', text: 'text-blue-700' },
    { level: 'High Risk', pct: 20, count: 5, bg: 'bg-amber-500', text: 'text-amber-700' },
    { level: 'Critical Risk', pct: 10, count: 3, bg: 'bg-rose-500', text: 'text-rose-700' },
  ];

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 px-3.5 py-1.5 text-xs font-extrabold text-indigo-800">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>PHC & District Health Analytics</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 tracking-tight sm:text-4xl">
            Healthcare Network Performance & Metrics
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600">
            System performance insights for referral velocity, risk distribution, and village coverage.
          </p>
        </div>
      </header>

      {/* Metric Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Referral Completion Rate</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">84.2%</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+6.4% improvement this month</span>
          </p>
        </div>

        <div className="card p-6 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Avg Referral Processing</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">2.4 hrs</p>
          <p className="mt-2 text-xs font-semibold text-blue-700">Reduced from 14.8 hrs (Pre-digital)</p>
        </div>

        <div className="card p-6 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Follow-Up Adherence</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 font-bold">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">78.5%</p>
          <p className="mt-2 text-xs font-semibold text-violet-700">ASHA mobile checkup visits</p>
        </div>

        <div className="card p-6 border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">AI Triage Accuracy</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Award className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900">92.1%</p>
          <p className="mt-2 text-xs font-semibold text-amber-700">Doctor validated risk alignment</p>
        </div>
      </div>

      {/* Visual Charts & Breakdown Grids */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Village Demographics Breakdown */}
        <section className="card p-6 border-slate-200">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            Patient Registration by Village / Sector
          </h2>
          <div className="mt-5 space-y-4">
            {villageStats.map((v) => (
              <div key={v.name}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>{v.name}</span>
                  <span>{v.count} patients ({v.pct}%)</span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full transition-all duration-500`} style={{ width: `${v.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Risk Distribution Breakdown */}
        <section className="card p-6 border-slate-200">
          <h2 className="text-lg font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Activity className="h-5 w-5 text-rose-600" />
            AI Risk Category Distribution
          </h2>
          <div className="mt-5 space-y-4">
            {riskDistribution.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className={r.text}>{r.level}</span>
                  <span>{r.count} patients ({r.pct}%)</span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div className={`h-full ${r.bg} rounded-full transition-all duration-500`} style={{ width: `${r.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
