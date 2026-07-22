import {
  type AppLocale,
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  buildLocaleCookie,
  getLocaleFromCookieHeader,
  normalizeLocale,
} from './locales'

type CookieStoreLike = {
  get(name: string): { value?: string } | undefined
}

export function readLocaleCookie(
  cookieStore: CookieStoreLike | null | undefined,
): AppLocale {
  return normalizeLocale(cookieStore?.get(LOCALE_COOKIE_NAME)?.value)
}

export function getBrowserLocale(): AppLocale {
  if (typeof document === 'undefined') return DEFAULT_LOCALE
  return getLocaleFromCookieHeader(document.cookie)
}

export function writeBrowserLocaleCookie(locale: AppLocale) {
  if (typeof document === 'undefined') return
  document.cookie = buildLocaleCookie(locale)
}
