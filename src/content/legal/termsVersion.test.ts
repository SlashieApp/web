import { describe, expect, it } from 'vitest'

import terms from '@/app/(marketing)/terms/i11n.json'

import { TERMS_VERSION, signUpConsent } from './termsVersion'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "8 July 2026" to 2026-07-08. */
function fromEnglish(date: string): string {
  const [day, month, year] = date.split(' ')
  const m = MONTHS.indexOf(month ?? '') + 1
  return `${year}-${String(m).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

/** "2026 年 7 月 8 日" to 2026-07-08. */
function fromChinese(date: string): string {
  const [year, month, day] = date.match(/\d+/g) ?? []
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

describe('Terms version sent at sign-up (FE-570)', () => {
  it('is a YYYY-MM-DD date', () => {
    expect(TERMS_VERSION).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it("is the Terms page's Last updated date, in both languages", () => {
    expect(fromEnglish(terms.en.lastUpdated)).toBe(TERMS_VERSION)
    expect(fromChinese(terms.zh_hk.lastUpdated)).toBe(TERMS_VERSION)
  })

  it('is what sign-up sends as consent', () => {
    expect(signUpConsent()).toEqual({ termsVersion: TERMS_VERSION })
  })
})
