/**
 * URL locale slugs for Slashie.
 * - `en` — English (default)
 * - `zh-hk` — Traditional Chinese (Hong Kong)
 *
 * GraphQL `UserLanguage` uses `EN` / `ZH_TW`; map at the boundary.
 */

export const LOCALES = ['en', 'zh-hk'] as const

export type AppLocale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: AppLocale = 'en'

export const LOCALE_COOKIE = 'NEXT_LOCALE'

/** Set by middleware so Server Components can read the URL locale slug. */
export const LOCALE_HEADER = 'x-slashie-locale'

/** Keys used inside colocated `i11n.json` files. */
export type I11nKey = 'en' | 'zh_hk'

export const LOCALE_TO_I11N_KEY: Record<AppLocale, I11nKey> = {
  en: 'en',
  'zh-hk': 'zh_hk',
}

export const I11N_KEY_TO_LOCALE: Record<I11nKey, AppLocale> = {
  en: 'en',
  zh_hk: 'zh-hk',
}

/** GraphQL `UserLanguage` enum values (apollo BE-38). */
export type UserLanguageApi = 'EN' | 'ZH_TW'

export const LOCALE_TO_API: Record<AppLocale, UserLanguageApi> = {
  en: 'EN',
  'zh-hk': 'ZH_TW',
}

export const API_TO_LOCALE: Record<UserLanguageApi, AppLocale> = {
  EN: 'en',
  ZH_TW: 'zh-hk',
}

export const LOCALE_LABELS: Record<AppLocale, { short: string; native: string }> =
  {
    en: { short: 'EN', native: 'English' },
    'zh-hk': { short: '繁中', native: '繁體中文' },
  }

export function isAppLocale(value: string | null | undefined): value is AppLocale {
  return value === 'en' || value === 'zh-hk'
}

export function localeFromApi(
  value: string | null | undefined,
): AppLocale | null {
  if (value === 'EN' || value === 'ZH_TW') return API_TO_LOCALE[value]
  return null
}

/** BCP 47 tag for `<html lang>` and Intl APIs. */
export function htmlLang(locale: AppLocale): string {
  return locale === 'zh-hk' ? 'zh-HK' : 'en'
}
