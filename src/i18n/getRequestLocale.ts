import { cookies, headers } from 'next/headers'

import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HEADER,
  isAppLocale,
} from './locales'

/**
 * Resolve the active locale for a Server Component / `generateMetadata`.
 * Prefer the middleware header (URL slug), then cookie, then default `en`.
 */
export async function getRequestLocale(): Promise<AppLocale> {
  const headerStore = await headers()
  const fromHeader = headerStore.get(LOCALE_HEADER)
  if (isAppLocale(fromHeader)) return fromHeader

  const cookieStore = await cookies()
  const fromCookie = cookieStore.get(LOCALE_COOKIE)?.value
  if (isAppLocale(fromCookie)) return fromCookie

  return DEFAULT_LOCALE
}
