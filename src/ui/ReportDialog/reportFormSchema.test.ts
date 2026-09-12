import { describe, expect, it } from 'vitest'

import { REPORT_REASON_VALUES, reportFormSchema } from './reportFormSchema'

describe('reportFormSchema', () => {
  it('includes the closed-beta abuse categories', () => {
    expect(REPORT_REASON_VALUES).toEqual([
      'spam',
      'harassment',
      'illegal',
      'scam',
      'safety',
      'other',
    ])
  })

  it('requires a reason', () => {
    const result = reportFormSchema.safeParse({ reason: '', details: '' })
    expect(result.success).toBe(false)
  })

  it('accepts an illegal/prohibited report', () => {
    expect(
      reportFormSchema.safeParse({
        reason: 'illegal',
        details: 'Asks for work that is not legal.',
      }).success,
    ).toBe(true)
  })
})
