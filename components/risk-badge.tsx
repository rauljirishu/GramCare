import type { RiskLevel } from '@/lib/types';

export function RiskBadge({ level }: { level: RiskLevel | null }) {
  if (!level) return <span className="text-slate-400 font-semibold text-xs">Not assessed</span>;
  const styles: Record<RiskLevel, string> = {
    critical: 'bg-rose-600 text-white shadow-xs font-black',
    high: 'bg-rose-100 text-rose-800 border border-rose-200 font-black',
    medium: 'bg-amber-100 text-amber-800 border border-amber-200 font-black',
    low: 'bg-emerald-100 text-emerald-800 border border-emerald-200 font-black'
  };
  const c = styles[level] || 'bg-slate-100 text-slate-700';
  return (
    <span className={`rounded-full px-3 py-1 text-xs uppercase tracking-wider ${c}`}>
      {level}
    </span>
  );
}
