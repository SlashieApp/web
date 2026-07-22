export const APP_LOCALES = ['en', 'zh-TW'] as const
export type AppLocale = (typeof APP_LOCALES)[number]

export type GraphqlUserLanguage = 'EN' | 'ZH_TW'

export const DEFAULT_LOCALE: AppLocale = 'en'
export const LOCALE_COOKIE_NAME = 'NEXT_LOCALE'
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const GRAPHQL_LANGUAGE_BY_LOCALE = {
  en: 'EN',
  'zh-TW': 'ZH_TW',
} as const satisfies Record<AppLocale, GraphqlUserLanguage>

const LOCALE_BY_GRAPHQL_LANGUAGE = {
  EN: 'en',
  ZH_TW: 'zh-TW',
} as const satisfies Record<GraphqlUserLanguage, AppLocale>

export function isAppLocale(locale: unknown): locale is AppLocale {
  return APP_LOCALES.includes(locale as AppLocale)
}

export function normalizeLocale(locale: unknown): AppLocale {
  if (typeof locale !== 'string') return DEFAULT_LOCALE

  const normalized = locale.trim().replace('_', '-').toLowerCase()
  if (normalized === 'zh-tw') return 'zh-TW'
  if (normalized === 'en') return 'en'
  return DEFAULT_LOCALE
}

export function appLocaleToGraphqlLanguage(
  locale: AppLocale,
): GraphqlUserLanguage {
  return GRAPHQL_LANGUAGE_BY_LOCALE[locale]
}

export function graphqlLanguageToAppLocale(
  language: GraphqlUserLanguage | string | null | undefined,
): AppLocale {
  if (language === 'EN' || language === 'ZH_TW') {
    return LOCALE_BY_GRAPHQL_LANGUAGE[language]
  }
  return DEFAULT_LOCALE
}

export function buildLocaleCookie(locale: AppLocale): string {
  return [
    `${LOCALE_COOKIE_NAME}=${encodeURIComponent(locale)}`,
    'Path=/',
    `Max-Age=${LOCALE_COOKIE_MAX_AGE}`,
    'SameSite=Lax',
  ].join('; ')
}

export function getLocaleFromCookieHeader(
  cookieHeader: string | null | undefined,
): AppLocale {
  if (!cookieHeader) return DEFAULT_LOCALE

  const localeCookie = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${LOCALE_COOKIE_NAME}=`))

  if (!localeCookie) return DEFAULT_LOCALE

  const [, value] = localeCookie.split('=')
  return normalizeLocale(decodeURIComponent(value ?? ''))
}
