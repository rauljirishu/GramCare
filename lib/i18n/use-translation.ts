import { useSettings } from '@/lib/context/settings-context';
import { translations } from './translations';
import { uiLabels, labels, dashboardTranslations } from './ui-labels';

export function useTranslation() {
  const { language } = useSettings();

  const t = (key: string, fallback?: string): string => {
    // 1. Direct translation entry
    const entry = translations[key];
    if (entry && entry[language]) {
      return entry[language]!;
    }
    // 2. Language-specific UI label (before merging default English)
    const langLabels = labels[language] as Record<string, string> | undefined;
    if (langLabels && langLabels[key]) {
      return langLabels[key];
    }
    const dashLabels = dashboardTranslations[language] as Record<string, string> | undefined;
    if (dashLabels && dashLabels[key]) {
      return dashLabels[key];
    }
    // 3. Fallback to English entry in translations
    if (entry && entry.en) {
      return entry.en;
    }
    // 4. Default english uiLabels fallback
    const labelsObj = uiLabels('en') as Record<string, string>;
    if (labelsObj && labelsObj[key]) {
      return labelsObj[key];
    }
    return fallback || key;
  };

  return { t, language };
}

