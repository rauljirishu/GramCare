'use client';

import { useSettings } from '@/lib/context/settings-context';
import { translations } from './translations';

export function useTranslation() {
  const { language } = useSettings();

  const t = (key: string): string => {
    const entry = translations[key];
    if (!entry) return key;
    return entry[language] || entry.en || key;
  };

  return { t, language };
}
