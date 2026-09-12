import { describe, expect, it } from 'vitest'

import { ageFromIsoDateOnly, isAtLeast18, parseIsoDateOnly } from './age'

describe('parseIsoDateOnly', () => {
  it('accepts a real calendar date', () => {
    const date = parseIsoDateOnly('2000-02-29')
    expect(date?.toISOString()).toBe('2000-02-29T00:00:00.000Z')
  })

  it('rejects impossible dates and junk', () => {
    expect(parseIsoDateOnly('2026-02-29')).toBeNull()
    expect(parseIsoDateOnly('12/04/2000')).toBeNull()
    expect(parseIsoDateOnly('')).toBeNull()
  })
})

describe('isAtLeast18', () => {
  const now = new Date('2026-09-12T12:00:00.000Z')

  it('accepts an 18th birthday on the day', () => {
    expect(isAtLeast18('2008-09-12', now)).toBe(true)
  })

  it('rejects the day before the 18th birthday', () => {
    expect(isAtLeast18('2008-09-13', now)).toBe(false)
  })

  it('rejects invalid self-reports', () => {
    expect(isAtLeast18('not-a-date', now)).toBe(false)
    expect(ageFromIsoDateOnly('2008-09-13', now)).toBe(17)
  })
})
