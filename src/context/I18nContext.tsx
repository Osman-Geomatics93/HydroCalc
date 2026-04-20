/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export type Locale = 'en' | 'es' | 'fr' | 'ar';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: 'en',
  setLocale: () => {},
  t: (key) => key,
});

const translationCache: Partial<Record<Locale, Record<string, string>>> = {};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleStorage] = useLocalStorage<Locale>('hydro-locale', 'en');
  const [translations, setTranslations] = useState<Record<string, string>>({});

  useEffect(() => {
    if (locale === 'en') {
      // English is default — load en.json for any overrides
      import('../i18n/en.json').then((mod) => {
        const data = mod.default || mod;
        translationCache.en = data;
        setTranslations(data);
      });
      return;
    }

    if (translationCache[locale]) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTranslations(translationCache[locale]!);
      return;
    }

    // Lazy-load translation file
    const loaders: Record<string, () => Promise<{ default: Record<string, string> }>> = {
      es: () => import('../i18n/es.json'),
      fr: () => import('../i18n/fr.json'),
      ar: () => import('../i18n/ar.json'),
    };

    loaders[locale]?.().then((mod) => {
      const data = mod.default || mod;
      translationCache[locale] = data;
      setTranslations(data);
    });
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleStorage(l);
    document.documentElement.dir = l === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = l;
  }, [setLocaleStorage]);

  const t = useCallback((key: string): string => {
    return translations[key] || key;
  }, [translations]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Espanol',
  fr: 'Francais',
  ar: 'Arabic',
};
