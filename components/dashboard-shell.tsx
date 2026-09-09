'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useTranslation } from '@/lib/i18n/use-translation';
import { DashboardHeader } from '@/components/dashboard-header';
import { 
  LayoutDashboard, 
  Users, 
  AlertTriangle, 
  CalendarCheck, 
  ArrowUpRight,
  UserPlus,
  BarChart3,
  User,
  Settings,
  LogOut,
  Stethoscope,
  ShieldCheck
} from 'lucide-react';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { t } = useTranslation();
  const [userRole, setUserRole] = useState<'doctor' | 'admin' | 'asha'>('doctor');

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('role').eq('id', user.id).single();
          if (profile?.role) {
            setUserRole(profile.role);
          }
        }
      } catch {
        // Fallback
      }
    })();
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const nav = [
    { href: '/dashboard', labelKey: 'navDashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
    { href: '/patients', labelKey: 'navPatients', icon: <Users className="h-4 w-4" /> },
    { href: '/high-risk', labelKey: 'navHighRisk', icon: <AlertTriangle className="h-4 w-4 text-rose-400" /> },
    { href: '/referrals', labelKey: 'navReferrals', icon: <ArrowUpRight className="h-4 w-4 text-violet-400" /> },
    { href: '/follow-ups', labelKey: 'navFollowUps', icon: <CalendarCheck className="h-4 w-4 text-emerald-400" /> },
    { href: '/workspace', labelKey: 'navWorkspace', icon: <UserPlus className="h-4 w-4 text-blue-400" /> },
    { href: '/analytics', labelKey: 'navAnalytics', icon: <BarChart3 className="h-4 w-4 text-indigo-400" /> },
    { href: '/profile', labelKey: 'navProfile', icon: <User className="h-4 w-4 text-blue-300" /> },
    { href: '/settings', labelKey: 'navSettings', icon: <Settings className="h-4 w-4 text-indigo-300" /> },
  ];

  const portalTitle = userRole === 'admin' ? t('adminPortal') : t('doctorPortal');
  const PortalIcon = userRole === 'admin' ? ShieldCheck : Stethoscope;

  return (
    <div className="min-h-screen md:flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar */}
      <aside className="border-b border-slate-800 bg-slate-900 px-6 py-7 text-white md:min-h-screen md:w-72 md:border-b-0 flex flex-col justify-between shrink-0">
        <div>
          <Link href="/dashboard" className="flex items-center gap-2.5 text-2xl font-black tracking-tight text-white">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-base font-black text-white shadow-md">+</span>
            Gram<span className="text-blue-400">Care</span>
          </Link>
          
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-blue-200 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur">
            <PortalIcon className="h-4 w-4 text-blue-400 shrink-0" />
            <span className="truncate">{portalTitle}</span>
          </div>

          {/* Localized Sidebar Navigation */}
          <nav className="mt-7 flex gap-2 overflow-x-auto md:block md:space-y-1.5">
            {nav.map((item) => {
              const active = path === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-extrabold transition-all duration-200 ${
                    active
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]'
                      : 'text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-800">
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-extrabold text-slate-400 hover:bg-rose-500/20 hover:text-rose-300 transition"
          >
            <LogOut className="h-4 w-4" />
            <span>{t('navSignOut')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area with Header */}
      <div className="min-w-0 flex-1 flex flex-col">
        <DashboardHeader />

        <main className="flex-1 p-5 sm:p-9">
          {children}
        </main>
      </div>
    </div>
  );
}
