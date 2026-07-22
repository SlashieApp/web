'use client'

import { type AppLocale, LOCALE_COOKIE, isAppLocale } from './locales'

const MAX_AGE_SECONDS = 60 * 60 * 24 * 365

export function readLocaleCookie(): AppLocale | null {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`${LOCALE_COOKIE}=`))
  if (!match) return null
  const value = match.split('=').slice(1).join('=')
  return isAppLocale(value) ? value : null
}

export function writeLocaleCookie(locale: AppLocale): void {
  if (typeof document === 'undefined') return
  const secure =
    typeof window !== 'undefined' && window.location.protocol === 'https:'
      ? '; Secure'
      : ''
  document.cookie = `${LOCALE_COOKIE}=${locale}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`
}
