'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import esMessages from '@/messages/es.json';
import enMessages from '@/messages/en.json';

type Messages = typeof esMessages;
type Locale = 'es' | 'en';

const messages: Record<Locale, Messages> = {
  es: esMessages,
  en: enMessages
};

const localeNames: Record<Locale, string> = {
  es: 'Español',
  en: 'English'
};

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  localeNames: Record<Locale, string>;
  locales: Locale[];
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

// Default translation function for SSR/build
const defaultT = (key: string): string => {
  const keys = key.split('.');
  let value: unknown = messages['es'];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// Translation function factory
const createTranslationFunction = (locale: Locale) => (key: string): string => {
  const keys = key.split('.');
  let value: unknown = messages[locale];
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = (value as Record<string, unknown>)[k];
    } else {
      return key;
    }
  }
  
  return typeof value === 'string' ? value : key;
};

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [mounted, setMounted] = useState(false);

  // Initialize from localStorage or browser language
  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem('psicomente_locale') as Locale;
    if (savedLocale && (savedLocale === 'es' || savedLocale === 'en')) {
      setLocaleState(savedLocale);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'en') {
        setLocaleState('en');
      }
    }
  }, []);

  // Set locale and persist
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('psicomente_locale', newLocale);
      document.documentElement.lang = newLocale;
    }
  }, []);

  // Update document language when locale changes
  useEffect(() => {
    if (mounted && typeof document !== 'undefined') {
      document.documentElement.lang = locale;
    }
  }, [locale, mounted]);

  // Create translation function with current locale
  const t = useCallback(createTranslationFunction(locale), [locale]);

  return (
    <I18nContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      localeNames,
      locales: ['es', 'en']
    }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  
  // Return default values for SSR/build - don't throw error
  if (context === undefined) {
    return {
      locale: 'es' as Locale,
      setLocale: () => {},
      t: defaultT,
      localeNames,
      locales: ['es', 'en'] as Locale[]
    };
  }
  
  return context;
}

export type { Locale, Messages };
