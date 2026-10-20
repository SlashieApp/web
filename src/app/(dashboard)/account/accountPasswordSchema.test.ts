import { describe, expect, it } from 'vitest'

import { createAccountPasswordSchema } from './accountPasswordSchema'

const issues = (mode: 'change' | 'set', values: Record<string, string>) => {
  const result = createAccountPasswordSchema(mode).safeParse({
    currentPassword: '',
    ...values,
  })
  return result.success ? [] : result.error.issues.map((issue) => issue.message)
}

describe('set a password', () => {
  it('takes 8+ characters typed twice, with no current password', () => {
    expect(
      issues('set', {
        newPassword: 'longenough',
        confirmPassword: 'longenough',
      }),
    ).toEqual([])
  })

  it('refuses a short or mismatched password', () => {
    expect(
      issues('set', { newPassword: 'short', confirmPassword: 'other' }),
    ).toEqual(['passwordTooShort', 'passwordsDontMatch'])
  })
})

describe('change the password', () => {
  it('needs the current password', () => {
    expect(
      issues('change', {
        newPassword: 'longenough',
        confirmPassword: 'longenough',
      }),
    ).toEqual(['currentRequired'])
  })

  it('refuses the same password again', () => {
    expect(
      issues('change', {
        currentPassword: 'longenough',
        newPassword: 'longenough',
        confirmPassword: 'longenough',
      }),
    ).toEqual(['passwordUnchanged'])
  })

  it('takes a new 8+ character password', () => {
    expect(
      issues('change', {
        currentPassword: 'old-password',
        newPassword: 'new-password',
        confirmPassword: 'new-password',
      }),
    ).toEqual([])
  })
})
