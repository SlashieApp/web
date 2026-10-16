import { describe, expect, it } from 'vitest'

import { verificationErrorText } from './verificationError'

const errors = { INVALID_CREDENTIALS: 'That password is incorrect.' }

describe('verification error copy', () => {
  it('uses the copy for a known API code', () => {
    const error = { errors: [{ message: 'INVALID_CREDENTIALS' }] }
    expect(verificationErrorText(errors, error, 'fallback')).toBe(
      'That password is incorrect.',
    )
  })

  it('falls back instead of showing raw API text', () => {
    const error = { errors: [{ message: 'Unexpected token at line 1' }] }
    expect(verificationErrorText(errors, error, 'fallback')).toBe('fallback')
    expect(
      verificationErrorText(errors, new TypeError('boom'), 'fallback'),
    ).toBe('fallback')
  })
})
