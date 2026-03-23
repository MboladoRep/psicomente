'use client';

import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';

export function LanguageSelector() {
  const { locale, setLocale, locales } = useTranslation();

  return (
    <div className="flex items-center gap-1">
      {locales.map((loc) => (
        <Button
          key={loc}
          variant={locale === loc ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setLocale(loc)}
          className="gap-1 px-2"
        >
          {loc === 'es' ? '🇪🇸' : '🇬🇧'}
          <span className="hidden sm:inline">{loc.toUpperCase()}</span>
          {locale === loc && <Check className="h-3 w-3" />}
        </Button>
      ))}
    </div>
  );
}
