import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

import { formatMessage, loadPageI11n } from './loadPageI11n'
import {
  API_TO_LOCALE,
  LOCALE_TO_API,
  isAppLocale,
  localeFromApi,
} from './locales'
import {
  localeFromPathname,
  stripLocalePrefix,
  swapLocaleInPath,
  withLocale,
} from './navigation'

describe('locales', () => {
  it('maps GraphQL language enums', () => {
    expect(LOCALE_TO_API['zh-hk']).toBe('ZH_TW')
    expect(API_TO_LOCALE.ZH_TW).toBe('zh-hk')
    expect(localeFromApi('EN')).toBe('en')
    expect(isAppLocale('zh-hk')).toBe(true)
    expect(isAppLocale('zh-TW')).toBe(false)
  })
})

describe('navigation', () => {
  it('strips and prefixes locale slugs', () => {
    expect(stripLocalePrefix('/en/pricing')).toBe('/pricing')
    expect(stripLocalePrefix('/zh-hk')).toBe('/')
    expect(withLocale('zh-hk', '/pricing')).toBe('/zh-hk/pricing')
    expect(withLocale('en', '/')).toBe('/en')
    expect(withLocale('en', '/search?mode=tasks')).toBe('/en/search?mode=tasks')
    expect(localeFromPathname('/zh-hk/about')).toBe('zh-hk')
    expect(swapLocaleInPath('/en/pricing', 'zh-hk')).toBe('/zh-hk/pricing')
  })
})

describe('loadPageI11n', () => {
  const bag = {
    en: { title: 'Hello', body: 'World {name}' },
    zh_hk: { title: '你好', body: '世界 {name}' },
  }

  it('picks locale bundle and formats messages', () => {
    expect(loadPageI11n(bag, 'zh-hk').title).toBe('你好')
    expect(
      formatMessage(loadPageI11n(bag, 'en').body, { name: 'Slashie' }),
    ).toBe('World Slashie')
  })
})

describe('marketing page dictionaries', () => {
  const requiredDictionaries = [
    'src/i18n/chrome.i11n.json',
    'src/components/Header/i11n.json',
    'src/app/(dashboard)/i11n.json',
    'src/app/(marketing)/i11n.chrome.json',
    'src/app/(marketing)/i11n.json',
    'src/app/(marketing)/pricing/i11n.json',
    'src/app/(marketing)/about/i11n.json',
    'src/app/(marketing)/cookies/i11n.json',
    'src/app/(marketing)/privacy/i11n.json',
    'src/app/(marketing)/terms/i11n.json',
  ]

  it.each(requiredDictionaries)(
    '%s contains en and zh_hk bundles',
    (relativePath) => {
      const absolutePath = join(process.cwd(), relativePath)

      expect(existsSync(absolutePath), `${relativePath} should exist`).toBe(
        true,
      )

      const dictionary = JSON.parse(
        readFileSync(absolutePath, 'utf8'),
      ) as Record<string, unknown>
      expect(dictionary.en, `${relativePath} should include en`).toBeTruthy()
      expect(
        dictionary.zh_hk,
        `${relativePath} should include zh_hk`,
      ).toBeTruthy()
    },
  )
})
