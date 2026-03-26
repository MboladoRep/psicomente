'use client';

import { Button } from '@/components/ui/button';
import { Check, Languages } from 'lucide-react';
import { useTranslation } from '@/contexts/I18nContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function LanguageSelector() {
  const { locale, setLocale, locales, localeNames, isMounted } = useTranslation();

  // Show placeholder during SSR/hydration
  if (!isMounted) {
    return (
      <Button variant="ghost" size="sm" className="gap-1 px-2" disabled>
        <Languages className="h-4 w-4" />
        <span className="hidden sm:inline">ES</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1 px-2">
          <Languages className="h-4 w-4" />
          <span className="hidden sm:inline">{locale.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Idioma / Language</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="cursor-pointer flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <span>{loc === 'es' ? '🇪🇸' : '🇬🇧'}</span>
              <span>{localeNames[loc]}</span>
            </span>
            {locale === loc && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
