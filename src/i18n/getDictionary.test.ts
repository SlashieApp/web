import { describe, expect, test } from 'vitest'

import {
  formatMessage,
  getDictionary,
  getLocalizedMetadata,
} from './getDictionary'

describe('i18n dictionaries', () => {
  test('returns English and Traditional Chinese marketing hero copy', () => {
    expect(getDictionary('en').landing.hero.heading).toBe(
      'Get local help. Hire with confidence.',
    )
    expect(getDictionary('zh-TW').landing.hero.heading).toBe(
      '找本地幫手，安心聘用。',
    )
  })

  test('falls back to English for missing locales', () => {
    expect(getDictionary(undefined).common.ctas.getStarted).toBe('Get started')
  })

  test('formats named parameters in translated strings', () => {
    expect(formatMessage('{count} quotes a month', { count: 3 })).toBe(
      '3 quotes a month',
    )
    expect(formatMessage('每月 {count} 個報價', { count: 3 })).toBe(
      '每月 3 個報價',
    )
  })

  test('exposes localized metadata copy', () => {
    expect(getLocalizedMetadata('en').landing.title).toContain('Slashie')
    expect(getLocalizedMetadata('zh-TW').pricing.title).toBe(
      '收費方案 | Slashie',
    )
  })
})
