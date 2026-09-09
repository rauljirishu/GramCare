'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  CalendarCheck, 
  ArrowUpRight,
  UserPlus,
  BarChart3,
  LogOut,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

const nav = [
  { href: '/dashboard', label: 'Doctor Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: '/patients', label: 'Patient Records', icon: <Users className="h-4 w-4" /> },
  { href: '/high-risk', label: 'High-Risk Triage', icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> },
  { href: '/referrals', label: 'Digital Referrals', icon: <ArrowUpRight className="h-4 w-4 text-violet-400" /> },
  { href: '/follow-ups', label: 'Follow-up Tasks', icon: <CalendarCheck className="h-4 w-4 text-emerald-400" /> },
  { href: '/workspace', label: 'ASHA Mobile Intake', icon: <UserPlus className="h-4 w-4 text-blue-400" /> },
  { href: '/analytics', label: 'Health Analytics', icon: <BarChart3 className="h-4 w-4 text-indigo-400" /> },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const [userRole, setUserRole] = useState<'doctor' | 'admin' | 'asha'>('doctor');

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
        if (profile?.role) {
          setUserRole(profile.role);
        }
      }
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/');
  }

  const portalTitle = userRole === 'admin' ? 'Health Admin Control Center' : 'Doctor & Clinical Triage Portal';
  const PortalIcon = userRole === 'admin' ? ShieldCheck : Stethoscope;

  return (
    <div className="min-h-screen md:flex bg-slate-50">
      <aside className="border-b border-slate-800 bg-slate-900 px-6 py-7 text-white md:min-h-screen md:w-72 md:border-b-0 flex flex-col justify-between">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-base font-black text-white shadow-md">+</span>
            Gram<span className="text-blue-400">Care</span>
          </Link>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-200 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur">
            <PortalIcon className="h-4 w-4 text-blue-400" />
            <span>{portalTitle}</span>
          </div>

          <nav className="mt-7 flex gap-2 overflow-x-auto md:block md:space-y-1.5">
            {nav.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-xs font-extrabold transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-xs font-extrabold text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 p-5 sm:p-9">
        {children}
      </main>
    </div>
  );
}
