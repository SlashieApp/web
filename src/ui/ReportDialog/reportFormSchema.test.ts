import { describe, expect, it } from 'vitest'

import { reportFormSchema } from './reportFormSchema'

describe('reportFormSchema', () => {
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
})
