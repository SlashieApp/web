import { describe, expect, test } from 'vitest'

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_NAME,
  appLocaleToGraphqlLanguage,
  buildLocaleCookie,
  getLocaleFromCookieHeader,
  graphqlLanguageToAppLocale,
  isAppLocale,
  normalizeLocale,
} from './locales'

describe('i18n locale helpers', () => {
  test('normalizes supported locales and falls back to English', () => {
    expect(normalizeLocale('en')).toBe('en')
    expect(normalizeLocale('zh-TW')).toBe('zh-TW')
    expect(normalizeLocale('zh_tw')).toBe('zh-TW')
    expect(normalizeLocale('ZH-TW')).toBe('zh-TW')
    expect(normalizeLocale('fr')).toBe(DEFAULT_LOCALE)
    expect(normalizeLocale(null)).toBe(DEFAULT_LOCALE)
  })

  test('guards supported app locales', () => {
    expect(isAppLocale('en')).toBe(true)
    expect(isAppLocale('zh-TW')).toBe(true)
    expect(isAppLocale('zh')).toBe(false)
  })

  test('maps app locales to GraphQL language enum values', () => {
    expect(appLocaleToGraphqlLanguage('en')).toBe('EN')
    expect(appLocaleToGraphqlLanguage('zh-TW')).toBe('ZH_TW')
    expect(graphqlLanguageToAppLocale('EN')).toBe('en')
    expect(graphqlLanguageToAppLocale('ZH_TW')).toBe('zh-TW')
    expect(graphqlLanguageToAppLocale(null)).toBe(DEFAULT_LOCALE)
  })

  test('reads and builds the locale cookie', () => {
    const cookie = buildLocaleCookie('zh-TW')

    expect(cookie).toContain(`${LOCALE_COOKIE_NAME}=zh-TW`)
    expect(cookie).toContain('Path=/')
    expect(cookie).toContain('SameSite=Lax')
    expect(getLocaleFromCookieHeader(cookie)).toBe('zh-TW')
    expect(getLocaleFromCookieHeader(`${LOCALE_COOKIE_NAME}=en; other=1`)).toBe(
      'en',
    )
    expect(getLocaleFromCookieHeader('other=1')).toBe(DEFAULT_LOCALE)
  })
})
