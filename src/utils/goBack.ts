'use client'

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

import { useLocalizedHref } from '@/i18n/LocaleProvider'
import { APP_HOME, MARKETING_HOME } from '@/utils/appRoutes'
import { getAuthToken } from '@/utils/auth'

/**
 * Where Back lands when nothing is behind the page (opened from a link, or a
 * fresh start): Search signed in, the home page for a visitor. The same split
 * as the site's entry redirect (`proxy`), which also goes by the auth cookie.
 */
export function backFallbackHref(
  signedIn: boolean,
): typeof APP_HOME | typeof MARKETING_HOME {
  return signedIn ? APP_HOME : MARKETING_HOME
}

/**
 * Back for every page that is not a nav page (FE-445): the page before, or
 * `fallback` (default `backFallbackHref`) when this one was opened straight
 * away. `fallback` is read when Back is pressed, so it can look at the cookie
 * and the address.
 */
export function useGoBack(fallback?: () => string) {
  const router = useRouter()
  const localize = useLocalizedHref()

  return useCallback(() => {
    if (window.history.length > 1) router.back()
    else {
      const href = fallback?.() ?? backFallbackHref(Boolean(getAuthToken()))
      router.push(localize(href))
    }
  }, [fallback, localize, router])
}
