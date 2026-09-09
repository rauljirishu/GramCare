'use client';

import { useState } from 'react';
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
  Award,
  Filter,
  Building2,
  Stethoscope,
  Globe,
  Layers
} from 'lucide-react';

export default function AnalyticsPage() {
  const [district, setDistrict] = useState('All Districts');
  const [block, setBlock] = useState('All Blocks');
  const [phc, setPhc] = useState('All PHCs');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const villageStats = [
    { name: 'Rampur Gram Panchayat', count: 18, highRisk: 4, pct: 42, color: 'bg-blue-600' },
    { name: 'Sitapur Sector', count: 12, highRisk: 3, pct: 28, color: 'bg-indigo-600' },
    { name: 'Palampur Anganwadi', count: 8, highRisk: 2, pct: 18, color: 'bg-violet-600' },
    { name: 'Kalyanpur Post', count: 5, highRisk: 1, pct: 12, color: 'bg-emerald-600' },
  ];

  const riskDistribution = [
    { level: 'Low Risk', pct: 45, count: 19, bg: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-300' },
    { level: 'Medium Risk', pct: 25, count: 11, bg: 'bg-blue-500', text: 'text-blue-700 dark:text-blue-300' },
    { level: 'High Risk', pct: 20, count: 8, bg: 'bg-amber-500', text: 'text-amber-700 dark:text-amber-300' },
    { level: 'Critical Emergency', pct: 10, count: 5, bg: 'bg-rose-500', text: 'text-rose-700 dark:text-rose-300' },
  ];

  const mapNodes = [
    { id: 'node-dist', name: 'District Referral Hospital', type: 'hospital', x: 280, y: 80, patients: 24, highRisk: 8 },
    { id: 'node-phc1', name: 'Rampur Sub-Center PHC', type: 'phc', x: 140, y: 180, patients: 18, highRisk: 4 },
    { id: 'node-phc2', name: 'Sitapur Health Center', type: 'phc', x: 420, y: 190, patients: 12, highRisk: 3 },
    { id: 'node-vil1', name: 'Rampur Village 1', type: 'village', x: 80, y: 280, patients: 10, highRisk: 2 },
    { id: 'node-vil2', name: 'Rampur Village 2', type: 'village', x: 200, y: 290, patients: 8, highRisk: 2 },
    { id: 'node-vil3', name: 'Sitapur East', type: 'village', x: 380, y: 290, patients: 7, highRisk: 1 },
    { id: 'node-vil4', name: 'Palampur Sector', type: 'village', x: 480, y: 280, patients: 5, highRisk: 1 },
  ];

  return (
    <DashboardShell>
      <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-950/60 px-3.5 py-1.5 text-xs font-extrabold text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <BarChart3 className="h-4 w-4 text-indigo-600" />
            <span>SIH26133 Rural Health Network Analytics</span>
          </div>
          <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
            Village & PHC Health Analytics
          </h1>
          <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-400">
            Geographic epidemiology, referral turnaround metrics, and privacy-conscious high-risk concentration map.
          </p>
        </div>
      </header>

      {/* Multi-level Geographical Filter Controls */}
      <div className="card p-4 mb-6 flex flex-wrap items-center gap-4 border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-black text-slate-700 dark:text-slate-300">
          <Filter className="h-4 w-4 text-blue-600" />
          <span>Regional Filters:</span>
        </div>
        <select value={district} onChange={e => setDistrict(e.target.value)} className="input text-xs py-1.5 px-3 w-40">
          <option value="All Districts">All Districts</option>
          <option value="Pune District">Pune District</option>
          <option value="Nashik District">Nashik District</option>
        </select>
        <select value={block} onChange={e => setBlock(e.target.value)} className="input text-xs py-1.5 px-3 w-40">
          <option value="All Blocks">All Blocks</option>
          <option value="Haveli Block">Haveli Block</option>
          <option value="Khed Block">Khed Block</option>
        </select>
        <select value={phc} onChange={e => setPhc(e.target.value)} className="input text-xs py-1.5 px-3 w-44">
          <option value="All PHCs">All PHCs</option>
          <option value="Rampur PHC">Rampur Sub-Center PHC</option>
          <option value="Sitapur PHC">Sitapur Health Center</option>
        </select>
      </div>

      {/* Overview Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card p-6 border-slate-200 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Referral Completion Rate</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-600 font-bold">
              <CheckCircle2 className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">84.2%</p>
          <p className="mt-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            <span>+6.4% improvement this month</span>
          </p>
        </div>

        <div className="card p-6 border-slate-200 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Avg Referral Processing</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-600 font-bold">
              <Clock className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">2.4 hrs</p>
          <p className="mt-2 text-xs font-semibold text-blue-700 dark:text-blue-400">Reduced from 14.8 hrs (Pre-digital)</p>
        </div>

        <div className="card p-6 border-slate-200 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Follow-Up Adherence</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-violet-50 text-violet-600 font-bold">
              <Users className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">78.5%</p>
          <p className="mt-2 text-xs font-semibold text-violet-700 dark:text-violet-400">ASHA mobile checkup visits</p>
        </div>

        <div className="card p-6 border-slate-200 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">AI Triage Accuracy</span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-600 font-bold">
              <Award className="h-5 w-5" />
            </span>
          </div>
          <p className="mt-2 text-3xl font-black text-slate-900 dark:text-slate-100">92.1%</p>
          <p className="mt-2 text-xs font-semibold text-amber-700 dark:text-amber-400">Doctor validated risk alignment</p>
        </div>
      </div>

      {/* Interactive Village / PHC Map Visualization Section */}
      <section className="mt-8 card p-6 border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              Interactive Village & PHC Healthcare Topology Map
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Aggregated location density map showing PHC hubs, village sub-centers, and high-risk case concentration.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            Privacy-Aggregated Visual Topology
          </span>
        </div>

        <div className="mt-6 grid lg:grid-cols-3 gap-6 items-center">
          {/* SVG Map Canvas */}
          <div className="lg:col-span-2 relative rounded-2xl bg-slate-950 p-6 overflow-hidden border border-slate-800 min-h-[360px] flex items-center justify-center">
            <svg viewBox="0 0 560 360" className="w-full h-full max-h-[360px]">
              {/* Topology Connecting Lines */}
              <line x1="280" y1="80" x2="140" y2="180" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
              <line x1="280" y1="80" x2="420" y2="190" stroke="#3b82f6" strokeWidth="2" strokeDasharray="4" />
              <line x1="140" y1="180" x2="80" y2="280" stroke="#64748b" strokeWidth="1.5" />
              <line x1="140" y1="180" x2="200" y2="290" stroke="#64748b" strokeWidth="1.5" />
              <line x1="420" y1="190" x2="380" y2="290" stroke="#64748b" strokeWidth="1.5" />
              <line x1="420" y1="190" x2="480" y2="280" stroke="#64748b" strokeWidth="1.5" />

              {/* Render Map Nodes */}
              {mapNodes.map(n => {
                const isSelected = selectedNode === n.id;
                return (
                  <g key={n.id} className="cursor-pointer transition-transform hover:scale-110" onClick={() => setSelectedNode(n.id)}>
                    <circle
                      cx={n.x}
                      cy={n.y}
                      r={n.type === 'hospital' ? 24 : n.type === 'phc' ? 18 : 14}
                      fill={n.type === 'hospital' ? '#3b82f6' : n.type === 'phc' ? '#8b5cf6' : '#10b981'}
                      stroke={isSelected ? '#ffffff' : '#1e293b'}
                      strokeWidth={isSelected ? 4 : 2}
                    />
                    {n.highRisk > 0 && (
                      <circle cx={n.x + 12} cy={n.y - 12} r={7} fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    )}
                    <text x={n.x} y={n.y + (n.type === 'hospital' ? 38 : 32)} textAnchor="middle" fill="#f8fafc" fontSize="10" fontWeight="bold">
                      {n.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Node Inspector Panel */}
          <div className="card p-5 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              <span>Location Details</span>
            </h3>
            {selectedNode ? (
              (() => {
                const nd = mapNodes.find(m => m.id === selectedNode);
                return nd ? (
                  <div className="mt-4 space-y-3 text-xs">
                    <p className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{nd.name}</p>
                    <p className="text-slate-600 dark:text-slate-400 capitalize">Type: <strong>{nd.type}</strong></p>
                    <p className="text-slate-600 dark:text-slate-400">Registered Patients: <strong>{nd.patients}</strong></p>
                    <p className="text-rose-600 font-extrabold">High-Risk Cases: <strong>{nd.highRisk}</strong></p>
                  </div>
                ) : null;
              })()
            ) : (
              <p className="mt-4 text-xs text-slate-500">Click on any node on the map to inspect location metrics.</p>
            )}
          </div>
        </div>
      </section>

      {/* Visual Charts & Breakdown Grids */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="card p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <MapPin className="h-5 w-5 text-blue-600" />
            Patient Registration & High-Risk Count by Village
          </h2>
          <div className="mt-5 space-y-4">
            {villageStats.map((v) => (
              <div key={v.name}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span>{v.name}</span>
                  <span>{v.count} patients ({v.highRisk} high risk)</span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div className={`h-full ${v.color} rounded-full transition-all duration-500`} style={{ width: `${v.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="card p-6 border-slate-200 dark:border-slate-800">
          <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Activity className="h-5 w-5 text-rose-600" />
            AI Risk Category Distribution
          </h2>
          <div className="mt-5 space-y-4">
            {riskDistribution.map((r) => (
              <div key={r.level}>
                <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                  <span className={r.text}>{r.level}</span>
                  <span>{r.count} patients ({r.pct}%)</span>
                </div>
                <div className="mt-1.5 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
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
