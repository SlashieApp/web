'use client'

import { type AppLocale, LOCALE_COOKIE } from './locales'

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export function writeLocaleCookie(locale: AppLocale): void {
  if (typeof document === 'undefined') return
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : ''
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}
