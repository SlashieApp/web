import { describe, expect, it } from 'vitest'

import { REPORT_REASON_VALUES, reportFormSchema } from './reportFormSchema'

describe('reportFormSchema', () => {
  it('includes the closed-beta abuse categories (BE-40 enum)', () => {
    expect(REPORT_REASON_VALUES).toEqual([
      'SPAM',
      'HARASSMENT',
      'ILLEGAL_OR_PROHIBITED',
      'SCAM',
      'OTHER',
    ])
  })

  it('requires a BE reason enum and caps details at 2000', () => {
    expect(
      reportFormSchema.safeParse({ reason: 'SPAM', details: '' }).success,
    ).toBe(true)
    expect(
      reportFormSchema.safeParse({ reason: 'misleading', details: '' }).success,
    ).toBe(false)
    expect(
      reportFormSchema.safeParse({
        reason: 'OTHER',
        details: 'x'.repeat(2001),
      }).success,
    ).toBe(false)
  })

  it('requires a reason', () => {
    const result = reportFormSchema.safeParse({ reason: '', details: '' })
    expect(result.success).toBe(false)
  })

  it('accepts an illegal/prohibited report', () => {
    expect(
      reportFormSchema.safeParse({
        reason: 'ILLEGAL_OR_PROHIBITED',
        details: 'Asks for work that is not legal.',
      }).success,
    ).toBe(true)
  })
})
