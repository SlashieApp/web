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
