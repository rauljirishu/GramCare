'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { SupportedLanguage } from '@/lib/i18n/translations';

export type AppTheme = 'light' | 'dark' | 'system';
export type AppFontSize = 'small' | 'default' | 'large' | 'xlarge';

export interface NotificationPreferences {
  referrals: boolean;
  follow_ups: boolean;
  high_risk: boolean;
  system: boolean;
}

export interface SettingsState {
  theme: AppTheme;
  language: SupportedLanguage;
  fontSize: AppFontSize;
  highContrast: boolean;
  reducedMotion: boolean;
  notificationPrefs: NotificationPreferences;
}

interface SettingsContextType extends SettingsState {
  setTheme: (theme: AppTheme) => void;
  setLanguage: (lang: SupportedLanguage) => void;
  setFontSize: (size: AppFontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setReducedMotion: (enabled: boolean) => void;
  setNotificationPrefs: (prefs: NotificationPreferences) => void;
  updateSettings: (partial: Partial<SettingsState>) => void;
}

const DEFAULT_SETTINGS: SettingsState = {
  theme: 'light',
  language: 'en',
  fontSize: 'default',
  highContrast: false,
  reducedMotion: false,
  notificationPrefs: {
    referrals: true,
    follow_ups: true,
    high_risk: true,
    system: true
  }
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [mounted, setMounted] = useState(false);

  // 1. Initial Load from localStorage & Supabase
  useEffect(() => {
    try {
      const stored = localStorage.getItem('gramcare_settings');
      if (stored) {
        setSettings(prev => ({ ...prev, ...JSON.parse(stored) }));
      }
    } catch {
      // Fallback
    }

    setMounted(true);

    // Try fetching synced Supabase preferences if logged in
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: pref } = await supabase.from('user_preferences').select('*').eq('user_id', user.id).single();
          if (pref) {
            const fetched: Partial<SettingsState> = {
              theme: (pref.theme as AppTheme) || 'light',
              language: (pref.language as SupportedLanguage) || 'en',
              fontSize: (pref.font_size as AppFontSize) || 'default',
              highContrast: !!pref.high_contrast,
              reducedMotion: !!pref.reduced_motion,
              notificationPrefs: pref.notification_preferences || DEFAULT_SETTINGS.notificationPrefs
            };
            setSettings(prev => {
              const updated = { ...prev, ...fetched };
              localStorage.setItem('gramcare_settings', JSON.stringify(updated));
              return updated;
            });
          }
        }
      } catch {
        // Fallback
      }
    })();
  }, []);

  // 2. Apply root DOM attributes and CSS variables whenever settings change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;

    // Theme (Light / Dark / System)
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = settings.theme === 'dark' || (settings.theme === 'system' && systemPrefersDark);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Font Size Scaling Attribute
    root.setAttribute('data-font-size', settings.fontSize);

    // High Contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Reduced Motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Language Attribute
    root.setAttribute('lang', settings.language);

    // Save to localStorage
    try {
      localStorage.setItem('gramcare_settings', JSON.stringify(settings));
    } catch {
      // Fallback
    }
  }, [settings]);

  // Sync back to Supabase
  const syncToSupabase = async (newSettings: SettingsState) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_preferences').upsert({
          user_id: user.id,
          theme: newSettings.theme,
          language: newSettings.language,
          font_size: newSettings.fontSize,
          high_contrast: newSettings.highContrast,
          reduced_motion: newSettings.reducedMotion,
          notification_preferences: newSettings.notificationPrefs,
          updated_at: new Date().toISOString()
        });
      }
    } catch {
      // Fallback
    }
  };

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings(prev => {
      const next = { ...prev, ...partial };
      syncToSupabase(next);
      return next;
    });
  };

  const value: SettingsContextType = {
    ...settings,
    setTheme: (theme) => updateSettings({ theme }),
    setLanguage: (language) => updateSettings({ language }),
    setFontSize: (fontSize) => updateSettings({ fontSize }),
    setHighContrast: (highContrast) => updateSettings({ highContrast }),
    setReducedMotion: (reducedMotion) => updateSettings({ reducedMotion }),
    setNotificationPrefs: (notificationPrefs) => updateSettings({ notificationPrefs }),
    updateSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
