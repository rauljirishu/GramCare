'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { useSettings } from '@/lib/context/settings-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { OfflineStatusBar } from '@/components/offline-status-bar';
import { 
  Sun, 
  Moon, 
  Globe, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';

export function DashboardHeader() {
  const router = useRouter();
  const { t } = useTranslation();
  const { theme, setTheme, language, setLanguage } = useSettings();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [userInfo, setUserInfo] = useState<{
    name: string;
    role: string;
    avatarUrl?: string;
  }>({
    name: 'Doctor User',
    role: 'doctor'
  });

  useEffect(() => {
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase.from('users').select('name, role, avatar_url').eq('id', user.id).single();
          if (profile) {
            setUserInfo({
              name: profile.name || user.user_metadata?.name || 'Doctor User',
              role: profile.role || 'doctor',
              avatarUrl: profile.avatar_url || undefined
            });
          } else if (user.user_metadata?.name) {
            setUserInfo({
              name: user.user_metadata.name,
              role: user.user_metadata.requested_role || 'doctor'
            });
          }
        }
      } catch {
        // Fallback
      }
    })();
  }, []);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'hi' : 'en');
  };

  const initials = userInfo.name ? userInfo.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'DR';

  return (
    <div className="w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Offline Status Bar integrated on top */}
      <OfflineStatusBar />

      {/* Main Header Toolbar */}
      <div className="px-4 py-3 sm:px-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {userInfo.role === 'admin' ? <ShieldCheck className="h-3.5 w-3.5" /> : <Stethoscope className="h-3.5 w-3.5" />}
            <span className="capitalize">{userInfo.role} Session</span>
          </span>
        </div>

        {/* Action Controls & User Dropdown */}
        <div className="flex items-center gap-3">
          {/* Quick Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'EN'}</span>
          </button>

          {/* Quick Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            title="Toggle Light/Dark Theme"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* User Profile Area Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-1.5 pr-3 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {userInfo.avatarUrl ? (
                <img src={userInfo.avatarUrl} alt={userInfo.name} className="h-8 w-8 rounded-xl object-cover" />
              ) : (
                <div className="grid h-8 w-8 place-items-center rounded-xl bg-blue-600 text-white font-black text-xs">
                  {initials}
                </div>
              )}
              <div className="hidden md:block text-left text-xs">
                <p className="font-extrabold text-slate-900 dark:text-slate-100 leading-tight">{userInfo.name}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 capitalize">{userInfo.role}</p>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div 
                className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-slate-900 p-2 shadow-2xl border border-slate-200 dark:border-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="font-black text-xs text-slate-900 dark:text-slate-100">{userInfo.name}</p>
                  <p className="text-[10px] text-slate-500 capitalize">{userInfo.role} Account</p>
                </div>

                <Link
                  href="/profile"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <User className="h-4 w-4 text-blue-600" />
                  <span>{t('navProfile')}</span>
                </Link>

                <Link
                  href="/settings"
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <Settings className="h-4 w-4 text-indigo-600" />
                  <span>{t('navSettings')}</span>
                </Link>

                <div className="border-t border-slate-100 dark:border-slate-800 my-1" />

                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t('navSignOut')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
