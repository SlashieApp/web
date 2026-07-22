import { type AppLocale, DEFAULT_LOCALE, LOCALES, isAppLocale } from './locales'

/**
 * Strip a leading locale segment from a pathname.
 * `/en/pricing` → `/pricing`; `/zh-hk` → `/`
 */
export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split('/')
  if (parts.length >= 2 && isAppLocale(parts[1])) {
    const rest = parts.slice(2).join('/')
    return rest ? `/${rest}` : '/'
  }
  return pathname || '/'
}

/** Read locale from a browser pathname (`/zh-hk/about` → `zh-hk`). */
export function localeFromPathname(pathname: string): AppLocale {
  const maybe = pathname.split('/')[1]
  return isAppLocale(maybe) ? maybe : DEFAULT_LOCALE
}

/**
 * Prefix an internal href with the locale slug.
 * External URLs and hash-only links are returned unchanged.
 * Query strings and hashes are preserved.
 */
export function withLocale(locale: AppLocale, href: string): string {
  if (!href || href.startsWith('http://') || href.startsWith('https://')) {
    return href
  }
  if (href.startsWith('mailto:') || href.startsWith('tel:')) return href
  if (href.startsWith('#')) return href

  const hashIndex = href.indexOf('#')
  const queryIndex = href.indexOf('?')
  let path = href
  let suffix = ''

  if (hashIndex >= 0) {
    suffix = href.slice(hashIndex)
    path = href.slice(0, hashIndex)
  }
  if (queryIndex >= 0 && (hashIndex < 0 || queryIndex < hashIndex)) {
    const qEnd = hashIndex >= 0 ? hashIndex : href.length
    suffix = href.slice(queryIndex, qEnd) + suffix
    path = href.slice(0, queryIndex)
  }

  const bare = stripLocalePrefix(path || '/')
  const localized =
    bare === '/'
      ? `/${locale}`
      : `/${locale}${bare.startsWith('/') ? bare : `/${bare}`}`
  return `${localized}${suffix}`
}

/** Swap the locale prefix on the current path (keeps query/hash). */
export function swapLocaleInPath(
  pathname: string,
  nextLocale: AppLocale,
  search = '',
): string {
  const bare = stripLocalePrefix(pathname)
  const base = withLocale(nextLocale, bare)
  return search
    ? `${base}${search.startsWith('?') ? search : `?${search}`}`
    : base
}

export function isLocalePrefixed(pathname: string): boolean {
  const maybe = pathname.split('/')[1]
  return (LOCALES as readonly string[]).includes(maybe ?? '')
}
