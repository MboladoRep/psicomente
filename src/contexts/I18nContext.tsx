'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Locale = 'es' | 'en';

const messages = {
  es: esMessages,
  en: enMessages
} as const;

const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
};

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  localeNames: Record<Locale, string>;
  locales: Locale[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

// Helper function to get nested value from messages
function getNestedValue(obj: unknown, keys: string[]): string {
  let value = obj;
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = (value as Record<string, unknown>)[key];
    } else {
      return keys.join('.');
    }
  }
  return typeof value === 'string' ? value : keys.join('.');
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  // Initialize from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('psicomente_locale');
    if (saved === 'es' || saved === 'en') {
      setLocaleState(saved);
    } else if (navigator.language.startsWith('en')) {
      setLocaleState('en');
    }
  }, []);

  // Save locale and update DOM
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('psicomente_locale', newLocale);
    document.documentElement.lang = newLocale;
  }, []);

  // Translation function
  const t = useCallback((key: string) => {
    return getNestedValue(messages[locale], key.split('.'));
  }, [locale]);

  // Memoize context value
  const value = useMemo<I18nContextValue>(() => ({
    locale,
    setLocale,
    t,
    localeNames,
    locales: ['es', 'en']
  }), [locale, setLocale, t]);

  return (
    <I18nContext.Provider value={value}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(): I18nContextValue {
  const context = useContext(I18nContext);
  
  // Fallback for SSR/build
  if (!context) {
    return {
      locale: 'es',
      setLocale: () => {},
      t: (key) => getNestedValue(messages.es, key.split('.')),
      localeNames,
      locales: ['es', 'en']
    };
  }
  
  return context;
}

export type { Locale };
