'use client';

import { useState } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { useSettings } from '@/lib/context/settings-context';
import { useTranslation } from '@/lib/i18n/use-translation';
import { supabase } from '@/lib/supabase/client';
import type { AppTheme, AppFontSize } from '@/lib/context/settings-context';
import { 
  Sun, 
  Moon, 
  Globe, 
  Eye, 
  Bell, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Sliders,
  Type,
  Maximize2,
  X
} from 'lucide-react';

export default function SettingsPage() {
  const { t } = useTranslation();
  const { 
    theme, setTheme, 
    language, setLanguage, 
    fontSize, setFontSize, 
    highContrast, setHighContrast, 
    reducedMotion, setReducedMotion, 
    notificationPrefs, setNotificationPrefs 
  } = useSettings();

  const [activeTab, setActiveTab] = useState<'appearance' | 'language' | 'accessibility' | 'notifications' | 'privacy'>('appearance');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Password Modal State
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passBusy, setPassBusy] = useState(false);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'error');
      return;
    }

    setPassBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPassBusy(false);
      setPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
      showToast('Password updated successfully.', 'success');
    } catch {
      setPassBusy(false);
      showToast('Unable to update password. Please try again.', 'error');
    }
  };

  return (
    <DashboardShell>
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl p-4 text-sm font-bold shadow-2xl animate-in slide-in-from-bottom-5 duration-200 ${
          toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
        }`}>
          {toast.type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-100 dark:bg-indigo-950 px-3.5 py-1.5 text-xs font-extrabold text-indigo-800 dark:text-indigo-300">
          <Sliders className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>{t('settingsTitle')}</span>
        </div>
        <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight sm:text-4xl">
          {t('settingsTitle')}
        </h1>
        <p className="mt-1 text-base leading-7 text-slate-600 dark:text-slate-400">
          {t('settingsSubtitle')}
        </p>
      </header>

      {/* Settings Navigation Tabs */}
      <div className="mb-6 flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 text-xs font-extrabold">
        {[
          { key: 'appearance', label: t('tabAppearance'), icon: <Sun className="h-4 w-4" /> },
          { key: 'language', label: t('tabLanguage'), icon: <Globe className="h-4 w-4" /> },
          { key: 'accessibility', label: t('tabAccessibility'), icon: <Eye className="h-4 w-4" /> },
          { key: 'notifications', label: t('tabNotifications'), icon: <Bell className="h-4 w-4" /> },
          { key: 'privacy', label: t('tabPrivacy'), icon: <ShieldCheck className="h-4 w-4" /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex items-center gap-2 py-3 px-4 rounded-t-2xl transition border-b-2 whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-blue-600 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 font-black shadow-xs'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* SECTION 1: APPEARANCE & THEME */}
      {activeTab === 'appearance' && (
        <section className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sun className="h-5 w-5 text-amber-500" />
              <span>{t('themeHeading')}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('themeDesc')}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { key: 'light', label: t('themeLight'), icon: <Sun className="h-6 w-6 text-amber-500" />, desc: 'Classic crisp healthcare light interface.' },
              { key: 'dark', label: t('themeDark'), icon: <Moon className="h-6 w-6 text-indigo-400" />, desc: 'Sleek dark navy background with accessible contrast.' },
              { key: 'system', label: t('themeSystem'), icon: <Sparkles className="h-6 w-6 text-blue-500" />, desc: 'Matches your device operating system setting.' },
            ].map((th) => (
              <label
                key={th.key}
                onClick={() => {
                  setTheme(th.key as AppTheme);
                  showToast(t('settingsSavedSuccess'));
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                  theme === th.key
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">
                      {th.icon}
                    </span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{th.label}</span>
                  </div>
                  <input
                    type="radio"
                    name="theme"
                    checked={theme === th.key}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-600"
                  />
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500 dark:text-slate-400 font-medium">{th.desc}</p>
              </label>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 2: LANGUAGE & REGION */}
      {activeTab === 'language' && (
        <section className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-600" />
              <span>{t('languageHeading')}</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('languageDesc')}</p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              { key: 'en', label: t('englishLabel'), sub: 'Standard English clinical terminology.' },
              { key: 'hi', label: t('hindiLabel'), sub: 'प्राकृतिक हिंदी अनुवाद और देवनगरी लिपि।' },
            ].map((lng) => (
              <label
                key={lng.key}
                onClick={() => {
                  setLanguage(lng.key as any);
                  showToast(t('settingsSavedSuccess'));
                }}
                className={`cursor-pointer rounded-2xl border-2 p-5 transition-all duration-200 ${
                  language === lng.key
                    ? 'border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 shadow-sm scale-[1.02]'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-slate-900 dark:text-slate-100 text-base">{lng.label}</span>
                  <input
                    type="radio"
                    name="language"
                    checked={language === lng.key}
                    onChange={() => {}}
                    className="h-4 w-4 accent-blue-600"
                  />
                </div>
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">{lng.sub}</p>
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-2xl bg-slate-100 dark:bg-slate-800/60 p-4 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <span className="font-extrabold block text-slate-900 dark:text-slate-100 mb-0.5">Multi-Regional Architecture</span>
            <p>{t('futureLanguages')}</p>
          </div>
        </section>
      )}

      {/* SECTION 3: ACCESSIBILITY SCALING */}
      {activeTab === 'accessibility' && (
        <section className="space-y-6">
          {/* Text Size Controls */}
          <div className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Type className="h-5 w-5 text-indigo-600" />
                <span>{t('textSizeHeading')}</span>
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Scales text readability globally across dashboard, cards, forms, and patient tables.</p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-4">
              {[
                { key: 'small', label: t('sizeSmall') },
                { key: 'default', label: t('sizeDefault') },
                { key: 'large', label: t('sizeLarge') },
                { key: 'xlarge', label: t('sizeXLarge') },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => {
                    setFontSize(s.key as AppFontSize);
                    showToast(t('settingsSavedSuccess'));
                  }}
                  className={`rounded-2xl border-2 p-4 text-center text-xs font-black transition-all ${
                    fontSize === s.key
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 shadow-sm scale-[1.02]'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-indigo-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* High Contrast & Reduced Motion Toggles */}
          <div className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <Maximize2 className="h-5 w-5 text-emerald-600" />
              <span>Contrast & Motion Preferences</span>
            </h2>

            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{t('highContrastHeading')}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('highContrastDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={highContrast}
                  onChange={(e) => {
                    setHighContrast(e.target.checked);
                    showToast(t('settingsSavedSuccess'));
                  }}
                  className="h-6 w-6 rounded accent-blue-600 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{t('reducedMotionHeading')}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">{t('reducedMotionDesc')}</p>
                </div>
                <input
                  type="checkbox"
                  checked={reducedMotion}
                  onChange={(e) => {
                    setReducedMotion(e.target.checked);
                    showToast(t('settingsSavedSuccess'));
                  }}
                  className="h-6 w-6 rounded accent-blue-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SECTION 4: NOTIFICATIONS PREFERENCES */}
      {activeTab === 'notifications' && (
        <section className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bell className="h-5 w-5 text-amber-500" />
              <span>Notification Preferences</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Control in-app alerts and future Firebase Cloud Messaging push events.</p>
          </div>

          <div className="mt-6 space-y-5">
            {[
              { key: 'high_risk', label: t('highRiskNotifs'), desc: 'Receive immediate alerts when AI assesses a patient at Critical/High risk.' },
              { key: 'referral', label: t('referralNotifs'), desc: 'Receive updates when referrals are accepted, in-transit, or completed.' },
              { key: 'follow_up', label: t('followUpNotifs'), desc: 'Reminders for scheduled patient follow-up visits and missed checkups.' },
              { key: 'system', label: t('systemNotifs'), desc: 'Offline sync status and background network updates.' },
            ].map((n) => (
              <div key={n.key} className="flex items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">{n.label}</h3>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 font-medium">{n.desc}</p>
                </div>
                <input
                  type="checkbox"
                  checked={(notificationPrefs as any)[n.key] ?? true}
                  onChange={(e) => {
                    const updated = { ...notificationPrefs, [n.key]: e.target.checked };
                    setNotificationPrefs(updated);
                    showToast(t('settingsSavedSuccess'));
                  }}
                  className="h-6 w-6 rounded accent-blue-600 cursor-pointer shrink-0"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION 5: PRIVACY & SECURITY */}
      {activeTab === 'privacy' && (
        <section className="card p-6 sm:p-8 border-slate-200 dark:border-slate-800">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <span>Privacy & Account Security</span>
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 font-medium">Manage Supabase authentication, session security, and access credentials.</p>
          </div>

          <div className="mt-6 space-y-6 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-5 border border-slate-200 dark:border-slate-700">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  <span>{t('changePassword')}</span>
                </h3>
                <p className="mt-1 text-slate-500 dark:text-slate-400 font-medium">Update your account password securely via Supabase Auth.</p>
              </div>

              <button
                onClick={() => setPasswordModalOpen(true)}
                className="primary-btn text-xs py-2.5 px-4 font-bold shrink-0"
              >
                <span>{t('changePassword')}</span>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {passwordModalOpen && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Lock className="h-5 w-5 text-blue-600" />
                <span>{t('changePassword')}</span>
              </h2>
              <button onClick={() => setPasswordModalOpen(false)} className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 grid place-items-center">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handlePasswordChange} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">New Password *</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="input mt-1"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300">Confirm New Password *</label>
                <input
                  required
                  minLength={6}
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="input mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setPasswordModalOpen(false)} className="secondary-btn text-xs py-2">
                  {t('cancel')}
                </button>
                <button disabled={passBusy} type="submit" className="primary-btn text-xs py-2">
                  {passBusy ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
