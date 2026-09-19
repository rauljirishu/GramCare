'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GramRole, roleLabels } from '@/lib/grams-data';
import { currentRole } from '@/lib/auth';
import { languageOptions } from '@/lib/i18n/translations';
import { uiLabels } from '@/lib/i18n/ui-labels';
import { useSettings } from '@/lib/context/settings-context';
import { Bell, BookOpen, CalendarDays, ClipboardList, FileText, HeartPulse, LayoutDashboard, LogOut, Map, Menu, ShieldCheck, Users, Wifi, X } from 'lucide-react';
import { syncEngine } from '@/lib/offline/sync-engine';

const allNav = [
  ['dashboard', 'Dashboard', LayoutDashboard, ['central', 'head', 'worker', 'doctor', 'hospital']],
  ['patient-dashboard', 'My Health Dashboard', LayoutDashboard, ['patient']],
  ['patients', 'Patients', Users, ['central', 'head', 'worker', 'doctor']],
  ['assessment', 'Risk screening', HeartPulse, ['central', 'head', 'worker', 'doctor']],
  ['referrals', 'Referrals', ClipboardList, ['central', 'head', 'worker', 'doctor', 'hospital', 'patient']],
  ['follow-ups', 'Follow-ups', CalendarDays, ['central', 'head', 'worker', 'doctor', 'hospital', 'patient']],
  ['hospital', 'Hospital Queue', ClipboardList, ['central', 'hospital']],
  ['maternal-care', 'Maternal Care', HeartPulse, ['central', 'head', 'worker', 'patient']],
  ['health-education', 'Health Guidance', BookOpen, ['central', 'head', 'worker', 'doctor', 'hospital', 'patient']],
  ['map', 'Nearby Care', Map, ['central', 'head', 'worker', 'doctor', 'hospital', 'patient']],
  ['resources', 'Resource Demands', ClipboardList, ['central', 'head', 'worker']],
  ['health-camps', 'Health Camps', CalendarDays, ['central', 'head', 'worker', 'patient']],
  ['outbreaks', 'Outbreaks', ClipboardList, ['central', 'head', 'worker']],
  ['workers', 'Workers', Users, ['central', 'head']],
  ['reports', 'Reports', FileText, ['central', 'head']],
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useSettings();
  const [role, setRole] = useState<GramRole>('central');
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    currentRole().then(found => {
      if (found) {
        setRole(found);
      } else {
        // Check local storage before redirecting to login
        const storedRole = typeof window !== 'undefined' ? (localStorage.getItem('gramcare_role') || localStorage.getItem('demo_role')) : null;
        if (storedRole) {
          const { uiRoleFor } = require('@/lib/auth');
          setRole(uiRoleFor(storedRole));
        } else {
          router.replace('/login');
        }
      }
    });
    return syncEngine.subscribe((state, count) => { setOnline(state); setPending(count); });
  }, [router]);

  const labels = uiLabels(language);
  const navLabels: Record<string, string> = { 
    dashboard: labels.dashboard, 
    'patient-dashboard': 'My Health Dashboard',
    patients: labels.patients, 
    assessment: labels.assessment, 
    referrals: labels.referrals, 
    'follow-ups': labels.followUps, 
    'maternal-care': labels.maternalCare, 
    'health-education': labels.healthGuidance, 
    map: labels.nearbyCare, 
    resources: labels.requests, 
    'health-camps': labels.healthCamps, 
    outbreaks: labels.outbreaks, 
    workers: labels.workers 
  };
  
  const nav = allNav.filter(item => (item[3] as readonly GramRole[]).includes(role));

  async function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gramcare_role');
      localStorage.removeItem('demo_role');
    }
    const { supabase } = await import('@/lib/supabase/client');
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const logoHref = role === 'patient' ? '/patient-dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-slate-900 md:flex">
      {/* Sidebar Navigation */}
      <aside className={`fixed inset-y-0 left-0 z-50 ${open ? 'flex' : 'hidden'} w-72 shrink-0 flex-col bg-slate-950 p-5 text-white md:sticky md:top-0 md:flex md:h-screen`}>
        <button aria-label="Close menu" className="absolute right-4 top-4 md:hidden" onClick={() => setOpen(false)}>
          <X className="h-6 w-6" />
        </button>
        <Link href={logoHref} className="flex items-center gap-3 text-xl font-black">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-2xl text-white">+</span>
          <span>Gram<span className="text-blue-400">Care</span></span>
        </Link>
        <p className="mt-2 text-xs font-semibold text-slate-400">Connected Healthcare for Rural Communities</p>
        
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs">
          <span className="flex items-center gap-2 font-bold text-blue-200">
            <ShieldCheck className="h-4 w-4" />
            {roleLabels[role] || 'Authorised User'}
          </span>
          <span className="mt-1 block text-slate-400">Active session</span>
        </div>

        <nav className="mt-6 space-y-1 overflow-y-auto flex-1">
          {nav.map(([href, label, Icon]) => (
            <Link 
              onClick={() => setOpen(false)} 
              key={href} 
              href={`/${href}`} 
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                path === `/${href}` || path.startsWith(`/${href}/`) 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{navLabels[href] || label}</span>
            </Link>
          ))}
        </nav>

        <button 
          onClick={logout} 
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>Secure logout</span>
        </button>
      </aside>

      {/* Backdrop for Mobile Navigation */}
      {open && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden" 
          onClick={() => setOpen(false)} 
        />
      )}

      {/* Main Content Area */}
      <div className="min-w-0 flex-1 flex flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-7">
          <button 
            aria-label="Open menu" 
            className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 md:hidden" 
            onClick={() => setOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className={`hidden items-center gap-2 text-xs font-bold sm:flex ${online ? 'text-emerald-700' : 'text-amber-700'}`}>
            <Wifi className="h-4 w-4" />
            {online ? 'Online' : 'Offline'}
            {pending ? ` · Pending sync: ${pending}` : ' · All records synchronized'}
          </div>

          <div className="ml-auto flex items-center gap-2">
            <label className="sr-only" htmlFor="language-select">Interface language</label>
            <select 
              id="language-select" 
              value={language} 
              onChange={event => setLanguage(event.target.value as typeof language)} 
              className="max-w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-blue-600"
            >
              {languageOptions.map(option => (
                <option value={option.code} key={option.code}>{option.label}</option>
              ))}
            </select>
            
            <Link 
              aria-label="Notifications" 
              href="/notifications" 
              className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 transition"
            >
              <Bell className="h-4 w-4" />
            </Link>

            <span className="hidden rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-black text-white sm:block">
              {roleLabels[role] || 'User'}
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-7 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
