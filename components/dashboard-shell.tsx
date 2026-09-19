'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { GramRole, roleLabels } from '@/lib/grams-data';
import { currentRole } from '@/lib/auth';
import { languageOptions } from '@/lib/i18n/translations';
import { useSettings } from '@/lib/context/settings-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { Bell, BookOpen, CalendarDays, ClipboardList, FileText, HeartPulse, LayoutDashboard, LogOut, Map, Menu, ShieldCheck, Users, Wifi, X } from 'lucide-react';
import { syncEngine } from '@/lib/offline/sync-engine';

type NavItem = {
  href: string;
  label: string;
  icon: any;
};

function getRoleNav(role: GramRole, t: (key: string, fallback?: string) => string): NavItem[] {
  switch (role) {
    case 'central':
      return [
        { href: 'dashboard', label: t('navCentralDashboard', 'Central Authority Dashboard'), icon: LayoutDashboard },
        { href: 'patients', label: t('navAllPatientData', 'All Patient Data'), icon: Users },
        { href: 'resources', label: t('navEquipmentDemands', 'Equipment & Resource Demands'), icon: ClipboardList },
        { href: 'feedback', label: t('navFeedbackSection', 'Feedback Section'), icon: FileText },
        { href: 'complaints', label: t('navComplaintBox', 'Complaint Box'), icon: Bell },
        { href: 'map', label: t('navAreaLocations', 'Area & PHC Locations'), icon: Map }
      ];
    case 'head':
      return [
        { href: 'dashboard', label: t('navAreaDashboard', 'Area PHC Dashboard'), icon: LayoutDashboard },
        { href: 'patients', label: t('navAreaPatientsDoctors', 'Area Patients & Doctors'), icon: Users },
        { href: 'resources', label: t('navDemandResources', 'Demand Resources'), icon: ClipboardList },
        { href: 'outbreaks', label: t('navAreaOutbreaks', 'Area Outbreaks & Camps'), icon: HeartPulse }
      ];
    case 'worker':
      return [
        { href: 'dashboard', label: t('navPhcCareDashboard', 'PHC Care Dashboard'), icon: LayoutDashboard },
        { href: 'patients', label: t('navRegisterPatients', 'Register & Patients'), icon: Users },
        { href: 'assessment', label: t('navRiskScreening', 'Risk Screening'), icon: HeartPulse },
        { href: 'follow-ups', label: t('navFollowUpsTreatment', 'Follow-ups & Treatment'), icon: CalendarDays },
        { href: 'maternal-care', label: t('navMaternalChildCare', 'Maternal & Child Care'), icon: BookOpen }
      ];
    case 'patient':
      return [
        { href: 'patient-dashboard', label: t('navMyHealthDashboard', 'My Health Dashboard'), icon: LayoutDashboard },
        { href: 'map', label: t('navNearbyDoctors', 'Nearby Doctors & PHCs'), icon: Map },
        { href: 'health-education', label: t('navCartoonGuidance', 'Cartoon Guidance Videos'), icon: BookOpen },
        { href: 'referrals', label: t('navCareAppointments', 'Care Appointments'), icon: CalendarDays },
        { href: 'complaints', label: t('navComplaintBox', 'Complaint Box'), icon: Bell },
        { href: 'feedback', label: t('navFeedbackSection', 'Feedback Section'), icon: FileText }
      ];
    default:
      return [
        { href: 'dashboard', label: t('navDashboard', 'Dashboard'), icon: LayoutDashboard },
        { href: 'patients', label: t('navPatients', 'Patients'), icon: Users },
        { href: 'referrals', label: t('navReferrals', 'Referrals'), icon: ClipboardList },
        { href: 'health-education', label: t('navCartoonGuidance', 'Health Guidance'), icon: BookOpen }
      ];
  }
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useSettings();
  const { t } = useTranslation();
  const [role, setRole] = useState<GramRole>('central');
  const [open, setOpen] = useState(false);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);

  useEffect(() => {
    currentRole().then(found => {
      if (found) {
        setRole(found);
      } else {
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

  const nav = getRoleNav(role, t);

  async function logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('override_role');
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
        <p className="mt-2 text-xs font-semibold text-slate-400">{t('connectedHealthcareTag', 'Connected Healthcare for Rural Communities')}</p>
        
        <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900 p-3 text-xs">
          <span className="flex items-center gap-2 font-bold text-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-400" />
            {roleLabels[role] || 'Authorised User'}
          </span>
          <span className="mt-1 block text-slate-400">{t('roleWorkspace', 'Role-aware limited workspace')}</span>
        </div>

        <nav className="mt-6 space-y-1.5 overflow-y-auto flex-1">
          {nav.map(({ href, label, icon: Icon }) => {
            const isSelected = path === `/${href}` || (href === 'dashboard' && path === '/dashboard') || (href === 'patient-dashboard' && path === '/patient-dashboard');
            return (
              <Link 
                onClick={() => setOpen(false)} 
                key={href} 
                href={`/${href}`} 
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <button 
          onClick={logout} 
          className="mt-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-300 hover:bg-rose-500/20 hover:text-rose-200 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('secureLogout', 'Secure logout')}</span>
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
            {online ? t('online', 'Online') : t('offline', 'Offline')}
            {pending ? ` · Pending sync: ${pending}` : ` · ${t('allSynced', 'All records synchronized')}`}
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

            <select 
              value={role} 
              onChange={async (e) => {
                const newRole = e.target.value as GramRole;
                const dbRoleMap: Record<string, string> = {
                  central: 'central_authority',
                  head: 'phc_head',
                  worker: 'phc_worker',
                  patient: 'patient'
                };
                const dbRole = dbRoleMap[newRole] || 'central_authority';
                if (typeof window !== 'undefined') {
                  document.cookie = `override_role=${newRole}; path=/; max-age=31536000`;
                  document.cookie = `gramcare_role=${dbRole}; path=/; max-age=31536000`;
                  localStorage.setItem('override_role', newRole);
                  localStorage.setItem('gramcare_role', dbRole);
                  localStorage.setItem('demo_role', dbRole);
                }
                const { supabase } = await import('@/lib/supabase/client');
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                  await supabase.from('users').upsert({ id: user.id, role: dbRole });
                }
                setRole(newRole);
                const targetPath = newRole === 'patient' ? '/patient-dashboard' : '/dashboard';
                window.location.href = targetPath;
              }}
              className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-xs font-black text-white cursor-pointer border-none outline-none shadow-sm hover:bg-blue-700 transition"
              title="Switch Active Demo Role"
            >
              <option value="central" className="bg-slate-900 text-white">👑 Central Authority</option>
              <option value="head" className="bg-slate-900 text-white">🏢 Area PHC Head</option>
              <option value="worker" className="bg-slate-900 text-white">👩‍⚕️ Health Worker</option>
              <option value="patient" className="bg-slate-900 text-white">👤 Patient Account</option>
            </select>
          </div>
        </header>

        <main className="p-4 sm:p-7 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
