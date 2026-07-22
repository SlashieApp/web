'use client'

import { usePathname } from 'next/navigation'
import { type ReactNode, createContext, useContext, useMemo } from 'react'

import { type AppLocale, DEFAULT_LOCALE } from '@/i18n/locales'
import { localeFromPathname, withLocale } from '@/i18n/navigation'

type LocaleContextValue = {
  locale: AppLocale
  /** Prefix an internal href with the active locale. */
  href: (path: string) => string
}

const LocaleContext = createContext<LocaleContextValue>({
  locale: DEFAULT_LOCALE,
  href: (path) => withLocale(DEFAULT_LOCALE, path),
})

export function LocaleProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/'
  const value = useMemo<LocaleContextValue>(() => {
    const locale = localeFromPathname(pathname)
    return {
      locale,
      href: (path: string) => withLocale(locale, path),
    }
  }, [pathname])

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  )
}

export function useLocale(): AppLocale {
  return useContext(LocaleContext).locale
}

/** Locale-aware href helper for client components. */
export function useLocalizedHref(): (path: string) => string {
  return useContext(LocaleContext).href
}
